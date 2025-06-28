"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Package, Plus, Edit, Trash2, Lightbulb, ArrowLeft, Home } from "lucide-react"

interface Product {
  id: number
  name: string
  category: string
  quantity: number
  minStock: number
  purchasePrice: number
  salePrice: number
  margin: number
}

export default function EstoquePage() {
  const [products, setProducts] = useState<Product[]>([
    {
      id: 1,
      name: "Açaí 500ml",
      category: "Bebidas",
      quantity: 25,
      minStock: 10,
      purchasePrice: 3.5,
      salePrice: 8.0,
      margin: 129,
    },
    {
      id: 2,
      name: "Salgado Assado",
      category: "Alimentação",
      quantity: 30,
      minStock: 15,
      purchasePrice: 1.2,
      salePrice: 3.5,
      margin: 192,
    },
    {
      id: 3,
      name: "Água Mineral",
      category: "Bebidas",
      quantity: 5,
      minStock: 15,
      purchasePrice: 0.8,
      salePrice: 2.0,
      margin: 150,
    },
  ])

  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    quantity: 0,
    minStock: 0,
    purchasePrice: 0,
    salePrice: 0,
  })

  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const totalCategories = new Set(products.map((p) => p.category)).size
  const averageMargin = products.length > 0 ? products.reduce((sum, p) => sum + p.margin, 0) / products.length : 0

  const addProduct = () => {
    if (newProduct.name && newProduct.category) {
      const margin =
        newProduct.purchasePrice > 0
          ? Math.round(((newProduct.salePrice - newProduct.purchasePrice) / newProduct.purchasePrice) * 100)
          : 0

      const product: Product = {
        id: Date.now(),
        ...newProduct,
        margin,
      }

      setProducts([...products, product])
      setNewProduct({
        name: "",
        category: "",
        quantity: 0,
        minStock: 0,
        purchasePrice: 0,
        salePrice: 0,
      })
    }
  }

  const updateProduct = () => {
    if (editingProduct) {
      const margin =
        editingProduct.purchasePrice > 0
          ? Math.round(((editingProduct.salePrice - editingProduct.purchasePrice) / editingProduct.purchasePrice) * 100)
          : 0

      setProducts(products.map((p) => (p.id === editingProduct.id ? { ...editingProduct, margin } : p)))
      setEditingProduct(null)
    }
  }

  const deleteProduct = (id: number) => {
    setProducts(products.filter((p) => p.id !== id))
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
              <Package className="w-8 h-8 text-slate-600" />
              <h1 className="text-3xl font-bold text-gray-800">Gestão de Estoque</h1>
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
          {/* Add Product Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  {editingProduct ? "Editar Produto" : "Adicionar Produto"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome do Produto *</Label>
                    <Input
                      id="name"
                      placeholder="Ex: Açaí 500ml"
                      value={editingProduct ? editingProduct.name : newProduct.name}
                      onChange={(e) =>
                        editingProduct
                          ? setEditingProduct({ ...editingProduct, name: e.target.value })
                          : setNewProduct({ ...newProduct, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoria *</Label>
                    <Input
                      id="category"
                      placeholder="Ex: Bebidas"
                      value={editingProduct ? editingProduct.category : newProduct.category}
                      onChange={(e) =>
                        editingProduct
                          ? setEditingProduct({ ...editingProduct, category: e.target.value })
                          : setNewProduct({ ...newProduct, category: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantidade</Label>
                    <Input
                      id="quantity"
                      type="number"
                      placeholder="0"
                      value={editingProduct ? editingProduct.quantity : newProduct.quantity}
                      onChange={(e) =>
                        editingProduct
                          ? setEditingProduct({ ...editingProduct, quantity: Number(e.target.value) })
                          : setNewProduct({ ...newProduct, quantity: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minStock">Estoque Mín.</Label>
                    <Input
                      id="minStock"
                      type="number"
                      placeholder="0"
                      value={editingProduct ? editingProduct.minStock : newProduct.minStock}
                      onChange={(e) =>
                        editingProduct
                          ? setEditingProduct({ ...editingProduct, minStock: Number(e.target.value) })
                          : setNewProduct({ ...newProduct, minStock: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="purchasePrice">Preço Compra</Label>
                    <Input
                      id="purchasePrice"
                      type="number"
                      step="0.01"
                      placeholder="0"
                      value={editingProduct ? editingProduct.purchasePrice : newProduct.purchasePrice}
                      onChange={(e) =>
                        editingProduct
                          ? setEditingProduct({ ...editingProduct, purchasePrice: Number(e.target.value) })
                          : setNewProduct({ ...newProduct, purchasePrice: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salePrice">Preço Venda</Label>
                    <Input
                      id="salePrice"
                      type="number"
                      step="0.01"
                      placeholder="0"
                      value={editingProduct ? editingProduct.salePrice : newProduct.salePrice}
                      onChange={(e) =>
                        editingProduct
                          ? setEditingProduct({ ...editingProduct, salePrice: Number(e.target.value) })
                          : setNewProduct({ ...newProduct, salePrice: Number(e.target.value) })
                      }
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={editingProduct ? updateProduct : addProduct}
                    className="bg-slate-600 hover:bg-slate-700"
                  >
                    {editingProduct ? "Atualizar Produto" : "Adicionar Produto"}
                  </Button>
                  {editingProduct && (
                    <Button variant="outline" onClick={() => setEditingProduct(null)}>
                      Cancelar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Summary */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-teal-600">Resumo Rápido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-100 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-gray-700">{totalCategories}</div>
                    <div className="text-sm text-gray-500">Tipos de Produtos</div>
                  </div>
                  <div className="bg-teal-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-teal-600">{averageMargin.toFixed(1)}%</div>
                    <div className="text-sm text-teal-500">ROI Estimado</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-yellow-50 border-yellow-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-700">
                  <Lightbulb className="w-5 h-5" />
                  Dica do Dia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-yellow-800">
                  Mantenha sempre um estoque mínimo de segurança para evitar perder vendas!
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Products List */}
        <Card>
          <CardHeader>
            <CardTitle>Produtos em Estoque</CardTitle>
            <p className="text-sm text-gray-600">Gerencie seus produtos e monitore os níveis de estoque</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900">{product.name}</h3>
                      {product.quantity <= product.minStock && <Badge variant="destructive">Estoque Baixo</Badge>}
                    </div>
                    <p className="text-sm text-gray-500">{product.category}</p>
                  </div>

                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <div className="font-medium">{product.quantity}</div>
                      <div className="text-gray-500">Qtd</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-red-600">R$ {product.purchasePrice.toFixed(2)}</div>
                      <div className="text-gray-500">Compra</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-green-600">R$ {product.salePrice.toFixed(2)}</div>
                      <div className="text-gray-500">Venda</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-yellow-600">{product.margin}%</div>
                      <div className="text-gray-500">Margem</div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setEditingProduct(product)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => deleteProduct(product.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
