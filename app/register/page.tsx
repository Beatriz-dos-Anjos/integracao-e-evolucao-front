"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Eye, EyeOff } from "lucide-react"
import Image from "next/image"
import api from "@/services/api"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    cpf: "",
    email: "",
    password: "",
    confirmPassword: "",
    birthDate: "",
    street: "",
    city: "",
    neighborhood: "",
    country: "",
  })

  const [showPasswordFields, setShowPasswordFields] = useState({
    password: false,
    confirmPassword: false,
  })

  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const toggleShow = (name: string) => {
    setShowPasswordFields((prev) => ({
      ...prev,
      [name]: !prev[name as keyof typeof prev],
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

      await api.post("/auth/register", {
        nome: formData.fullName,
        cpf: formData.cpf,
        email: formData.email,
        password: formData.password,
        data_nascimento: formData.birthDate,
        rua: formData.street,
        cidade: formData.city,
        bairro: formData.neighborhood,
        pais: formData.country,
      })

      alert("Cadastro realizado com sucesso!")
      router.push("/login")
    } catch (error: unknown) {
      const msg =
        (error as { response?: { data?: { error?: string } } })?.response?.data?.error || "Erro ao cadastrar"
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
            <form onSubmit={handleRegister} className="space-y-4">
              <InputGroup label="Nome completo" name="fullName" value={formData.fullName} onChange={handleInputChange} />
              <InputGroup label="CPF" name="cpf" value={formData.cpf} onChange={handleInputChange} />
              <InputGroup label="Email" name="email" type="email" value={formData.email} onChange={handleInputChange} />
              <InputGroup label="Data de nascimento" name="birthDate" type="date" value={formData.birthDate} onChange={handleInputChange} />
              <InputGroup label="Rua" name="street" value={formData.street} onChange={handleInputChange} />
              <InputGroup label="Cidade" name="city" value={formData.city} onChange={handleInputChange} />
              <InputGroup label="Bairro" name="neighborhood" value={formData.neighborhood} onChange={handleInputChange} />
              <InputGroup label="País" name="country" value={formData.country} onChange={handleInputChange} />

              <PasswordInput
                label="Senha"
                name="password"
                value={formData.password}
                show={showPasswordFields.password}
                toggleShow={toggleShow}
                onChange={handleInputChange}
              />

              <PasswordInput
                label="Confirmar senha"
                name="confirmPassword"
                value={formData.confirmPassword}
                show={showPasswordFields.confirmPassword}
                toggleShow={toggleShow}
                onChange={handleInputChange}
              />

              <Button
                type="submit"
                className="w-full bg-[#004C5F] hover:bg-[#003C4B] text-white"
                disabled={loading}
              >
                {loading ? "Cadastrando..." : "Registrar"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-petrol-blue/60">
                Já tem uma conta?{" "}
                <Link href="/" className="text-mint-green font-medium hover:text-mint-green/80">
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

function InputGroup({
  label,
  name,
  value,
  onChange,
  type = "text",
}: {
  label: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  type?: string
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} value={value} onChange={onChange} type={type} required />
    </div>
  )
}

function PasswordInput({
  label,
  name,
  value,
  show,
  toggleShow,
  onChange,
}: {
  label: string
  name: string
  value: string
  show: boolean
  toggleShow: (name: string) => void
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <div className="relative">
        <Input
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          type={show ? "text" : "password"}
          className="pr-10"
          required
        />
        <button
          type="button"
          onClick={() => toggleShow(name)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}
