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
} from "lucide-react"

export default function RelatoriosPage() {
  // Mock data para os relatórios
  const mockData = {
    totalProducts: 60,
    totalCategories: 3,
    monthlyProfit: 70.0,
    profitMargin: 60.9,
    stockValue: 127.5,
    alerts: 1,
    lowStockProducts: [{ name: "Água Mineral", quantity: 5, minStock: 15 }],
  }

  const mostProfitableProducts = [
    { name: "Açaí 500ml", profitPerUnit: 4.5 },
    { name: "Salgado Assado", profitPerUnit: 2.3 },
    { name: "Água Mineral", profitPerUnit: 1.2 },
  ]

  const businessMetrics = {
    profitMargin: 60.9,
    averageTicket: 57.5,
    itemsSold: 85,
  }

  const recommendations = [
    {
      type: "warning",
      icon: "⚠️",
      title: "Reabastecer Estoque",
      description: "1 produto com estoque baixo precisam ser reabastecidos.",
      color: "yellow",
    },
    {
      type: "success",
      icon: "✅",
      title: "Ótimo Desempenho",
      description: "Seu negócio está gerando lucro de R$ 70.00 neste período!",
      color: "green",
    },
    {
      type: "tip",
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

        {/* Navigation Tabs */}
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

        {/* Reports Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Product Analysis */}
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
                        <span className="font-medium text-gray-800">{product.name}</span>
                        <Badge className="bg-teal-600 text-white hover:bg-teal-700">
                          R$ {product.profitPerUnit.toFixed(2)} lucro/unidade
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
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
        </div>

        {/* Business Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Métricas do Negócio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-100 p-6 rounded-lg text-center">
                <div className="text-3xl font-bold text-gray-800">{businessMetrics.profitMargin}%</div>
                <div className="text-sm text-gray-600 mt-1">Margem de Lucro</div>
              </div>
              <div className="bg-gray-100 p-6 rounded-lg text-center">
                <div className="text-3xl font-bold text-gray-800">R$ {businessMetrics.averageTicket.toFixed(2)}</div>
                <div className="text-sm text-gray-600 mt-1">Ticket Médio</div>
              </div>
              <div className="bg-gray-100 p-6 rounded-lg text-center">
                <div className="text-3xl font-bold text-gray-800">{businessMetrics.itemsSold}</div>
                <div className="text-sm text-gray-600 mt-1">Itens Vendidos</div>
              </div>
            </div>
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
