"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Briefcase,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Package,
  BarChart3,
  ArrowLeft,
  Brain,
  Loader2,
  Target,
  Lightbulb,
} from "lucide-react"
import api from "@/services/api" // Seu serviço de API
import { useRouter } from "next/navigation"

// Interfaces para os dados
interface HistoricalData {
  date: string
  receitas: number
  despesas: number
  lucro: number
  vendas?: number 
}

interface PredictionData {
  date: string
  receitas: number
  despesas: number
  lucro: number
  confidence: number
}

interface AIInsight {
  type: "trend" | "prediction" | "recommendation" | "alert"
  title: string
  description: string
  confidence: number
  impact: "high" | "medium" | "low"
}

interface DashboardStats {
  totalProducts: number
  totalCategories: number
  monthlyProfit: number
  profitMargin: number 
  stockValue: number
  alerts: number
  lowStockProducts: { name: string; quantity: number; minStock: number }[]
}

export default function GraficosPage() {
  const [activeTab, setActiveTab] = useState("financeiro")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisComplete, setAnalysisComplete] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([])
  const [predictions, setPredictions] = useState<PredictionData[]>([])
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([])
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null)
  const [loadingDashboard, setLoadingDashboard] = useState(true)
  const router = useRouter()

  // Função para buscar dados do dashboard (produtos, resumo financeiro)
  const fetchDashboardData = useCallback(async () => {
    setLoadingDashboard(true)
    try {
      // Busca de produtos e resumo em paralelo
      const [productsRes, summaryRes] = await Promise.all([api.get("/products"), api.get("/api/dashboard/summary")])

      const productsData = productsRes.data
      const summaryData = summaryRes.data.summary

      const lowStockProducts = productsData
      /* eslint-disable @typescript-eslint/no-explicit-any */
        .filter((p: any) => p.quantidade_estoque < (p.min_estoque || 10))
        .map((p: any) => ({ name: p.nome, quantity: p.quantidade_estoque, minStock: p.min_estoque || 10 }))

      setDashboardData({
        totalProducts: productsData.length,
        totalCategories: new Set(productsData.map((p: any) => p.categoria)).size,
        monthlyProfit: summaryData.profit || 0,
        profitMargin: summaryData.profitMargin || 0, // Adicione isso à sua API se necessário
        stockValue: productsData.reduce((acc: number, p: any) => acc + p.quantidade_estoque * p.preco_compra, 0),
        alerts: lowStockProducts.length,
        lowStockProducts,
      })
    } catch (error) {
      console.error("Erro ao buscar dados do dashboard:", error)
      setApiError("Não foi possível carregar os dados do dashboard. Tente novamente mais tarde.")
    } finally {
      setLoadingDashboard(false)
    }
  }, [])

  // Função para análise de IA dos dados
  const analyzeWithAI = useCallback(async () => {
    setIsAnalyzing(true)
    setApiError(null)
    setAnalysisComplete(false)

    try {
      // Chama o backend que, por sua vez, chama o serviço de ML
      const response = await api.get("/api/ml/forecast", {
        params: { tipo: activeTab }
      })

      // Assumindo que a API retorna um objeto com historical, predictions e insights
      const { historical, predictions: newPredictions, insights: newInsights } = response.data

      setHistoricalData(historical)
      setPredictions(newPredictions)
      setAiInsights(newInsights)
      setAnalysisComplete(true)
    } catch (error) {
      console.error("Erro na análise de IA:", error)
      setApiError("O serviço de análise e previsão está indisponível no momento.")
    } finally {
      setIsAnalyzing(false)
    }
  }, [activeTab]) // Depende da aba ativa para buscar o tipo de previsão correto

  useEffect(() => {
    fetchDashboardData()
    analyzeWithAI()
  }, [fetchDashboardData, analyzeWithAI])

  // Função para renderizar o gráfico com previsões
  const renderEnhancedChart = () => {
    if (!analysisComplete && !isAnalyzing && historicalData.length === 0) {
      return (
        <div className="text-center py-12 text-gray-500">
          <Brain className="w-12 h-12 mx-auto mb-4" />
          <p>Dados de análise não disponíveis.</p>
          <Button onClick={analyzeWithAI} disabled={isAnalyzing} size="sm" className="mt-4">
            {isAnalyzing ? "Analisando..." : "Tentar Análise Novamente"}
          </Button>
        </div>
      )
    }

    const allData = [...historicalData, ...predictions]
    if (allData.length === 0) return null // Não renderiza nada se não houver dados

    const maxValue = Math.max(1, ...allData.map((d) => Math.max(d.receitas, d.despesas, d.lucro)))
    const chartHeight = 300
    const chartWidth = 1000
    const padding = 40

    const xStep = (chartWidth - padding * 2) / Math.max(1, allData.length - 1)
    const yScale = (chartHeight - padding * 2) / maxValue

    const createPath = (dataKey: "receitas" | "despesas" | "lucro", isPrediction = false) => {
        const startIndex = isPrediction ? historicalData.length -1 : 0;
        const dataToUse = isPrediction ? allData.slice(startIndex) : historicalData;

        if (dataToUse.length < 2) return ""; 
        
        return dataToUse
            .map((point, index) => {
                const overallIndex = startIndex + index;
                const x = padding + overallIndex * xStep;
                const y = chartHeight - padding - (point[dataKey] || 0) * yScale;
                return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
            })
            .join(" ");
    };

    return (
      <div className="w-full overflow-x-auto">
        <svg width={chartWidth} height={chartHeight} className="border rounded-lg bg-white">
          {/* Grid lines */}
          {Array.from({ length: 6 }, (_, i) => i * (maxValue / 5)).map((value) => (
            <g key={`grid-${value}`}>
              <line
                x1={padding}
                y1={chartHeight - padding - value * yScale}
                x2={chartWidth - padding}
                y2={chartHeight - padding - value * yScale}
                stroke="#f0f0f0"
              />
              <text x={padding - 10} y={chartHeight - padding - value * yScale + 5} fontSize="12" fill="#666" textAnchor="end">
                R$ {Math.round(value)}
              </text>
            </g>
          ))}

          {/* Linha vertical separando histórico de previsão */}
          {predictions.length > 0 && (
              <line
                x1={padding + (historicalData.length - 1) * xStep}
                y1={padding}
                x2={padding + (historicalData.length - 1) * xStep}
                y2={chartHeight - padding}
                stroke="#ddd"
                strokeWidth="2"
                strokeDasharray="5,5"
              />
          )}

          {/* X-axis labels */}
          {allData.map((point, index) => (
            <text
              key={`${point.date}-${index}`}
              x={padding + index * xStep}
              y={chartHeight - 10}
              fontSize="12"
              fill={index >= historicalData.length ? "#999" : "#666"}
              textAnchor="middle"
            >
              {point.date}
            </text>
          ))}

          {/* Linhas históricas */}
          <path d={createPath("receitas")} fill="none" stroke="#14b8a6" strokeWidth="2" />
          <path d={createPath("despesas")} fill="none" stroke="#f97316" strokeWidth="2" />
          <path d={createPath("lucro")} fill="none" stroke="#374151" strokeWidth="2" />

          {/* Linhas de previsão (tracejadas) */}
          <path d={createPath("receitas", true)} fill="none" stroke="#14b8a6" strokeWidth="2" strokeDasharray="5,5" opacity="0.7" />
          <path d={createPath("despesas", true)} fill="none" stroke="#f97316" strokeWidth="2" strokeDasharray="5,5" opacity="0.7" />
          <path d={createPath("lucro", true)} fill="none" stroke="#374151" strokeWidth="2" strokeDasharray="5,5" opacity="0.7" />

        </svg>

        {/* Legend */}
        <div className="flex justify-center flex-wrap gap-4 mt-4">
          <div className="flex items-center gap-2"><div className="w-3 h-3 bg-teal-500 rounded-full"></div><span className="text-sm text-teal-600">Receitas</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 bg-orange-500 rounded-full"></div><span className="text-sm text-orange-600">Despesas</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 bg-gray-600 rounded-full"></div><span className="text-sm text-gray-600">Lucro</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-px bg-gray-400 border-dashed border-t-2 flex-grow"></div><span className="text-sm text-gray-500">Previsão IA</span></div>
        </div>
      </div>
    )
  }


  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Botões de navegação */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <Briefcase className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Briefcase className="w-8 h-8 text-amber-600" />
            <h1 className="text-3xl font-bold text-gray-800">Análise e Previsões</h1>
          </div>
          <p className="text-gray-600">Visualize dados históricos e insights gerados por IA</p>
        </div>

        {/* Dashboard Cards */}
        {loadingDashboard ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array(4).fill(0).map((_, i) => (
                <Card key={i} className="animate-pulse"><CardHeader><div className="h-4 bg-gray-200 rounded w-3/4"></div></CardHeader><CardContent><div className="h-8 bg-gray-200 rounded w-1/2"></div><div className="h-3 bg-gray-200 rounded w-1/4 mt-2"></div></CardContent></Card>
            ))}
          </div>
        ) : dashboardData && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-slate-600 text-white"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total de Produtos</CardTitle><Package className="h-4 w-4" /></CardHeader><CardContent><div className="text-2xl font-bold">{dashboardData.totalProducts}</div><p className="text-xs text-slate-200">{dashboardData.totalCategories} tipos diferentes</p></CardContent></Card>
              <Card className="bg-teal-600 text-white"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Lucro do Mês</CardTitle><TrendingUp className="h-4 w-4" /></CardHeader><CardContent><div className="text-2xl font-bold">R$ {dashboardData.monthlyProfit.toFixed(2)}</div><p className="text-xs text-teal-200">+{dashboardData.profitMargin.toFixed(1)}% margem</p></CardContent></Card>
              <Card className="bg-yellow-500 text-white"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Valor do Estoque</CardTitle><DollarSign className="h-4 w-4" /></CardHeader><CardContent><div className="text-2xl font-bold">R$ {dashboardData.stockValue.toFixed(2)}</div><p className="text-xs text-yellow-200">Investimento atual</p></CardContent></Card>
              <Card className="bg-red-500 text-white"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Alertas</CardTitle><AlertTriangle className="h-4 w-4" /></CardHeader><CardContent><div className="text-2xl font-bold">{dashboardData.alerts}</div><p className="text-xs text-red-200">Produtos com estoque baixo</p></CardContent></Card>
            </div>

            {dashboardData.lowStockProducts.length > 0 && (
                <Alert className="border-red-200 bg-red-50">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                    <strong>Atenção: Estoque Baixo</strong>
                    <div className="mt-2 space-y-1">
                        {dashboardData.lowStockProducts.map((product, index) => (
                        <div key={index} className="flex justify-between items-center gap-8">
                            <span>{product.name}</span>
                            <Badge variant="destructive">{product.quantity} restantes (mín: {product.minStock})</Badge>
                        </div>
                        ))}
                    </div>
                    </AlertDescription>
                </Alert>
            )}
          </>
        )}
        
        {apiError && (
             <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{apiError}</AlertDescription>
            </Alert>
        )}

        {isAnalyzing && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="flex items-center gap-3 p-4">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              <div>
                <h4 className="font-medium text-blue-800">Analisando dados com IA...</h4>
                <p className="text-sm text-blue-600">Buscando previsões e insights no nosso servidor.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {analysisComplete && aiInsights.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {aiInsights.map((insight, index) => (
              <Card key={index} className={`border-l-4 ${ insight.type === "trend" ? "border-l-green-500 bg-green-50" : insight.type === "alert" ? "border-l-red-500 bg-red-50" : insight.type === "prediction" ? "border-l-blue-500 bg-blue-50" : "border-l-purple-500 bg-purple-50" }`}>
                <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm">
                    {insight.type === "trend" && <TrendingUp className="w-4 h-4 text-green-600" />}
                    {insight.type === "alert" && <AlertTriangle className="w-4 h-4 text-red-600" />}
                    {insight.type === "prediction" && <Brain className="w-4 h-4 text-blue-600" />}
                    {insight.type === "recommendation" && <Lightbulb className="w-4 h-4 text-purple-600" />}
                    {insight.title}
                    <Badge variant="outline" className="ml-auto">{insight.confidence}% confiança</Badge>
                </CardTitle></CardHeader>
                <CardContent><p className="text-sm text-gray-700">{insight.description}</p></CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Seção Principal de Gráficos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Análise de Séries Temporais
              {analysisComplete && <Badge className="bg-green-100 text-green-800">IA Ativa</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Abas de Navegação */}
            <div className="flex gap-1 mb-6 border-b">
              {['financeiro', 'vendas', 'comparativo'].map(tab => (
                <Button key={tab} onClick={() => setActiveTab(tab)} variant="ghost" className={`capitalize rounded-b-none ${activeTab === tab ? 'border-b-2 border-slate-600 text-slate-800' : 'text-gray-500'}`}>
                  {tab}
                </Button>
              ))}
               <Button onClick={analyzeWithAI} disabled={isAnalyzing} size="sm" className="ml-auto">
                    {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Brain className="w-4 h-4 mr-2" />}
                    Reanalisar
                </Button>
            </div>

            {/* Conteúdo da Aba */}
            {activeTab === "financeiro" && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Evolução Financeira com Previsões IA</h3>
                {renderEnhancedChart()}
              </div>
            )}
            {activeTab === "vendas" && (
                <div className="text-center py-12">
                {/* Aqui você pode renderizar um gráfico de vendas, se a API retornar os dados */}
                <BarChart3 className="w-16 h-16 mx-auto text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Análise de Vendas com IA</h3>
                <p className="text-gray-600">Esta seção pode exibir previsões de vendas por produto.</p>
              </div>
            )}
            {activeTab === "comparativo" && (
                <div className="text-center py-12">
                    <Target className="w-16 h-16 mx-auto text-purple-600 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Análise Comparativa Inteligente</h3>
                    <p className="text-gray-600">Compare períodos e identifique oportunidades com IA.</p>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}