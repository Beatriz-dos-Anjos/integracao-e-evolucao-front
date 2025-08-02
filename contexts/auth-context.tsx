/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import api from "@/services/api"

interface User {
  id: string
  nome: string
  cpf: string
}

interface AuthContextType {
  user: User | null
  userId: string | null
  loading: boolean
  error: string | null
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUser = async (id: string) => {
    try {
      const response = await api.get(`/users/${id}`)
      const userData = {
        ...response.data,
        id: String(response.data.id),
      }
      setUser(userData)
      setError(null)
    } catch (err: any) {
      if (err.response) {
        setError(`Erro: ${err.response.status} - ${err.response.data.message}`)
      } else if (err.request) {
        setError("Erro de rede: Não foi possível conectar ao servidor.")
      } else {
        setError("Erro desconhecido ao carregar dados do usuário.")
      }
      setUser(null)
    }
  }

  const refreshUser = async () => {
    if (userId) {
      setLoading(true)
      await fetchUser(userId)
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("users.id")
    setUser(null)
    setUserId(null)
    setError(null)
  }

  useEffect(() => {
    const initAuth = async () => {
      const storedUserId = localStorage.getItem("users.id")
      const token = localStorage.getItem("token")

      if (!storedUserId || !token) {
        setLoading(false)
        return
      }

      setUserId(storedUserId)
      await fetchUser(storedUserId)
      setLoading(false)
    }

    initAuth()
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        userId,
        loading,
        error,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
