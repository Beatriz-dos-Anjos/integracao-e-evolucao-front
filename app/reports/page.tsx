/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useEffect, useState } from "react"
import api from "@/services/api"
import Link from "next/link"
import {
  Briefcase,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Package,
  BarChart3,
  FileText,
  ArrowLeft,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function RelatoriosPage() {
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([])
const [mostProfitableProducts, setMostProfitableProducts] = useState<Product[]>([])

  const [stats, setStats] = useState({ total_produtos: 0, produtos_estoque_baixo: 0 })
  const [businessMetrics, setBusinessMetrics] = useState({
    lucro_total: 0,
    lucro_unitario_medio: 0,
    ticket_medio: 0,
    total_itens: 0,
  })
interface Product {
  nome: string
  quantidade_estoque: number
  lucro_unitario: string
  lucro_total?: string
}

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashboardRes, lucrativeRes] = await Promise.all([
          api.get("products/analysis/dashboard"),
          api.get("products/analysis/most-lucrative"),
        ])

        const dashboard = dashboardRes.data
        const lucrative = lucrativeRes.data

        setLowStockProducts(dashboard.produtos_estoque_baixo)
        setMostProfitableProducts(dashboard.produtos_mais_lucrativos)
        setStats(dashboard.estatisticas)

        const totalLucro = lucrative.reduce((acc, p) => acc + parseFloat(p.lucro_total), 0)
        const avgLucroUnit = lucrative.reduce((acc, p) => acc + parseFloat(p.lucro_unitario), 0) / lucrative.length
        const totalItens = lucrative.reduce((acc, p) => acc + p.quantidade_estoque, 0)
        const ticketMedio = totalItens ? totalLucro / totalItens : 0

        setBusinessMetrics({
          lucro_total: totalLucro,
          lucro_unitario_medio: avgLucroUnit,
          ticket_medio: ticketMedio,
          total_itens: totalItens,
        })
      } catch (err) {
        console.error("Erro ao buscar dados:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const recommendations = [
    {
      icon: "⚠️",
      title: "Reabastecer Estoque",
      description: `${stats.produtos_estoque_baixo} produto(s) com estoque baixo precisam ser reabastecidos.`,
      color: "yellow",
    },

    {
      icon: "💡",
      title: "Dica",
      description: "Considere aumentar o estoque dos produtos com maior margem de lucro.",
      color: "yellow",
    },
  ]


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
              <div className="text-2xl font-bold">{stats.total_produtos}</div>
              <p className="text-xs text-slate-200">Estoque total</p>
            </CardContent>
          </Card>

          <Card className="bg-teal-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lucro Estimado</CardTitle>
              <TrendingUp className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {businessMetrics.lucro_total.toFixed(2)}</div>
              <p className="text-xs text-teal-200">Baseado nos produtos mais lucrativos</p>
            </CardContent>
          </Card>

          <Card className="bg-yellow-500 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
              <DollarSign className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {businessMetrics.ticket_medio.toFixed(2)}</div>
              <p className="text-xs text-yellow-200">Estimado por item</p>
            </CardContent>
          </Card>

          <Card className="bg-red-500 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alertas</CardTitle>
              <AlertTriangle className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.produtos_estoque_baixo}</div>
              <p className="text-xs text-red-200">Produtos com estoque baixo</p>
            </CardContent>
          </Card>
        </div>

        {/* Estoque baixo */}
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Atenção: Estoque Baixo</strong>
            <div className="mt-2 space-y-1">
              {lowStockProducts.map((product, index) => (
                <div key={index} className="flex justify-between items-center gap-8">
                  <span>{product.nome}</span>
                  <Badge variant="destructive">{product.quantidade_estoque} restantes</Badge>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>

        {/* Navegação */}
        <div className="flex gap-1 bg-white p-1 rounded-lg border">
          <Link href="/inventory">
            <Button variant="ghost" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Estoque
            </Button>
          </Link>
          <Link href="/finances">
            <Button variant="ghost" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Financeiro
            </Button>
          </Link>
          <Link href="/graphics">
            <Button variant="ghost" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Gráficos
            </Button>
          </Link>
          <Button className="flex items-center gap-2 bg-slate-600 text-white">
            <FileText className="w-4 h-4" />
            Relatórios
          </Button>
        </div>

        {/* Produtos mais lucrativos */}
        <Card>
          <CardHeader>
            <CardTitle>Análise de Produtos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-800 mb-3">Produtos mais lucrativos:</h4>
                <div className="space-y-3">
                  {mostProfitableProducts.map((product, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-800">{product.nome}</span>
                      <Badge className="bg-teal-600 text-white hover:bg-teal-700">
                        R$ {product.lucro_unitario} lucro/unidade
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recomendações */}
        <Card>
          <CardHeader>
            <CardTitle className="text-yellow-600">Recomendações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendations.map((rec, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 p-3 rounded-lg ${
                    rec.color === "yellow"
                      ? "bg-yellow-50 border border-yellow-200"
                      : rec.color === "green"
                      ? "bg-green-50 border border-green-200"
                      : "bg-blue-50 border border-blue-200"
                  }`}
                >
                  <div className="text-xl">{rec.icon}</div>
                  <div className="flex-1">
                    <h5
                      className={`font-medium ${
                        rec.color === "yellow"
                          ? "text-yellow-800"
                          : rec.color === "green"
                          ? "text-green-800"
                          : "text-blue-800"
                      }`}
                    >
                      {rec.title}
                    </h5>
                    <p
                      className={`text-sm ${
                        rec.color === "yellow"
                          ? "text-yellow-700"
                          : rec.color === "green"
                          ? "text-green-700"
                          : "text-blue-700"
                      }`}
                    >
                      {rec.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Métricas do negócio */}
        <Card>
          <CardHeader>
            <CardTitle>Métricas do Negócio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-100 p-6 rounded-lg text-center">
                <div className="text-3xl font-bold text-gray-800">
                  {businessMetrics.lucro_unitario_medio.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600 mt-1">Lucro Médio por Produto</div>
              </div>
              <div className="bg-gray-100 p-6 rounded-lg text-center">
                <div className="text-3xl font-bold text-gray-800">
                  R$ {businessMetrics.ticket_medio.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600 mt-1">Ticket Médio</div>
              </div>
              <div className="bg-gray-100 p-6 rounded-lg text-center">
                <div className="text-3xl font-bold text-gray-800">{businessMetrics.total_itens}</div>
                <div className="text-sm text-gray-600 mt-1">Itens Estocados</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Link href="/dashboard">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
