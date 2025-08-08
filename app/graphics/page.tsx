"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Briefcase, TrendingUp, DollarSign, AlertTriangle, Package, BarChart3, ArrowLeft, Loader2, RefreshCw, Activity, TrendingDown } from 'lucide-react'
import {
  LineChart,
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
} from "recharts"
import api from "@/services/api"
import { useRouter } from "next/navigation"

interface FinancialData {
  date: string
  receitas: number
  despesas: number
  lucro: number
  periodo: string
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
  const [financialData, setFinancialData] = useState<FinancialData[]>([])
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingDashboard, setLoadingDashboard] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const fetchFinancialData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // Buscar transações separadas por tipo (receitas e despesas)
      const [receitasRes, despesasRes] = await Promise.all([
        api.get("/api/transactions?type=receita").catch(() => ({ data: { transactions: [] } })),
        api.get("/api/transactions?type=despesa").catch(() => ({ data: { transactions: [] } })),
      ])

      const receitasData = receitasRes.data?.transactions || []
      const despesasData = despesasRes.data?.transactions || []

      // Agrupar dados por mês
      const monthlyData = new Map<string, { receitas: number; despesas: number }>()

      // Processar receitas
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      receitasData.forEach((receita: any) => {
        const date = new Date(receita.data || receita.createdAt)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        if (!monthlyData.has(monthKey)) {
          monthlyData.set(monthKey, { receitas: 0, despesas: 0 })
        }
        const current = monthlyData.get(monthKey)!
        current.receitas += Number(receita.valor || 0)
      })

      // Processar despesas
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      despesasData.forEach((despesa: any) => {
        const date = new Date(despesa.data || despesa.createdAt)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        if (!monthlyData.has(monthKey)) {
          monthlyData.set(monthKey, { receitas: 0, despesas: 0 })
        }
        const current = monthlyData.get(monthKey)!
        current.despesas += Number(despesa.valor || 0)
      })

      // Converter para array e ordenar por data
      const chartData: FinancialData[] = Array.from(monthlyData.entries())
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map(([monthKey, data]: [string, any]) => {
          const [year, month] = monthKey.split('-')
          const date = new Date(Number(year), Number(month) - 1)
          return {
            date: monthKey,
            periodo: date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
            receitas: data.receitas,
            despesas: data.despesas,
            lucro: data.receitas - data.despesas,
          }
        })
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-12) // Últimos 12 meses

      setFinancialData(chartData)
    } catch (error) {
      setError(`Erro ao carregar dados financeiros: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    } finally {
      setLoading(false)
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
        stockValue: productsData.reduce(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (acc: number, p: any) => acc + (p.quantidade_estoque || 0) * (p.preco_compra || 0),
          0
        ),
        alerts: lowStockProducts.length,
        lowStockProducts,
      })
    } catch {
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

  useEffect(() => {
    fetchDashboardData()
    fetchFinancialData()
  }, [fetchDashboardData, fetchFinancialData])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.dataKey === 'receitas' ? 'Receitas' : 
                 entry.dataKey === 'despesas' ? 'Despesas' : 'Lucro'}: R$ ${entry.value?.toFixed(2)}`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const totalReceitas = financialData.reduce((acc, item) => acc + item.receitas, 0)
  const totalDespesas = financialData.reduce((acc, item) => acc + item.despesas, 0)
  const totalLucro = totalReceitas - totalDespesas
  const crescimentoReceitas = financialData.length > 1 
    ? ((financialData[financialData.length - 1]?.receitas || 0) / (financialData[0]?.receitas || 1) - 1) * 100
    : 0

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation */}
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
            <BarChart3 className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-800">Análise Financeira</h1>
          </div>
          <p className="text-gray-600">
            Visualização de receitas e despesas baseada nos dados do sistema
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
                    <CardTitle className="text-sm font-medium">Receitas Totais</CardTitle>
                    <TrendingUp className="h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">R$ {totalReceitas.toFixed(2)}</div>
                    <p className="text-xs text-teal-200">
                      {crescimentoReceitas > 0 ? '+' : ''}{crescimentoReceitas.toFixed(1)}% crescimento
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Despesas Totais</CardTitle>
                    <TrendingDown className="h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">R$ {totalDespesas.toFixed(2)}</div>
                    <p className="text-xs text-blue-200">Últimos 12 meses</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-600 to-purple-700 text-white">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Lucro Total</CardTitle>
                    <DollarSign className="h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">R$ {totalLucro.toFixed(2)}</div>
                    <p className="text-xs text-purple-200">
                      {totalReceitas > 0 ? ((totalLucro / totalReceitas) * 100).toFixed(1) : '0.0'}% margem
                    </p>
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
                        <div key={index} className="flex justify-between items-center gap-8">
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

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Main Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Linha - Evolução Temporal */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  Evolução Mensal
                </CardTitle>
                <Button onClick={fetchFinancialData} disabled={loading} size="sm">
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  {loading ? "Carregando..." : "Atualizar"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-80 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : financialData.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={financialData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="periodo" />
                      <YAxis tickFormatter={(value) => `R$ ${value.toLocaleString()}`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="receitas"
                        stroke="#10b981"
                        strokeWidth={3}
                        name="Receitas"
                        dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="despesas"
                        stroke="#f59e0b"
                        strokeWidth={3}
                        name="Despesas"
                        dot={{ fill: "#f59e0b", strokeWidth: 2, r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="lucro"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        name="Lucro"
                        dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 mx-auto mb-4" />
                    <p>Nenhum dado financeiro encontrado</p>
                    <p className="text-sm">Adicione receitas e despesas para ver os gráficos</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Gráfico de Barras - Comparativo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                Comparativo Mensal
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-80 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                </div>
              ) : financialData.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={financialData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="periodo" />
                      <YAxis tickFormatter={(value) => `R$ ${value.toLocaleString()}`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="receitas" fill="#10b981" name="Receitas" />
                      <Bar dataKey="despesas" fill="#f59e0b" name="Despesas" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 mx-auto mb-4" />
                    <p>Nenhum dado para comparação</p>
                    <p className="text-sm">Dados aparecerão conforme você adicionar transações</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Gráfico de Área - Visão Geral */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Visão Geral - Receitas vs Despesas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-96 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
              </div>
            ) : financialData.length > 0 ? (
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={financialData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="periodo" />
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
            ) : (
              <div className="h-96 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4" />
                  <p>Aguardando dados financeiros</p>
                  <p className="text-sm">Os gráficos aparecerão quando houver dados de receitas e despesas</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resumo Estatístico */}
        {financialData.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Média Mensal - Receitas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  R$ {(totalReceitas / financialData.length).toFixed(2)}
                </div>
                <Progress 
                  value={Math.min((totalReceitas / financialData.length) / 10000 * 100, 100)} 
                  className="mt-2" 
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Média Mensal - Despesas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  R$ {(totalDespesas / financialData.length).toFixed(2)}
                </div>
                <Progress 
                  value={Math.min((totalDespesas / financialData.length) / 10000 * 100, 100)} 
                  className="mt-2" 
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Melhor Mês</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {financialData.reduce((best, current) => 
                    current.lucro > best.lucro ? current : best
                  ).periodo}
                </div>
                <p className="text-xs text-gray-600">
                  R$ {financialData.reduce((best, current) => 
                    current.lucro > best.lucro ? current : best
                  ).lucro.toFixed(2)} lucro
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Eficiência</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {totalReceitas > 0 ? ((totalLucro / totalReceitas) * 100).toFixed(1) : '0.0'}%
                </div>
                <p className="text-xs text-gray-600">Margem de lucro geral</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}