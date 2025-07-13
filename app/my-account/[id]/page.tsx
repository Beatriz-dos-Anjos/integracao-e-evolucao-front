"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import {
  User,
  MapPin,
  ArrowLeft,
  Save,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react"
import api from "@/services/api" 

interface UserFormData {
  nome: string
  cpf: string
  password?: string 
  data_nascimento: string
  rua: string
  cidade: string
  bairro: string
  pais: string
}

const MinhaConta = () => {
  const params = useParams() 
  const userCpfParam = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false) 
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState<UserFormData>({
    nome: "",
    cpf: "",
    password: "",
    data_nascimento: "",
    rua: "",
    cidade: "",
    bairro: "",
    pais: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userCpfParam) {
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)
      try {
        const response = await api.get(`users/${userCpfParam}`)
        // Garante que todos os campos tenham valores string válidos
        setFormData({
          nome: response.data.nome || "",
          cpf: response.data.cpf || "",
          password: "", // Password sempre vazia para segurança
          data_nascimento: response.data.data_nascimento || "",
          rua: response.data.rua || "",
          cidade: response.data.cidade || "",
          bairro: response.data.bairro || "",
          pais: response.data.pais || "",
        })
      } catch (err) {
        console.error("Erro ao carregar dados do usuário:", err)
        setError("Não foi possível carregar os dados do usuário. Tente novamente.")
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [userCpfParam]) 

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true) 
    setError(null) 
    setSuccessMessage(null)

    try {
      console.log("Dados do formulário para envio:", formData)

      const response = await api.put('/users/1', formData)
      console.log("Resposta da API:", response.data)
      setSuccessMessage("Informações salvas com sucesso!")

    } catch (err) {
      console.error("Erro ao salvar alterações:", err)
      setError("Não foi possível salvar as alterações. Verifique os dados e tente novamente.")
    } finally {
      setSaving(false) 
    }
  }

  if (error && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center justify-center">
        <p className="text-red-500 text-lg mb-4">{error}</p>
        <Link href="/dashboard">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Dashboard
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Cabeçalho */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="mr-auto">
            <Button variant="outline" size="sm" className="rounded-md shadow-sm hover:bg-gray-100">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Dashboard
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <div className="bg-black text-white px-4 py-2 rounded-md font-bold text-lg shadow-md">MSG</div>
            <h1 className="text-3xl font-bold text-gray-800">Minha Conta</h1>
          </div>
        </div>

        <div className="text-center">
          <p className="text-gray-600">Gerencie suas informações pessoais</p>
        </div>

        <Card className="rounded-lg shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <User className="h-5 w-5" />
              Informações Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome" className="text-gray-700">Nome Completo</Label>
                  <Input
                    id="nome"
                    name="nome"
                    type="text"
                    value={formData.nome}
                    onChange={handleInputChange}
                    required
                    className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cpf" className="text-gray-700">CPF</Label>
                  <Input
                    id="cpf"
                    name="cpf"
                    type="text"
                    value={formData.cpf}
                    onChange={handleInputChange}
                    required
                    disabled 
                    className="rounded-md border-gray-300 bg-gray-100 cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data_nascimento" className="text-gray-700">Data de Nascimento</Label>
                  <Input
                    id="data_nascimento"
                    name="data_nascimento"
                    type="date"
                    value={formData.data_nascimento}
                    onChange={handleInputChange}
                    required
                    className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700">Nova Senha (deixe em branco para manter a atual)</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password || ""}
                    onChange={handleInputChange}
                    placeholder="Digite uma nova senha"
                    className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent rounded-md"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
                  <MapPin className="h-5 w-5" />
                  Endereço
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rua" className="text-gray-700">Rua</Label>
                    <Input
                      id="rua"
                      name="rua"
                      type="text"
                      value={formData.rua}
                      onChange={handleInputChange}
                      required
                      className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bairro" className="text-gray-700">Bairro</Label>
                    <Input
                      id="bairro"
                      name="bairro"
                      type="text"
                      value={formData.bairro}
                      onChange={handleInputChange}
                      required
                      className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cidade" className="text-gray-700">Cidade</Label>
                    <Input
                      id="cidade"
                      name="cidade"
                      type="text"
                      value={formData.cidade}
                      onChange={handleInputChange}
                      required
                      className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pais" className="text-gray-700">País</Label>
                    <Input
                      id="pais"
                      name="pais"
                      type="text"
                      value={formData.pais}
                      onChange={handleInputChange}
                      required
                      className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="text-red-500 text-sm mt-4 p-2 bg-red-100 border border-red-200 rounded-md">
                  {error}
                </div>
              )}

              {successMessage && (
                <div className="text-green-600 text-sm mt-4 p-2 bg-green-100 border border-green-200 rounded-md">
                  {successMessage}
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-200 ease-in-out"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
                
                <Link href="/dashboard">
                  <Button type="button" variant="outline" className="rounded-md shadow-sm hover:bg-gray-100">
                    Cancelar
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default MinhaConta