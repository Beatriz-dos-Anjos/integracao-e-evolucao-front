/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useCallback } from "react"
import aiApi from "@/services/ai-api"

interface RecommendationData {
  recommendations: string
  loading: boolean
  error: string | null
  lastUpdated: Date | null
}

export function useAiRecommendations() {
  const [data, setData] = useState<RecommendationData>({
    recommendations: "",
    loading: false,
    error: null,
    lastUpdated: null,
  })

  const fetchRecommendations = useCallback(async (userId = 3) => {
    setData((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const response = await aiApi.get(`/analytics/recomendacoes?id_usuario=${userId}`)

      setData({
        recommendations: response.data.recomendacoes || "",
        loading: false,
        error: null,
        lastUpdated: new Date(),
      })
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || "Erro ao carregar recomendações de IA"

      setData((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }))
    }
  }, [])

  const clearError = useCallback(() => {
    setData((prev) => ({ ...prev, error: null }))
  }, [])

  return {
    ...data,
    fetchRecommendations,
    clearError,
    hasRecommendations: !!data.recommendations && !data.loading,
  }
}
