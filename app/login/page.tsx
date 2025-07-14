"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { MaskedInput } from "@/components/ui/inputMask"
import Image from "next/image"
import api from "@/services/api"

export default function LoginPage() {
  const [formData, setFormData] = useState({ cpf: "", password: "" })
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleMaskedChange = (value: string) => {
    setFormData((prev) => ({ ...prev, cpf: value }))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

 const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)

  try {
    if (!formData.cpf || !formData.password) {
      return alert("CPF e senha são obrigatórios")
    }

    const response = await api.post("/auth/login", {
      cpf: formData.cpf,
      password: formData.password
    })

    const token = response.data.token
    localStorage.setItem("token", token)

    // Decodificar o token JWT para pegar o userId
    const [, payloadBase64] = token.split(".")
    const payload = JSON.parse(atob(payloadBase64)) // decodifica o base64

    const userId = payload.userId
    if (!userId) {
      alert("ID do usuário não encontrado no token.")
      return
    }

    localStorage.setItem("users.id", String(userId))

    router.push("/dashboard")
  } catch (error: unknown) {
    const msg = (error as { response?: { data?: { error?: string } } })?.response?.data?.error || "Erro ao fazer login"
    alert(msg)
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
              <Image src="/logo.svg" alt="Logo" width={144} height={60} />
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF</Label>
                <MaskedInput
                  id="cpf"
                  name="cpf"
                  mask="000.000.000-00"
                  value={formData.cpf}
                  onAccept={handleMaskedChange}
                  placeholder="000.000.000-00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-[#004C5F] hover:bg-[#003C4B] text-white"
                disabled={loading}
              >
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-petrol-blue/60">
                Não tem uma conta?{" "}
                <Link
                  href="/register"
                  className="text-mint-green font-medium hover:text-mint-green/80"
                >
                  Cadastre-se aqui
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
