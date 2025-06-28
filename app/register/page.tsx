"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserPlus, Eye, EyeOff, Store } from "lucide-react"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    businessName: "",
    ownerName: "",
    cnpj: "",
    cpf: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (formData.password !== formData.confirmPassword) {
        throw new Error("As senhas não coincidem")
      }

      if (formData.password.length < 6) {
        throw new Error("A senha deve ter pelo menos 6 caracteres")
      }

      localStorage.setItem("isAuthenticated", "true")
      localStorage.setItem("userEmail", formData.email)
      localStorage.setItem("userName", formData.ownerName)
      localStorage.setItem("businessName", formData.businessName)

      router.push("/login")
    } catch (error) {
      alert(error instanceof Error ? error.message : "Erro no cadastro. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-petrol-blue/10 to-mint-green/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
       

        <Card className="shadow-xl border-petrol-blue/20">
          <CardHeader className="text-center bg-petrol-blue/5">
            <div className="flex justify-center mb-4">
              <img src="/logo.svg" alt="Logo" className="w-36 h-15" />
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="businessName" className="text-petrol-blue font-medium">
                  Nome da empresa
                </Label>
                <Input
                  id="businessName"
                  name="businessName"
                  type="text"
                  placeholder="nome"
                  value={formData.businessName}
                  onChange={handleInputChange}
                  className="border-petrol-blue/20 focus:border-mint-green focus:ring-mint-green"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ownerName" className="text-petrol-blue font-medium">
                  Nome do empreendedor
                </Label>
                <Input
                  id="ownerName"
                  name="ownerName"
                  type="text"
                  placeholder="nome completo"
                  value={formData.ownerName}
                  onChange={handleInputChange}
                  className="border-petrol-blue/20 focus:border-mint-green focus:ring-mint-green"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cnpj" className="text-petrol-blue font-medium">
                  CNPJ
                </Label>
                <Input
                  id="cnpj"
                  name="cnpj"
                  type="text"
                  placeholder="00.000.000/0000-00"
                  value={formData.cnpj}
                  onChange={handleInputChange}
                  className="border-petrol-blue/20 focus:border-mint-green focus:ring-mint-green"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cpf" className="text-petrol-blue font-medium">
                  CPF
                </Label>
                <Input
                  id="cpf"
                  name="cpf"
                  type="text"
                  placeholder="000.000.000-00"
                  value={formData.cpf}
                  onChange={handleInputChange}
                  className="border-petrol-blue/20 focus:border-mint-green focus:ring-mint-green"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-petrol-blue font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="border-petrol-blue/20 focus:border-mint-green focus:ring-mint-green"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-petrol-blue font-medium">
                  Senha
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="senha (mín. 6 caracteres)"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pr-10 border-petrol-blue/20 focus:border-mint-green focus:ring-mint-green"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-petrol-blue/60 hover:text-petrol-blue"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-petrol-blue font-medium">
                  Confirmar senha
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="confirme sua senha"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="pr-10 border-petrol-blue/20 focus:border-mint-green focus:ring-mint-green"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-petrol-blue/60 hover:text-petrol-blue"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-petrol-blue hover:bg-petrol-blue/90 text-white"
                disabled={loading}
              >
                {loading ? "Criando conta..." : "Criar conta"}
              </Button>
              <Button
                type="submit"
                className="w-full bg-slate-600 hover:bg-slate-700 text-white font-semibold py-2 transition-all"
              >
                {loading ? "Cadastrando..." : "Cadastrar"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-petrol-blue/60">
                Já tem uma conta?{" "}
                <Link
                  href="/"
                  className="text-mint-green font-medium hover:text-mint-green/80 transition-colors"
                >
                  Entrar aqui
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
