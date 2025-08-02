/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts"
import { TrendingUp, AlertTriangle, RefreshCw, Loader2 } from "lucide-react"
import aiApi from "@/services/ai-api"

interface ForecastChartProps {
  type: "receita" | "despesa"
  className?: string
}

export function ForecastChart({ type, className = "" }: ForecastChartProps) {
  const [chartData, setChartData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")

  const fetchForecastData = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await aiApi.get(`analytics/grafico-json?tipo=${type}`)
      setChartData(response.data)
    } catch (err: any) {
      setError(err.message || "Erro ao carregar dados de previsão")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchForecastData()
  }, [type])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const chartColor = type === "receita" ? "#10b981" : "#ef4444"
  const bgColor = type === "receita" ? "bg-green-50" : "bg-red-50"
  const borderColor = type === "receita" ? "border-green-200" : "border-red-200"

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Previsão de {type === "receita" ? "Receitas" : "Despesas"}
          </CardTitle>
          <p className="text-sm text-gray-600">Análise preditiva baseada em dados históricos</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchForecastData} disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Atualizar
        </Button>
      </CardHeader>

      <CardContent>
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-2">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
              <p className="text-sm text-gray-600">Processando dados e gerando previsões...</p>
            </div>
          </div>
        )}

        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <p className="font-medium">Erro ao carregar previsão:</p>
              <p className="text-sm mt-1">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchForecastData} className="mt-2 h-7 bg-transparent">
                Tentar novamente
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {chartData && !loading && (
          <div className="space-y-4">
            {/* Métricas resumo */}
            <div className={`grid grid-cols-2 gap-4 p-4 rounded-lg border ${bgColor} ${borderColor}`}>
              <div className="text-center">
                <p className="text-sm text-gray-600">Valor Atual</p>
                <p className="text-lg font-bold">{formatCurrency(chartData.valor_atual || 0)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Previsão 30 dias</p>
                <p className="text-lg font-bold">{formatCurrency(chartData.previsao_total || 0)}</p>
              </div>
            </div>

            {/* Gráfico */}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData.dados_grafico || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="data" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `R$ ${value}`} />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), type === "receita" ? "Receita" : "Despesa"]}
                    labelFormatter={(label) => `Data: ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="valor"
                    stroke={chartColor}
                    fill={chartColor}
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Indicadores */}
            <div className="flex justify-center gap-2">
              <Badge variant="outline" className="text-xs">
                📊 Modelo ARIMA/SARIMA
              </Badge>
              <Badge variant="outline" className="text-xs">
                🎯 Precisão: {chartData.precisao || "N/A"}%
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
