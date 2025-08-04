"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
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
  ShoppingCart,
  Activity,
  RefreshCw,
  CheckCircle,
  XCircle,
} from "lucide-react"
import {
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
} from "recharts"
import api from "@/services/api"
import { useRouter } from "next/navigation"

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

interface SalesData {
  product: string
  sales: number
  revenue: number
  growth: number
}

interface CategoryData {
  name: string
  value: number
  color: string
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

export default function GraficosPage() {
  const [activeTab, setActiveTab] = useState("financeiro")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisComplete, setAnalysisComplete] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([])
  const [predictions, setPredictions] = useState<PredictionData[]>([])
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([])
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null)
  const [salesData, setSalesData] = useState<SalesData[]>([])
  const [categoryData, setCategoryData] = useState<CategoryData[]>([])
  const [loadingDashboard, setLoadingDashboard] = useState(true)
  const [dataSource, setDataSource] = useState<"api" | "mock">("api")
  const router = useRouter()

  // Enhanced ML Response Transformer for your specific API
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transformMLResponse = useCallback((mlData: any) => {
    try {
      console.log("🔄 Transforming real ML Data from your backend:", mlData)

      let historical = []
      let predictions = []
      let insights = []

      // Handle your specific ML API response structure
      // Based on your backend, the response should come directly from ML_API_URL/analytics/grafico-json
      if (mlData.dados_historicos || mlData.historical || mlData.historico) {
        historical = mlData.dados_historicos || mlData.historical || mlData.historico
      } else if (mlData.grafico_dados || mlData.chart_data) {
        historical = mlData.grafico_dados || mlData.chart_data
      } else if (mlData.data && Array.isArray(mlData.data)) {
        historical = mlData.data
      } else if (Array.isArray(mlData)) {
        // If the ML API returns an array directly
        historical = mlData
      }

      // Handle predictions from your ML API
      if (mlData.previsoes || mlData.predictions || mlData.forecast) {
        predictions = mlData.previsoes || mlData.predictions || mlData.forecast
      } else if (mlData.predicoes || mlData.forecasts) {
        predictions = mlData.predicoes || mlData.forecasts
      }

      // Handle insights from your ML API
      if (mlData.insights || mlData.analises || mlData.recomendacoes) {
        insights = mlData.insights || mlData.analises || mlData.recomendacoes
      } else if (mlData.analysis || mlData.recommendations) {
        insights = mlData.analysis || mlData.recommendations
      }

      console.log("📊 Extracted from your ML API:", { historical, predictions, insights })

      // Transform historical data from your ML API format
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const transformedHistorical = (Array.isArray(historical) ? historical : []).map((item: any) => {
        const transformed = {
          date: item.data || item.date || item.periodo || item.mes || item.month || `Período ${Date.now()}`,
          receitas: Number(
            item.receita ||
              item.receitas ||
              item.revenue ||
              item.faturamento ||
              item.income ||
              item.valor_receita ||
              item.total_receita ||
              0,
          ),
          despesas: Number(
            item.despesa ||
              item.despesas ||
              item.expenses ||
              item.custos ||
              item.gastos ||
              item.costs ||
              item.valor_despesa ||
              item.total_despesa ||
              0,
          ),
          lucro: 0, // Will be calculated below
          vendas: Number(
            item.vendas ||
              item.sales ||
              item.quantidade ||
              item.units_sold ||
              item.qtd_vendas ||
              item.total_vendas ||
              0,
          ),
        }

        // Calculate profit from your data
        transformed.lucro = Number(
          item.lucro ||
            item.profit ||
            item.resultado ||
            item.valor_lucro ||
            item.total_lucro ||
            transformed.receitas - transformed.despesas,
        )

        return transformed
      })

      // Transform predictions from your ML API format
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const transformedPredictions = (Array.isArray(predictions) ? predictions : []).map((item: any) => {
        const transformed = {
          date: item.data || item.date || item.periodo || item.mes || `Previsão ${Date.now()}`,
          receitas: Number(
            item.receita_prevista ||
              item.receitas ||
              item.predicted_revenue ||
              item.forecast_receitas ||
              item.previsao_receita ||
              0,
          ),
          despesas: Number(
            item.despesa_prevista ||
              item.despesas ||
              item.predicted_expenses ||
              item.forecast_despesas ||
              item.previsao_despesa ||
              0,
          ),
          lucro: 0, // Will be calculated below
          confidence: Number(
            item.confianca ||
              item.confidence ||
              item.precisao ||
              item.accuracy ||
              item.score ||
              item.confiabilidade ||
              85,
          ),
        }

        // Calculate predicted profit
        transformed.lucro = Number(
          item.lucro_previsto ||
            item.lucro ||
            item.predicted_profit ||
            item.previsao_lucro ||
            transformed.receitas - transformed.despesas,
        )

        return transformed
      })

      // Transform insights from your ML API format
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const transformedInsights = (Array.isArray(insights) ? insights : []).map((item: any) => ({
        type: (item.tipo || item.type || "recommendation") as "trend" | "prediction" | "recommendation" | "alert",
        title: item.titulo || item.title || item.nome || item.name || "Insight da IA",
        description:
          item.descricao ||
          item.description ||
          item.texto ||
          item.text ||
          item.message ||
          item.conteudo ||
          item.content ||
          "Análise gerada pela IA",
        confidence: Number(
          item.confianca || item.confidence || item.precisao || item.score || item.confiabilidade || 80,
        ),
        impact: (item.impacto || item.impact || "medium") as "high" | "medium" | "low",
      }))

      console.log("✅ Final transformed data from your ML API:", {
        historical: transformedHistorical,
        predictions: transformedPredictions,
        insights: transformedInsights,
      })

      return {
        historical: transformedHistorical,
        predictions: transformedPredictions,
        insights: transformedInsights,
      }
    } catch (error) {
      console.error("❌ Error transforming your ML API response:", error)
      return { historical: [], predictions: [], insights: [] }
    }
  }, [])

  const fetchDashboardData = useCallback(async () => {
    setLoadingDashboard(true)
    try {
      const [productsRes, summaryRes] = await Promise.all([
        api.get("/products").catch(() => ({ data: [] })),
        api.get("/api/dashboard/summary").catch(() => ({ data: { summary: {} } })),
      ])

      const productsData = Array.isArray(productsRes.data) ? productsRes.data : []
      const summaryData = summaryRes.data?.summary || {}

      const lowStockProducts = productsData
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter((p: any) => p.quantidade_estoque < (p.min_estoque || 10))
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((p: any) => ({
          name: p.nome,
          quantity: p.quantidade_estoque,
          minStock: p.min_estoque || 10,
        }))

      setDashboardData({
        totalProducts: productsData.length,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        totalCategories: new Set(productsData.map((p: any) => p.categoria)).size,
        monthlyProfit: summaryData.profit || 0,
        profitMargin: summaryData.profitMargin || 0,
        stockValue:
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          productsData.reduce((acc: number, p: any) => acc + (p.quantidade_estoque || 0) * (p.preco_compra || 0), 0),
        alerts: lowStockProducts.length,
        lowStockProducts,
      })
    } catch (error) {
      console.error("Erro ao buscar dados do dashboard:", error)
      setDashboardData({
        totalProducts: 0,
        totalCategories: 0,
        monthlyProfit: 0,
        profitMargin: 0,
        stockValue: 0,
        alerts: 0,
        lowStockProducts: [],
      })
    } finally {
      setLoadingDashboard(false)
    }
  }, [])

  const analyzeWithAI = useCallback(async () => {
    setIsAnalyzing(true)
    setApiError(null)
    setAnalysisComplete(false)

    try {
      console.log(`🚀 Fetching real ML data for tab: ${activeTab}`)

      // Map frontend tabs to backend tipos that your ML API expects
      const tipoMap: { [key: string]: string } = {
        financeiro: "receita",
        vendas: "vendas",
        comparativo: "comparativo",
      }

      const tipo = tipoMap[activeTab] || "receita"
      console.log(`📡 Calling your backend with tipo: ${tipo}`)

      // Call your real backend endpoint that connects to ML API
      const response = await axios.get(`${process.env.NEXT_PUBLIC_ML_API_URL}/analytics/grafico-json`, {
        params: { tipo }

      })

      console.log("📊 Real ML API Response received from your backend:", response.data)

      if (response.data && typeof response.data === "object") {
        // Transform the real ML API response to our format
        const transformedData = transformMLResponse(response.data)

        console.log("✅ Real data transformation complete:", transformedData)

        // Check if we got meaningful data from your ML API
        const hasHistoricalData = transformedData.historical.length > 0
        const hasPredictions = transformedData.predictions.length > 0
        const hasInsights = transformedData.insights.length > 0

        if (hasHistoricalData || hasPredictions || hasInsights) {
          console.log("🎯 Using real ML data from your backend")
          setDataSource("api")
          setHistoricalData(transformedData.historical)
          setPredictions(transformedData.predictions)
          setAiInsights(transformedData.insights)

          // Generate sales data from ML response if available for vendas tab
          if (activeTab === "vendas" && response.data.vendas_por_produto) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const salesFromML = response.data.vendas_por_produto.map((item: any) => ({
              product: item.produto || item.name || item.nome,
              sales: Number(item.quantidade || item.sales || item.vendas || 0),
              revenue: Number(item.receita || item.revenue || item.faturamento || 0),
              growth: Number(item.crescimento || item.growth || item.variacao || 0),
            }))
            setSalesData(salesFromML)
          } else {
            setSalesData([])
          }

          // Generate category data from ML response if available for vendas tab
          if (activeTab === "vendas" && response.data.categorias) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const categoriesFromML = response.data.categorias.map((item: any, index: number) => ({
              name: item.categoria || item.name || item.nome,
              value: Number(item.percentual || item.value || item.valor || 0),
              color: COLORS[index % COLORS.length],
            }))
            setCategoryData(categoriesFromML)
          } else {
            setCategoryData([])
          }

          // Add success insight for real data
          const successInsight = {
            type: "trend" as const,
            title: "Dados Reais da IA",
            description: `Análise baseada em dados reais: ${transformedData.historical.length} períodos históricos${
              transformedData.predictions.length > 0 ? ` e ${transformedData.predictions.length} previsões` : ""
            }.`,
            confidence: 100,
            impact: "high" as const,
          }
          setAiInsights([successInsight, ...transformedData.insights])

          setAnalysisComplete(true)
          console.log("✅ Real ML data successfully processed and set")
        } else {
          throw new Error("Nenhum dado foi retornado pela API de ML")
        }
      } else {
        throw new Error("Formato de resposta inválido da API de ML")
      }
    } catch (error) {
      console.error("❌ Erro ao conectar com sua API ML:", error)
      console.log("🔄 Verifique se o serviço ML está rodando")

      setDataSource("mock")
      setApiError(
        `Não foi possível conectar com o serviço de ML. Erro: ${
          error instanceof Error ? error.message : "Desconhecido"
        }. Verifique se o backend está rodando e se a ML_API_URL está configurada corretamente.`,
      )

      // Clear all data when API fails
      setHistoricalData([])
      setPredictions([])
      setSalesData([])
      setCategoryData([])
      setAiInsights([
        {
          type: "alert",
          title: "Erro de Conexão",
          description: "Não foi possível conectar com o serviço de ML. Verifique a configuração.",
          confidence: 100,
          impact: "high",
        },
      ])
      setAnalysisComplete(true)
    } finally {
      setIsAnalyzing(false)
    }
  }, [activeTab, transformMLResponse])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  useEffect(() => {
    analyzeWithAI()
  }, [analyzeWithAI])

  const combinedData = [...historicalData, ...predictions.map((p) => ({ ...p, isPrediction: true }))]

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const isPrediction = payload[0]?.payload?.isPrediction
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{`${label}${isPrediction ? " (Previsão IA)" : ""}`}</p>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.dataKey}: R$ ${entry.value?.toFixed(2)}`}
              {entry.payload?.confidence && (
                <span className="text-xs text-gray-500 ml-2">({entry.payload.confidence}% confiança)</span>
              )}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const renderFinancialChart = () => {
    if (combinedData.length === 0) {
      return (
        <div className="text-center py-12 text-gray-500">
          <Brain className="w-12 h-12 mx-auto mb-4" />
          <p>Nenhum dado financeiro disponível.</p>
          <p className="text-sm">Conecte sua API de ML para ver dados reais.</p>
          <Button onClick={analyzeWithAI} disabled={isAnalyzing} size="sm" className="mt-4">
            {isAnalyzing ? "Analisando..." : "Tentar Novamente"}
          </Button>
        </div>
      )
    }

    return (
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={combinedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis tickFormatter={(value) => `R$ ${value.toLocaleString()}`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />

            {/* Historical data - solid lines */}
            <Line
              type="monotone"
              dataKey="receitas"
              stroke="#10b981"
              strokeWidth={3}
              name="Receitas"
              connectNulls={false}
              dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="despesas"
              stroke="#f59e0b"
              strokeWidth={3}
              name="Despesas"
              connectNulls={false}
              dot={{ fill: "#f59e0b", strokeWidth: 2, r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="lucro"
              stroke="#3b82f6"
              strokeWidth={3}
              name="Lucro"
              connectNulls={false}
              dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div className="flex items-center gap-2">
            <Badge variant={dataSource === "api" ? "default" : "secondary"} className="flex items-center gap-1">
              {dataSource === "api" ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
              {dataSource === "api" ? "Dados Reais" : "Erro de Conexão"}
            </Badge>
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                <Briefcase className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Brain className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-800">Análise e Previsões com IA</h1>
          </div>
          <p className="text-gray-600">
            {dataSource === "api"
              ? "Dados reais processados pela inteligência artificial"
              : "Configure sua API de ML para ver dados reais"}
          </p>
        </div>

        {/* Dashboard Cards */}
        {loadingDashboard ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4 mt-2"></div>
                  </CardContent>
                </Card>
              ))}
          </div>
        ) : (
          dashboardData && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-slate-600 to-slate-700 text-white">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
                    <Package className="h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardData.totalProducts}</div>
                    <p className="text-xs text-slate-200">{dashboardData.totalCategories} categorias</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-teal-600 to-teal-700 text-white">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Lucro do Mês</CardTitle>
                    <TrendingUp className="h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">R$ {dashboardData.monthlyProfit.toFixed(2)}</div>
                    <p className="text-xs text-teal-200">+{dashboardData.profitMargin.toFixed(1)}% margem</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Valor do Estoque</CardTitle>
                    <DollarSign className="h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">R$ {dashboardData.stockValue.toFixed(2)}</div>
                    <p className="text-xs text-yellow-200">Investimento total</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br bg-purple-600 text-white">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Alertas</CardTitle>
                    <AlertTriangle className="h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardData.alerts}</div>
                    <p className="text-xs text-red-200">Requer atenção</p>
                  </CardContent>
                </Card>
              </div>

              {dashboardData.lowStockProducts.length > 0 && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    <strong>Atenção: Estoque Baixo</strong>
                    <div className="mt-2 space-y-1">
                      {dashboardData.lowStockProducts.map((product, index) => (
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
              )}
            </>
          )
        )}

        {/* API Error Alert */}
        {apiError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{apiError}</AlertDescription>
          </Alert>
        )}

        {/* AI Analysis Status */}
        {isAnalyzing && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="flex items-center gap-3 p-4">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              <div>
                <h4 className="font-medium text-blue-800">Processando dados com IA...</h4>
                <p className="text-sm text-blue-600">Conectando com o serviço de ML para análise de {activeTab}...</p>
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
                  <Progress value={insight.confidence} className="mt-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Main Analytics Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Análise Financeira Inteligente
                {analysisComplete && (
                  <Badge className={dataSource === "api" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                    {dataSource === "api" ? "IA Conectada" : "Erro de Conexão"}
                  </Badge>
                )}
              </CardTitle>
              <Button onClick={analyzeWithAI} disabled={isAnalyzing} size="sm">
                {isAnalyzing ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                {isAnalyzing ? "Analisando..." : "Atualizar"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="financeiro" className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Financeiro
                </TabsTrigger>
                <TabsTrigger value="vendas" className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4" />
                  Vendas
                </TabsTrigger>
                <TabsTrigger value="comparativo" className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Comparativo
                </TabsTrigger>
              </TabsList>

              <TabsContent value="financeiro" className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Evolução Financeira {dataSource === "api" ? "com IA" : "(Sem Dados)"}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>Períodos: {historicalData.length}</span>
                      {predictions.length > 0 && <span>• Previsões: {predictions.length}</span>}
                    </div>
                  </div>
                  {renderFinancialChart()}

                  {/* Data Summary */}
                  {historicalData.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Receita Total</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-green-600">
                            R$ {historicalData.reduce((acc, item) => acc + item.receitas, 0).toLocaleString()}
                          </div>
                          <p className="text-xs text-gray-600">Últimos {historicalData.length} períodos</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Despesas Totais</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-orange-600">
                            R$ {historicalData.reduce((acc, item) => acc + item.despesas, 0).toLocaleString()}
                          </div>
                          <p className="text-xs text-gray-600">Últimos {historicalData.length} períodos</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Lucro Total</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-blue-600">
                            R$ {historicalData.reduce((acc, item) => acc + item.lucro, 0).toLocaleString()}
                          </div>
                          <p className="text-xs text-gray-600">Últimos {historicalData.length} períodos</p>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="vendas" className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Análise de Vendas</h3>
                  {salesData.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={salesData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="product" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="sales" fill="#3b82f6" name="Vendas" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={categoryData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {categoryData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <ShoppingCart className="w-12 h-12 mx-auto mb-4" />
                      <p>Dados de vendas não disponíveis.</p>
                      <p className="text-sm">Configure sua API de ML para incluir dados de vendas.</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="comparativo" className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Análise Comparativa</h3>
                  {historicalData.length > 0 ? (
                    <>
                      <div className="h-96">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={historicalData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis tickFormatter={(value) => `R$ ${value.toLocaleString()}`} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Area
                              type="monotone"
                              dataKey="receitas"
                              stackId="1"
                              stroke="#10b981"
                              fill="#10b981"
                              fillOpacity={0.6}
                              name="Receitas"
                            />
                            <Area
                              type="monotone"
                              dataKey="despesas"
                              stackId="2"
                              stroke="#f59e0b"
                              fill="#f59e0b"
                              fillOpacity={0.6}
                              name="Despesas"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Crescimento</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                              +
                              {historicalData.length > 1
                                ? (
                                    ((historicalData[historicalData.length - 1]?.receitas || 0) /
                                      (historicalData[0]?.receitas || 1) -
                                      1) *
                                    100
                                  ).toFixed(1)
                                : "0.0"}
                              %
                            </div>
                            <p className="text-xs text-gray-600">Receitas no período</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Eficiência</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold text-blue-600">
                              {historicalData.length > 0
                                ? (
                                    (historicalData.reduce((acc, item) => acc + item.lucro, 0) /
                                      historicalData.reduce((acc, item) => acc + item.receitas, 1)) *
                                    100
                                  ).toFixed(1)
                                : "0.0"}
                              %
                            </div>
                            <p className="text-xs text-gray-600">Margem de lucro média</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Tendência</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold text-purple-600">
                              {predictions.length > 0 && historicalData.length > 0
                                ? predictions[predictions.length - 1].lucro >
                                  historicalData[historicalData.length - 1].lucro
                                  ? "↗️ Positiva"
                                  : "↘️ Negativa"
                                : "📊 Estável"}
                            </div>
                            <p className="text-xs text-gray-600">Previsão IA</p>
                          </CardContent>
                        </Card>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Target className="w-12 h-12 mx-auto mb-4" />
                      <p>Dados comparativos não disponíveis.</p>
                      <p className="text-sm">Configure sua API de ML para análise comparativa.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
