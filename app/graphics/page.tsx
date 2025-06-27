"use client"

import { useState, useEffect } from "react"
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
  FileText,
  ArrowLeft,
  Home,
  Brain,
  Loader2,
  Target,
  Lightbulb,
} from "lucide-react"

// Dados históricos reais para análise
const historicalData = [
  { date: "15/06", receitas: 110, despesas: 85, lucro: 25, vendas: 12 },
  { date: "16/06", receitas: 105, despesas: 75, lucro: 30, vendas: 10 },
  { date: "17/06", receitas: 135, despesas: 95, lucro: 40, vendas: 15 },
  { date: "18/06", receitas: 165, despesas: 110, lucro: 55, vendas: 18 },
  { date: "19/06", receitas: 185, despesas: 115, lucro: 70, vendas: 22 },
  { date: "20/06", receitas: 155, despesas: 105, lucro: 50, vendas: 16 },
  { date: "21/06", receitas: 210, despesas: 125, lucro: 85, vendas: 25 },
  { date: "22/06", receitas: 175, despesas: 108, lucro: 67, vendas: 20 },
  { date: "23/06", receitas: 195, despesas: 112, lucro: 83, vendas: 23 },
  { date: "24/06", receitas: 220, despesas: 118, lucro: 102, vendas: 28 },
]

interface AIInsight {
  type: "trend" | "prediction" | "recommendation" | "alert"
  title: string
  description: string
  confidence: number
  impact: "high" | "medium" | "low"
}

interface PredictionData {
  date: string
  receitas: number
  despesas: number
  lucro: number
  confidence: number
}

export default function GraficosPage() {
  const [activeTab, setActiveTab] = useState("financeiro")
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([])
  const [predictions, setPredictions] = useState<PredictionData[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisComplete, setAnalysisComplete] = useState(false)

  // Mock data para o dashboard
  const mockData = {
    totalProducts: 60,
    totalCategories: 3,
    monthlyProfit: 70.0,
    profitMargin: 60.9,
    stockValue: 127.5,
    alerts: 1,
    lowStockProducts: [{ name: "Água Mineral", quantity: 5, minStock: 15 }],
  }

  // Função para análise de IA dos dados
  const analyzeWithAI = async () => {
    setIsAnalyzing(true)

    try {
      // Simular análise de IA (em produção usaria o AI SDK real)
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Análise de tendências - remover profitGrowth não usado
      const revenueGrowth = calculateGrowthRate(historicalData.map((d) => d.receitas))
      const expenseGrowth = calculateGrowthRate(historicalData.map((d) => d.despesas))

      // Gerar insights baseados na análise
      const insights: AIInsight[] = [
        {
          type: "trend",
          title: "Tendência de Crescimento Positiva",
          description: `Suas receitas cresceram ${revenueGrowth.toFixed(1)}% no período analisado. Tendência consistente de alta.`,
          confidence: 92,
          impact: "high",
        },
        {
          type: "alert",
          title: "Aumento nas Despesas",
          description: `Despesas aumentaram ${expenseGrowth.toFixed(1)}%. Monitore custos operacionais.`,
          confidence: 87,
          impact: "medium",
        },
        {
          type: "prediction",
          title: "Projeção para Próximos 5 Dias",
          description: `Baseado nos padrões identificados, espera-se receita média de R$ ${predictNextValue(historicalData.map((d) => d.receitas)).toFixed(2)}.`,
          confidence: 78,
          impact: "high",
        },
        {
          type: "recommendation",
          title: "Otimização de Margem",
          description: "Identifiquei oportunidade de aumentar margem em 15% otimizando custos variáveis.",
          confidence: 85,
          impact: "high",
        },
      ]

      setAiInsights(insights)

      // Gerar previsões para os próximos 5 dias
      const futurePredictions: PredictionData[] = []
      for (let i = 1; i <= 5; i++) {
        const baseDate = new Date(2025, 5, 24 + i)
        futurePredictions.push({
          date: `${baseDate.getDate().toString().padStart(2, "0")}/06`,
          receitas: predictNextValue(historicalData.map((d) => d.receitas)) + (Math.random() - 0.5) * 20,
          despesas: predictNextValue(historicalData.map((d) => d.despesas)) + (Math.random() - 0.5) * 15,
          lucro: 0,
          confidence: Math.max(60, 90 - i * 5),
        })
      }

      futurePredictions.forEach((pred) => {
        pred.lucro = pred.receitas - pred.despesas
      })

      setPredictions(futurePredictions)
      setAnalysisComplete(true)
    } catch (error) {
      console.error("Erro na análise de IA:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Função para calcular taxa de crescimento
  const calculateGrowthRate = (values: number[]): number => {
    if (values.length < 2) return 0
    const first = values[0]
    const last = values[values.length - 1]
    return ((last - first) / first) * 100
  }

  // Função para prever próximo valor usando regressão linear simples
  const predictNextValue = (values: number[]): number => {
    const n = values.length
    const x = Array.from({ length: n }, (_, i) => i)
    const y = values

    const sumX = x.reduce((a, b) => a + b, 0)
    const sumY = y.reduce((a, b) => a + b, 0)
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0)
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0)

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n

    return slope * n + intercept
  }

  // Executar análise automaticamente com dependência correta
  useEffect(() => {
    analyzeWithAI()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Função para renderizar o gráfico com previsões
  const renderEnhancedChart = () => {
    const allData = [...historicalData, ...predictions]
    const maxValue = Math.max(...allData.map((d) => Math.max(d.receitas, d.despesas, d.lucro)))
    const chartHeight = 300
    const chartWidth = 1000
    const padding = 40

    const xStep = (chartWidth - padding * 2) / (allData.length - 1)
    const yScale = (chartHeight - padding * 2) / maxValue

    const createPath = (dataKey: "receitas" | "despesas" | "lucro", isPrediction = false) => {
      const dataToUse = isPrediction ? allData : historicalData
      return dataToUse
        .map((point, index) => {
          const x = padding + index * xStep
          const y = chartHeight - padding - point[dataKey] * yScale
          return `${index === 0 ? "M" : "L"} ${x} ${y}`
        })
        .join(" ")
    }

    return (
      <div className="w-full overflow-x-auto">
        <svg width={chartWidth} height={chartHeight} className="border rounded">
          {/* Grid lines */}
          {Array.from({ length: 6 }, (_, i) => i * (maxValue / 5)).map((value) => (
            <g key={value}>
              <line
                x1={padding}
                y1={chartHeight - padding - value * yScale}
                x2={chartWidth - padding}
                y2={chartHeight - padding - value * yScale}
                stroke="#f0f0f0"
                strokeWidth="1"
              />
              <text
                x={padding - 10}
                y={chartHeight - padding - value * yScale + 5}
                fontSize="12"
                fill="#666"
                textAnchor="end"
              >
                R$ {Math.round(value)}
              </text>
            </g>
          ))}

          {/* Linha vertical separando histórico de previsão */}
          <line
            x1={padding + (historicalData.length - 1) * xStep}
            y1={padding}
            x2={padding + (historicalData.length - 1) * xStep}
            y2={chartHeight - padding}
            stroke="#ddd"
            strokeWidth="2"
            strokeDasharray="5,5"
          />

          {/* X-axis labels */}
          {allData.map((point, index) => (
            <text
              key={point.date}
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
          <path
            d={createPath("receitas", true)}
            fill="none"
            stroke="#14b8a6"
            strokeWidth="2"
            strokeDasharray="5,5"
            opacity="0.7"
          />
          <path
            d={createPath("despesas", true)}
            fill="none"
            stroke="#f97316"
            strokeWidth="2"
            strokeDasharray="5,5"
            opacity="0.7"
          />
          <path
            d={createPath("lucro", true)}
            fill="none"
            stroke="#374151"
            strokeWidth="2"
            strokeDasharray="5,5"
            opacity="0.7"
          />

          {/* Data points históricos */}
          {historicalData.map((point, index) => {
            const x = padding + index * xStep
            return (
              <g key={point.date}>
                <circle cx={x} cy={chartHeight - padding - point.receitas * yScale} r="4" fill="#14b8a6" />
                <circle cx={x} cy={chartHeight - padding - point.despesas * yScale} r="4" fill="#f97316" />
                <circle cx={x} cy={chartHeight - padding - point.lucro * yScale} r="4" fill="#374151" />
              </g>
            )
          })}

          {/* Data points previstos (menores) */}
          {predictions.map((point, index) => {
            const x = padding + (historicalData.length + index) * xStep
            return (
              <g key={point.date}>
                <circle
                  cx={x}
                  cy={chartHeight - padding - point.receitas * yScale}
                  r="3"
                  fill="#14b8a6"
                  opacity="0.7"
                />
                <circle
                  cx={x}
                  cy={chartHeight - padding - point.despesas * yScale}
                  r="3"
                  fill="#f97316"
                  opacity="0.7"
                />
                <circle cx={x} cy={chartHeight - padding - point.lucro * yScale} r="3" fill="#374151" opacity="0.7" />
              </g>
            )
          })}
        </svg>

        {/* Legend */}
        <div className="flex justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
            <span className="text-sm text-teal-600">Receitas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span className="text-sm text-orange-600">Despesas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
            <span className="text-sm text-gray-600">Lucro</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-gray-400 border-dashed"></div>
            <span className="text-sm text-gray-500">Previsão IA</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Briefcase className="w-8 h-8 text-amber-600" />
            <h1 className="text-3xl font-bold text-gray-800">Sistema de Gestão</h1>
          </div>
          <p className="text-gray-600">Controle seu negócio de forma simples e inteligente</p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-slate-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
              <Package className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockData.totalProducts}</div>
              <p className="text-xs text-slate-200">{mockData.totalCategories} tipos diferentes</p>
            </CardContent>
          </Card>

          <Card className="bg-teal-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lucro do Mês</CardTitle>
              <TrendingUp className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {mockData.monthlyProfit.toFixed(2)}</div>
              <p className="text-xs text-teal-200">+{mockData.profitMargin}% margem</p>
            </CardContent>
          </Card>

          <Card className="bg-yellow-500 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor do Estoque</CardTitle>
              <DollarSign className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {mockData.stockValue.toFixed(2)}</div>
              <p className="text-xs text-yellow-200">Investimento atual</p>
            </CardContent>
          </Card>

          <Card className="bg-red-500 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alertas</CardTitle>
              <AlertTriangle className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockData.alerts}</div>
              <p className="text-xs text-red-200">Produtos com estoque baixo</p>
            </CardContent>
          </Card>
        </div>

        {/* Low Stock Alert */}
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Atenção: Estoque Baixo</strong>
            <div className="mt-2 space-y-1">
              {mockData.lowStockProducts.map((product, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span>{product.name}</span>
                  <Badge variant="destructive">
                    {product.quantity} restantes (mín: {product.minStock})
                  </Badge>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>

        {/* AI Analysis Status */}
        {isAnalyzing && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="flex items-center gap-3 p-4">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              <div>
                <h4 className="font-medium text-blue-800">Analisando dados com IA...</h4>
                <p className="text-sm text-blue-600">Identificando padrões e gerando insights automáticos</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI Insights */}
        {analysisComplete && aiInsights.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {aiInsights.map((insight, index) => (
              <Card
                key={index}
                className={`border-l-4 ${
                  insight.type === "trend"
                    ? "border-l-green-500 bg-green-50"
                    : insight.type === "alert"
                      ? "border-l-red-500 bg-red-50"
                      : insight.type === "prediction"
                        ? "border-l-blue-500 bg-blue-50"
                        : "border-l-purple-500 bg-purple-50"
                }`}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    {insight.type === "trend" && <TrendingUp className="w-4 h-4 text-green-600" />}
                    {insight.type === "alert" && <AlertTriangle className="w-4 h-4 text-red-600" />}
                    {insight.type === "prediction" && <Brain className="w-4 h-4 text-blue-600" />}
                    {insight.type === "recommendation" && <Lightbulb className="w-4 h-4 text-purple-600" />}
                    {insight.title}
                    <Badge variant="outline" className="ml-auto">
                      {insight.confidence}% confiança
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700">{insight.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex gap-1 bg-white p-1 rounded-lg border">
          <Link href="/estoque">
            <Button variant="ghost" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Estoque
            </Button>
          </Link>
          <Link href="/financeiro">
            <Button variant="ghost" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Financeiro
            </Button>
          </Link>
          <Button className="flex items-center gap-2 bg-slate-600 text-white">
            <BarChart3 className="w-4 h-4" />
            Gráficos
          </Button>
          <Link href="/relatorios">
            <Button variant="ghost" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Relatórios
            </Button>
          </Link>
        </div>

        {/* Charts Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-600" />
              Análise de Séries Temporais com IA
              {analysisComplete && <Badge className="bg-green-100 text-green-800">IA Ativa</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Chart Navigation */}
            <div className="flex gap-1 mb-6">
              <Button
                onClick={() => setActiveTab("financeiro")}
                className={`${
                  activeTab === "financeiro" ? "bg-slate-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Financeiro
              </Button>
              <Button
                onClick={() => setActiveTab("vendas")}
                className={`${
                  activeTab === "vendas" ? "bg-slate-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Vendas
              </Button>
              <Button
                onClick={() => setActiveTab("comparativo")}
                className={`${
                  activeTab === "comparativo"
                    ? "bg-slate-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Comparativo
              </Button>
            </div>

            {/* Chart Content */}
            {activeTab === "financeiro" && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Evolução Financeira com Previsões IA</h3>
                  <Button onClick={analyzeWithAI} disabled={isAnalyzing} size="sm">
                    {isAnalyzing ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Brain className="w-4 h-4 mr-2" />
                    )}
                    Reanalizar
                  </Button>
                </div>
                {renderEnhancedChart()}

                {predictions.length > 0 && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">Previsões para os Próximos 5 Dias:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-sm">
                      {predictions.map((pred, index) => (
                        <div key={index} className="bg-white p-2 rounded border">
                          <div className="font-medium">{pred.date}</div>
                          <div className="text-teal-600">R$ {pred.receitas.toFixed(0)}</div>
                          <div className="text-xs text-gray-500">{pred.confidence}% confiança</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "vendas" && (
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 mx-auto text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Análise de Vendas com IA</h3>
                <p className="text-gray-600">Análise preditiva de vendas por produto e sazonalidade.</p>
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

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Dashboard
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline">
              <Home className="w-4 h-4 mr-2" />
              Início
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
