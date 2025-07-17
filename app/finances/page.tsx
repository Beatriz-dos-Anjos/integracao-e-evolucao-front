"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DollarSign, Plus, Trash2, ArrowLeft, Home, X, Check } from "lucide-react"
import api from "@/services/api"
import { Edit } from "lucide-react"

interface Transaction {
  id: number
  tipo: "receita" | "despesa"
  categoria: string
  descricao: string
  valor: number
  data: string
}

export default function FinanceiroPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])

  const [newTransaction, setNewTransaction] = useState({
    tipo: "receita" as "receita" | "despesa",
    categoria: "",
    descricao: "",
    valor: 0,
  })
    const [editingId, setEditingId] = useState<number | null>(null)
  const [editTransaction, setEditTransaction] = useState({
    tipo: "receita" as "receita" | "despesa",
    categoria: "",
    descricao: "",
    valor: "",
  })
  useEffect(() => {
    async function carregarTransacoes() {
      try {
        const res = await api.get("/api/transactions")
        setTransactions(res.data.transactions || [])
      } catch (err) {
        console.error("Erro ao carregar transações", err)
      }
    }

    carregarTransacoes()
  }, [])

const totalRevenue = transactions
  .filter((t) => t.tipo === "receita")
  .reduce((sum, t) => {
    const valor = Number(t.valor) || 0
    return sum + valor
  }, 0)

const totalExpenses = transactions
  .filter((t) => t.tipo === "despesa")
  .reduce((sum, t) => {
    const valor = Number(t.valor) || 0
    return sum + valor
  }, 0)


  const profit = totalRevenue - totalExpenses

  const addTransaction = async () => {
    const { tipo, categoria, descricao, valor } = newTransaction
    if (!descricao || !categoria || valor <= 0) return

    try {
      const res = await api.post("/api/transactions", {
        tipo,
        categoria,
        descricao,
        valor,
        data: new Date().toISOString(),
      })

      setTransactions([res.data.transaction, ...transactions])
      setNewTransaction({ tipo: "receita", categoria: "", descricao: "", valor: 0 })
    } catch (err) {
      console.error("Erro ao adicionar transação", err)
    }
  }

  const deleteTransaction = async (id: number) => {
    try {
      await api.delete(`api/transactions/${id}`)
      setTransactions(transactions.filter((t) => t.id !== id))
    } catch (err) {
      console.error("Erro ao deletar transação", err)
    }
  }
   const startEdit = (transaction: Transaction) => {
    setEditingId(transaction.id)
    setEditTransaction({
      tipo: transaction.tipo,
      categoria: transaction.categoria,
      descricao: transaction.descricao,
      valor: transaction.valor.toString(),
    })
  }

  const saveEdit = async () => {
    if (!editingId) return
    
    const { tipo, categoria, descricao, valor } = editTransaction
    if (!descricao || !categoria || !valor || Number(valor) <= 0) return

    try {
      await api.put(`/api/transactions/${editingId}`, {
        tipo,
        categoria,
        descricao,
        valor: Number(valor),
      })

      setTransactions(transactions.map(t => 
        t.id === editingId 
          ? { ...t, tipo, categoria, descricao, valor: Number(valor) }
          : t
      ))
      
      setEditingId(null)
      setEditTransaction({ tipo: "receita", categoria: "", descricao: "", valor: "" })
    } catch (err) {
      console.error("Erro ao editar transação", err)
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditTransaction({ tipo: "receita", categoria: "", descricao: "", valor: "" })
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
                      value={newTransaction.tipo}
                      onChange={(e) =>
                        setNewTransaction({ ...newTransaction, tipo: e.target.value as "receita" | "despesa" })
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
                      value={newTransaction.categoria}
                      onChange={(e) => setNewTransaction({ ...newTransaction, categoria: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transactionDescription">Descrição *</Label>
                  <Input
                    id="transactionDescription"
                    placeholder="Descreva a transação"
                    value={newTransaction.descricao}
                    onChange={(e) => setNewTransaction({ ...newTransaction, descricao: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transactionValue">Valor (R$)</Label>
                  <Input
                    id="transactionValue"
                    type="number"
                    step="0.01"
                    placeholder="0"
                    value={newTransaction.valor}
                    onChange={(e) => setNewTransaction({ ...newTransaction, valor: Number(e.target.value) })}
                  />
                </div>

                 <Button
                  onClick={addTransaction}
                  className={`w-full ${
                    newTransaction.tipo === "receita" ? "bg-teal-600 hover:bg-teal-700" : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {newTransaction.tipo === "receita" ? "Registrar Receita" : "Registrar Despesa"}
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
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all hover:shadow-md"
                  >
                    {editingId === transaction.id ? (
                      // Edit Mode
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Tipo</Label>
                            <select
                              className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                              value={editTransaction.tipo}
                              onChange={(e) =>
                                setEditTransaction({ ...editTransaction, tipo: e.target.value as "receita" | "despesa" })
                              }
                            >
                              <option value="receita">💰 Receita</option>
                              <option value="despesa">💸 Despesa</option>
                            </select>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Categoria</Label>
                            <Input
                              value={editTransaction.categoria}
                              onChange={(e) => setEditTransaction({ ...editTransaction, categoria: e.target.value })}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Valor (R$)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={editTransaction.valor}
                              onChange={(e) => setEditTransaction({ ...editTransaction, valor: e.target.value })}
                              className="mt-1"
                            />
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Descrição</Label>
                          <Input
                            value={editTransaction.descricao}
                            onChange={(e) => setEditTransaction({ ...editTransaction, descricao: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            onClick={saveEdit}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Salvar
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={cancelEdit}
                            className="hover:bg-gray-50"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                  <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-4 h-4 rounded-full ${
                              transaction.tipo === "receita" ? "bg-teal-500" : "bg-red-500"
                            }`}
                          />
                          <div>
                            <h4 className="font-medium text-gray-900">{transaction.descricao}</h4>
                            <p className="text-sm text-gray-500">
                              {transaction.categoria} • {new Date(transaction.data).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`font-bold text-lg ${transaction.tipo === "receita" ? "text-teal-600" : "text-red-600"}`}
                          >
                            {transaction.tipo === "receita" ? "+" : "-"} {(Number(transaction.valor) || 0)}
                          </span>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => startEdit(transaction)}
                            className="hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => deleteTransaction(transaction.id)}
                            className="hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
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
