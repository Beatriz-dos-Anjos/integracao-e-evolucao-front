"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { User, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Package,
  BarChart3,
  FileText,
  ArrowRight,
} from "lucide-react"
import api from "@/services/api"

// Interface para o usuário (ensure this matches your backend response)
interface UserData {
  id: string
  nome: string
  cpf: string
  // Add other user fields if they are returned by your /users/:id API
  // e.g., data_nascimento?: string; rua?: string; cidade?: string; etc.
}

// Mock data for products and alerts (if these also come from API, you'll need to fetch them)
// For now, we'll keep them as mock if your focus is user integration.
const mockData = {
  products: [
    {
      id: 1,
      name: "Açaí 500ml",
      category: "Bebidas",
      quantity: 25,
      minStock: 10,
      purchasePrice: 3.5,
      salePrice: 8.0,
    },
    {
      id: 2,
      name: "Salgado Assado",
      category: "Alimentação",
      quantity: 30,
      minStock: 15,
      purchasePrice: 2.0,
      salePrice: 5.0,
    },
  ],
  lowStockProducts: [
    {
      id: 1,
      name: "Açaí 500ml",
      quantity: 5,
      minStock: 10,
    },
  ],
}

export default function Dashboard() {
  const [user, setUser] = useState<UserData | null>(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const [userError, setUserError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoadingUser(true)
        setUserError(null)

        const userId = localStorage.getItem("users.id") // Get user ID from localStorage
        if (!userId) {
          // If no user ID is found, set an error and stop loading
          setUserError("Usuário não logado ou ID não encontrado no armazenamento local.")
          setLoadingUser(false)
          return
        }

        console.log(`Attempting to fetch user data for ID: ${userId}`)
        const response = await api.get(`/users/${userId}`) // Make actual API call

        if (response.data) {
          setUser({
            ...response.data,
            id: String(response.data.id), // Ensure ID is string
          })
          console.log("User data loaded successfully:", response.data)
        } else {
          setUserError("Dados do usuário não encontrados na resposta da API.")
        }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error("Erro ao carregar dados do usuário:", err)
        if (err.response) {
          // If it's an Axios error with a response
          setUserError(
            `Erro: ${err.response.status} - ${
              err.response.data.message || "Não foi possível carregar os dados do usuário"
            }`
          )
        } else if (err.request) {
          // If the request was made but no response was received
          setUserError("Erro de rede: Não foi possível conectar ao servidor.")
        } else {
          // Something else happened in setting up the request that triggered an Error
          setUserError("Erro desconhecido ao carregar dados do usuário.")
        }
      } finally {
        setLoadingUser(false)
      }
    }

    fetchUserData()
  }, []) // Empty dependency array means this runs once on component mount

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-4">
            {/* Make sure /logo.svg exists in your public directory */}
            <Image src="/logo.svg" alt="Logo" width={144} height={60} />
            <h1 className="text-3xl font-bold text-gray-800">Micro Sistema Gerencial</h1>
          </div>
          <p className="text-gray-600">Controle seu negócio de forma simples e inteligente</p>
        </div>

        {/* User Info and Account Button */}
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
            {/* The button is enabled only if `user` object exists and `user.id` is available */}
            {user?.id ? (
              <Link href={`/my-account/${user.id}`}>
                <Button variant="outline" size="sm">
                  <User className="w-4 h-4 mr-2" />
                  Minha Conta
                </Button>
              </Link>
            ) : (
              // Button is disabled if user or user.id is not available
              <Button variant="outline" size="sm" disabled>
                <User className="w-4 h-4 mr-2" />
                Minha Conta
              </Button>
            )}
          </div>
        </div>

        {/* User Error Alert */}
        {userError && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>Aviso:</strong> {userError}. Verifique sua conexão ou login.
            </AlertDescription>
          </Alert>
        )}

        {/* Dashboard Cards (These still use mockData for now) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-slate-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
              <Package className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockData.products.length}</div>
              <p className="text-xs text-slate-200">{mockData.products.length} tipos diferentes</p>
            </CardContent>
          </Card>

          <Card className="bg-teal-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lucro do Mês</CardTitle>
              <TrendingUp className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ 5000</div>
              <p className="text-xs text-teal-200">+20% margem</p>
            </CardContent>
          </Card>

          <Card className="bg-yellow-500 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor do Estoque</CardTitle>
              <DollarSign className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ 2000</div>
              <p className="text-xs text-yellow-200">Investimento atual</p>
            </CardContent>
          </Card>

          <Card className="bg-red-500 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alertas</CardTitle>
              <AlertTriangle className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockData.lowStockProducts.length}</div>
              <p className="text-xs text-red-200">Produtos com estoque baixo</p>
            </CardContent>
          </Card>
        </div>

        {/* Low Stock Alert */}
        {mockData.lowStockProducts.length > 0 && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Atenção: Estoque Baixo</strong>
              <div className="mt-2 space-y-1">
                {mockData.lowStockProducts.map((product) => (
                  <div key={product.id} className="flex justify-between items-center gap-8">
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

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/inventory">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-slate-300">
              <CardHeader className="text-center">
                <Package className="w-12 h-12 mx-auto text-slate-600 mb-2" />
                <CardTitle className="text-slate-700">Estoque</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-gray-600 mb-4">Gerencie produtos e monitore níveis de estoque</p>
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
                <p className="text-sm text-gray-600 mb-4">Controle receitas, despesas e fluxo de caixa</p>
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
                <p className="text-sm text-gray-600 mb-4">Visualize dados e tendências do negócio</p>
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
                <p className="text-sm text-gray-600 mb-4">Gere relatórios detalhados e análises</p>
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