"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DollarSign, Plus, Trash2, ArrowLeft, Home } from "lucide-react"

interface Transaction {
  id: number
  type: "receita" | "despesa"
  category: string
  description: string
  value: number
  date: string
}

export default function FinanceiroPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 1,
      type: "receita",
      category: "Vendas",
      description: "Venda de salgados",
      value: 35.0,
      date: "22/06/2025",
    },
    {
      id: 2,
      type: "despesa",
      category: "Compras",
      description: "Compra de ingredientes",
      value: 45.0,
      date: "23/06/2025",
    },
    {
      id: 3,
      type: "receita",
      category: "Vendas",
      description: "Venda de açaí",
      value: 80.0,
      date: "23/06/2025",
    },
  ])

  const [newTransaction, setNewTransaction] = useState({
    type: "receita" as "receita" | "despesa",
    category: "",
    description: "",
    value: 0,
  })

  // Financial calculations
  const totalRevenue = transactions.filter((t) => t.type === "receita").reduce((sum, t) => sum + t.value, 0)
  const totalExpenses = transactions.filter((t) => t.type === "despesa").reduce((sum, t) => sum + t.value, 0)
  const profit = totalRevenue - totalExpenses

  const addTransaction = () => {
    if (newTransaction.description && newTransaction.category && newTransaction.value > 0) {
      const transaction: Transaction = {
        id: Date.now(),
        ...newTransaction,
        date: new Date().toLocaleDateString("pt-BR"),
      }

      setTransactions([transaction, ...transactions])
      setNewTransaction({
        type: "receita",
        category: "",
        description: "",
        value: 0,
      })
    }
  }

  const deleteTransaction = (id: number) => {
    setTransactions(transactions.filter((t) => t.id !== id))
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <DollarSign className="w-8 h-8 text-teal-600" />
              <h1 className="text-3xl font-bold text-gray-800">Gestão Financeira</h1>
            </div>
          </div>
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <Home className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Nova Transação Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-teal-600">
                  <Plus className="w-5 h-5" />
                  Nova Transação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="transactionType">Tipo de Transação</Label>
                    <select
                      id="transactionType"
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      value={newTransaction.type}
                      onChange={(e) =>
                        setNewTransaction({ ...newTransaction, type: e.target.value as "receita" | "despesa" })
                      }
                    >
                      <option value="receita">💰 Receita</option>
                      <option value="despesa">💸 Despesa</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="transactionCategory">Categoria *</Label>
                    <Input
                      id="transactionCategory"
                      placeholder="Ex: Vendas, Compras"
                      value={newTransaction.category}
                      onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transactionDescription">Descrição *</Label>
                  <Input
                    id="transactionDescription"
                    placeholder="Descreva a transação"
                    value={newTransaction.description}
                    onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transactionValue">Valor (R$)</Label>
                  <Input
                    id="transactionValue"
                    type="number"
                    step="0.01"
                    placeholder="0"
                    value={newTransaction.value}
                    onChange={(e) => setNewTransaction({ ...newTransaction, value: Number(e.target.value) })}
                  />
                </div>

                <Button
                  onClick={addTransaction}
                  className={`w-full ${
                    newTransaction.type === "receita" ? "bg-teal-600 hover:bg-teal-700" : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {newTransaction.type === "receita" ? "Registrar Receita" : "Registrar Despesa"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Resumo Financeiro */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-yellow-600">Resumo Financeiro</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-teal-50 border-l-4 border-teal-500 rounded">
                    <span className="text-teal-700 font-medium">Total de Receitas</span>
                    <span className="text-teal-600 font-bold">R$ {totalRevenue.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-red-50 border-l-4 border-red-500 rounded">
                    <span className="text-red-700 font-medium">Total de Despesas</span>
                    <span className="text-red-600 font-bold">R$ {totalExpenses.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-gray-50 border-l-4 border-gray-500 rounded">
                    <span className="text-gray-700 font-medium">Lucro</span>
                    <span className={`font-bold ${profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                      R$ {profit.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Histórico de Transações */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Transações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactions.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Nenhuma transação registrada ainda.</p>
              ) : (
                transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          transaction.type === "receita" ? "bg-teal-500" : "bg-red-500"
                        }`}
                      />
                      <div>
                        <h4 className="font-medium text-gray-900">{transaction.description}</h4>
                        <p className="text-sm text-gray-500">
                          {transaction.category} • {transaction.date}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-bold ${transaction.type === "receita" ? "text-teal-600" : "text-red-600"}`}
                      >
                        {transaction.type === "receita" ? "+" : "-"} R$ {transaction.value.toFixed(2)}
                      </span>
                      <Button size="sm" variant="outline" onClick={() => deleteTransaction(transaction.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
