/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useEffect } from "react"
import { useAiRecommendations } from "@/hooks/useAiRecommendations"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Brain, RefreshCw, Loader2, Lightbulb, TrendingUp, Target, Clock } from "lucide-react"

interface AiRecommendationsProps {
  userId?: number
  autoLoad?: boolean
  className?: string
}

export function AiRecommendations({ userId = 1, autoLoad = true, className = "" }: AiRecommendationsProps) {
  const { recommendations, loading, error, lastUpdated, fetchRecommendations, clearError, hasRecommendations } =
    useAiRecommendations()

  useEffect(() => {
    if (autoLoad) {
      fetchRecommendations(userId)
    }
  }, [fetchRecommendations, userId, autoLoad])

  const parseRecommendations = (text: string) => {
    if (!text) return []

    const lines = text.split("\n").filter((line) => line.trim())

    return lines
      .map((line, index) => {
        const cleanLine = line.replace(/^[-*•\d.)\s]+/, "").trim()

        // Determina o ícone baseado no conteúdo
        let icon = <Lightbulb key={`icon-${index}`} className="w-4 h-4 text-yellow-500" />
        let bgColor = "bg-yellow-50 border-yellow-200"
        let textColor = "text-yellow-800"

        if (cleanLine.toLowerCase().includes("receita") || cleanLine.toLowerCase().includes("venda")) {
          icon = <TrendingUp key={`icon-${index}`} className="w-4 h-4 text-green-500" />
          bgColor = "bg-green-50 border-green-200"
          textColor = "text-green-800"
        } else if (cleanLine.toLowerCase().includes("estoque") || cleanLine.toLowerCase().includes("produto")) {
          icon = <Target key={`icon-${index}`} className="w-4 h-4 text-blue-500" />
          bgColor = "bg-blue-50 border-blue-200"
          textColor = "text-blue-800"
        }

        return {
          id: index,
          text: cleanLine,
          icon,
          bgColor,
          textColor,
        }
      })
      .filter((item) => item.text.length > 10) // Filtra recomendações muito curtas
  }

  const formattedRecommendations = parseRecommendations(recommendations)

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-600" />
          <CardTitle className="text-lg font-semibold text-purple-600">Recomendações Inteligentes</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              {lastUpdated.toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchRecommendations(userId)}
            disabled={loading}
            className="h-8"
          >
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
            {loading ? "Gerando..." : "Atualizar"}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center space-y-2">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto" />
              <p className="text-sm text-gray-600">Analisando seus dados e gerando recomendações personalizadas...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-4 h-4 text-red-600" />
              <h4 className="font-medium text-red-800">Erro ao carregar recomendações</h4>
            </div>
            <p className="text-sm text-red-700 mb-3">{error}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => fetchRecommendations(userId)}>
                <RefreshCw className="w-3 h-3 mr-1" />
                Tentar Novamente
              </Button>
              <Button variant="ghost" size="sm" onClick={clearError}>
                Dispensar
              </Button>
            </div>
          </div>
        )}

        {hasRecommendations && (
          <div className="space-y-3">
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-4 h-4 text-purple-600" />
                <h4 className="font-medium text-purple-800">Análise Personalizada do seu Negócio</h4>
              </div>

              <div className="space-y-3">
                {formattedRecommendations.map((rec) => (
                  <div
                    key={rec.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border ${rec.bgColor} transition-all hover:shadow-sm`}
                  >
                    <div className="mt-0.5">{rec.icon}</div>
                    <p className={`text-sm leading-relaxed ${rec.textColor} flex-1`}>{rec.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-xs text-gray-500 text-center">
              💡 Recomendações baseadas em análise de dados em tempo real
            </div>
          </div>
        )}

        {!loading && !error && !hasRecommendations && (
          <div className="text-center py-8 space-y-3">
            <Brain className="w-12 h-12 text-gray-300 mx-auto" />
            <div className="space-y-1">
              <p className="text-gray-600 font-medium">Nenhuma recomendação disponível</p>
              <p className="text-sm text-gray-500">
                Clique em &quot;Atualizar&quot; para gerar recomendações baseadas nos seus dados
              </p>
            </div>
            <Button variant="outline" onClick={() => fetchRecommendations(userId)} className="mt-3">
              <Brain className="w-4 h-4 mr-2" />
              Gerar Recomendações
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
