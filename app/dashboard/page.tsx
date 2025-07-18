"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { User, Loader2, AlertTriangle, Package, TrendingUp, DollarSign, BarChart3, FileText, ArrowRight } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import api from "@/services/api"

interface UserData {
  id: string
  nome: string
  cpf: string
}

interface DashboardData {
  totalProdutos: number
  inventoryValue: number
  monthlyProfit: number
  lowStockProducts: {
    id: number
    nome: string
    quantidade_estoque: number
  }[]
}

export default function Dashboard() {
  const [user, setUser] = useState<UserData | null>(null)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const [loadingDashboard, setLoadingDashboard] = useState(true)
  const [userError, setUserError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = localStorage.getItem("users.id")
        if (!userId) {
          setUserError("Usuário não logado ou ID não encontrado no armazenamento local.")
          return
        }
        const response = await api.get(`/users/${userId}`)
        setUser({
          ...response.data,
          id: String(response.data.id),
        })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        if (err.response) {
          setUserError(`Erro: ${err.response.status} - ${err.response.data.message}`)
        } else if (err.request) {
          setUserError("Erro de rede: Não foi possível conectar ao servidor.")
        } else {
          setUserError("Erro desconhecido ao carregar dados do usuário.")
        }
      } finally {
        setLoadingUser(false)
      }
    }

    const fetchDashboard = async () => {
      try {
        const res = await api.get("/api/dashboard/summary")
        setDashboardData(res.data)
      } catch (err) {
        console.error("Erro ao carregar dashboard:", err)
      } finally {
        setLoadingDashboard(false)
      }
    }

    fetchUserData()
    fetchDashboard()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-4">
            <Image src="/logo.svg" alt="Logo" width={144} height={60} />
            <h1 className="text-3xl font-bold text-gray-800">Micro Sistema Gerencial</h1>
          </div>
          <p className="text-gray-600">Controle seu negócio de forma simples e inteligente</p>
        </div>

        {/* User Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {loadingUser ? (
              <div className="flex items-center gap-2 text-gray-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Carregando usuário...</span>
              </div>
            ) : user ? (
              <div className="flex items-center gap-2 text-gray-700">
                <User className="w-5 h-5" />
                <span>
                  Bem-vindo, <strong>{user.nome}</strong>
                </span>
              </div>
            ) : (
              <div className="text-red-500 text-sm">{userError || "Usuário não encontrado"}</div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {user?.id ? (
              <Link href={`/my-account/${user.id}`}>
                <Button variant="outline" size="sm">
                  <User className="w-4 h-4 mr-2" />
                  Minha Conta
                </Button>
              </Link>
            ) : (
              <Button variant="outline" size="sm" disabled>
                <User className="w-4 h-4 mr-2" />
                Minha Conta
              </Button>
            )}
          </div>
        </div>

        {userError && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>Aviso:</strong> {userError}. Verifique sua conexão ou login.
            </AlertDescription>
          </Alert>
        )}

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-slate-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
              <Package className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loadingDashboard ? "..." : dashboardData?.totalProdutos ?? 0}
              </div>
              <p className="text-xs text-slate-200">tipos diferentes</p>
            </CardContent>
          </Card>

          <Card className="bg-teal-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lucro do Mês</CardTitle>
              <TrendingUp className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loadingDashboard ? "..." : `R$ ${dashboardData?.monthlyProfit?.toFixed(2) ?? 0}`}
              </div>
              <p className="text-xs text-teal-200">+ lucro líquido</p>
            </CardContent>
          </Card>

          <Card className="bg-yellow-500 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor do Estoque</CardTitle>
              <DollarSign className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loadingDashboard ? "..." : `R$ ${dashboardData?.inventoryValue?.toFixed(2) ?? 0}`}
              </div>
              <p className="text-xs text-yellow-200">Investimento atual</p>
            </CardContent>
          </Card>

          <Card className="bg-red-500 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alertas</CardTitle>
              <AlertTriangle className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loadingDashboard ? "..." : dashboardData?.lowStockProducts?.length ?? 0}
              </div>
              <p className="text-xs text-red-200">Produtos com estoque baixo</p>
            </CardContent>
          </Card>
        </div>

        {/* Alerta de Estoque Baixo */}
        {dashboardData?.lowStockProducts?.length > 0 && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Atenção: Estoque Baixo</strong>
              <div className="mt-2 space-y-1">
                {dashboardData.lowStockProducts.map((product) => (
                  <div key={product.id} className="flex justify-between items-center gap-8">
                    <span>{product.nome}</span>
                    <Badge variant="destructive">
                      {product.quantidade_estoque} restantes (mín: 10)
                    </Badge>
                  </div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Navegação */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/inventory">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-slate-300">
              <CardHeader className="text-center">
                <Package className="w-12 h-12 mx-auto text-slate-600 mb-2" />
                <CardTitle className="text-slate-700">Estoque</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-gray-600 mb-4">Gerencie produtos e estoque</p>
                <Button className="w-full bg-slate-600 hover:bg-slate-700">
                  Acessar <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/finances">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-teal-300">
              <CardHeader className="text-center">
                <DollarSign className="w-12 h-12 mx-auto text-teal-600 mb-2" />
                <CardTitle className="text-teal-700">Financeiro</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-gray-600 mb-4">Controle receitas e despesas</p>
                <Button className="w-full bg-teal-600 hover:bg-teal-700">
                  Acessar <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/graphics">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-blue-300">
              <CardHeader className="text-center">
                <BarChart3 className="w-12 h-12 mx-auto text-blue-600 mb-2" />
                <CardTitle className="text-blue-700">Gráficos</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-gray-600 mb-4">Visualize dados e tendências</p>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Acessar <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/reports">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-purple-300">
              <CardHeader className="text-center">
                <FileText className="w-12 h-12 mx-auto text-purple-600 mb-2" />
                <CardTitle className="text-purple-700">Relatórios</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-gray-600 mb-4">Gere relatórios detalhados</p>
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  Acessar <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
