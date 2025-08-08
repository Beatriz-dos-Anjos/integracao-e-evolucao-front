 
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  User,
  MapPin,
  ArrowLeft,
  Save,
  Eye,
  EyeOff,
  Loader2,
  AlertTriangle,
  CheckCircle,
  LogOut,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import api from "@/services/api"

interface UserFormData {
  id: string
  nome: string
  cpf: string
  password?: string 
  data_nascimento: string
  rua: string
  cidade: string
  bairro: string
  pais: string
}

const MyAccount = () => {
  const params = useParams()
  const userId = params?.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState<UserFormData>({
    id: "",
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
      if (!userId) {
        setError("ID do usuário não fornecido na URL.")
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)
      setSuccessMessage(null) 

      try {
        console.log(`Buscando dados do usuário: ${userId}`)
        const response = await api.get(`/users/${userId}`)

        if (response.data) {
          setFormData({
            id: String(response.data.id || userId), 
            nome: response.data.nome || "",
            cpf: response.data.cpf || "",
            password: "", 
            data_nascimento: response.data.data_nascimento || "",
            rua: response.data.rua || "",
            cidade: response.data.cidade || "",
            bairro: response.data.bairro || "",
            pais: response.data.pais || "",
          })
          console.log("Dados do usuário carregados:", response.data)
        } else {
          setError("Nenhum dado retornado para este usuário.")
        }
      } catch (err: any) {
        console.error("Erro ao carregar dados do usuário:", err)
        if (err.response) {
          setError(
            `Erro: ${err.response.status} - ${
              err.response.data.message || "Não foi possível carregar os dados do usuário."
            }`
          )
        } 
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [userId]) 


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setSaving(true)
  setError(null)
  setSuccessMessage(null)

  try {
    const dataToSend: Partial<UserFormData> = {
      nome: formData.nome,
      cpf: formData.cpf,
      data_nascimento: formData.data_nascimento,
      rua: formData.rua,
      cidade: formData.cidade,
      bairro: formData.bairro,
      pais: formData.pais,
    }

    if (formData.password) {
      dataToSend.password = formData.password
    }

    const response = await api.put(`/users/${userId}`, dataToSend)

    console.log("Resposta da API:", response.data)
    setSuccessMessage("Informações salvas com sucesso!")
    setFormData((prev) => ({ ...prev, password: "" }))
  } catch (err: any) {
    console.error("Erro ao salvar alterações:", err)
  } finally {
    setSaving(false)
  }
}


  const handleLogout = () => {
    localStorage.removeItem("token")
    window.location.href = "/"
  }

  
  return (
    <div className="min-h-screen bg-gradient-account">
      <div className="container mx-auto max-w-4xl px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Voltar ao Dashboard
              </Button>
            </Link>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
          
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-foreground">Minha Conta</h1>
            <div className="flex justify-center mb-4">
              <Image src="/logo.svg" alt="Logo" width={154} height={60} />
            </div>
            <p className="text-muted-foreground text-lg">
              Gerencie suas informações pessoais
              {formData.nome && <span className="font-medium"> - {formData.nome}</span>}
            </p>

          </div>
        </div>

        <div className="space-y-6">
          <Card className="bg-gradient-card shadow-account-card border-0">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl text-foreground">
                <div className="p-2 bg-account-primary/10 rounded-lg">
                  <User className="h-5 w-5 text-account-primary" />
                </div>
                Informações Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="nome" className="text-sm font-medium text-foreground">
                      Nome Completo
                    </Label>
                    <Input
                      id="nome"
                      name="nome"
                      type="text"
                      value={formData.nome}
                      onChange={handleInputChange}
                      required
                      className="h-11 border-border/50 focus:border-account-primary focus:ring-account-primary/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cpf" className="text-sm font-medium text-foreground">
                      CPF
                    </Label>
                    <Input
                      id="cpf"
                      name="cpf"
                      type="text"
                      value={formData.cpf}
                      onChange={handleInputChange}
                      required
                      disabled
                      className="h-11 bg-muted/30 border-border/30 cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="data_nascimento" className="text-sm font-medium text-foreground">
                      Data de Nascimento
                    </Label>
                    <Input
                      id="data_nascimento"
                      name="data_nascimento"
                      type="date"
                      value={formData.data_nascimento}
                      onChange={handleInputChange}
                      required
                      className="h-11 border-border/50 focus:border-account-primary focus:ring-account-primary/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-foreground">
                      Nova Senha
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password || ""}
                        onChange={handleInputChange}
                        placeholder="Digite uma nova senha"
                        className="h-11 border-border/50 focus:border-account-primary focus:ring-account-primary/20 pr-12"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1 h-9 w-9 p-0"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Deixe em branco para manter a senha atual
                    </p>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-account-card border-0">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl text-foreground">
                <div className="p-2 bg-account-primary/10 rounded-lg">
                  <MapPin className="h-5 w-5 text-account-primary" />
                </div>
                Endereço
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="rua" className="text-sm font-medium text-foreground">
                    Rua
                  </Label>
                  <Input
                    id="rua"
                    name="rua"
                    type="text"
                    value={formData.rua}
                    onChange={handleInputChange}
                    required
                    className="h-11 border-border/50 focus:border-account-primary focus:ring-account-primary/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bairro" className="text-sm font-medium text-foreground">
                    Bairro
                  </Label>
                  <Input
                    id="bairro"
                    name="bairro"
                    type="text"
                    value={formData.bairro}
                    onChange={handleInputChange}
                    required
                    className="h-11 border-border/50 focus:border-account-primary focus:ring-account-primary/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cidade" className="text-sm font-medium text-foreground">
                    Cidade
                  </Label>
                  <Input
                    id="cidade"
                    name="cidade"
                    type="text"
                    value={formData.cidade}
                    onChange={handleInputChange}
                    required
                    className="h-11 border-border/50 focus:border-account-primary focus:ring-account-primary/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pais" className="text-sm font-medium text-foreground">
                    País
                  </Label>
                  <Input
                    id="pais"
                    name="pais"
                    type="text"
                    value={formData.pais}
                    onChange={handleInputChange}
                    required
                    className="h-11 border-border/50 focus:border-account-primary focus:ring-account-primary/20"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {error && (
            <Alert className="border-account-error bg-account-error-bg">
              <AlertTriangle className="h-4 w-4 text-account-error" />
              <AlertDescription className="text-account-error font-medium">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {successMessage && (
            <Alert className="border-account-success bg-account-success-bg">
              <CheckCircle className="h-4 w-4 text-account-success" />
              <AlertDescription className="text-account-success font-medium">
                {successMessage}
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={saving}
              variant="default"
              size="lg"
              className="flex-1 h-12"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Salvar Alterações
                </>
              )}
            </Button>

            <Link href="/" className="flex-1">
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full h-12"
              >
                Cancelar
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MyAccount