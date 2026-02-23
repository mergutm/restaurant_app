'use client'

import { useEffect, useState, useMemo } from 'react'
import { api } from '@/lib/api'
import type { Category, Product } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { Search, Plus } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'

export default function MenuPage() {
    const [categories, setCategories] = useState<Category[]>([])
    const [products, setProducts] = useState<Product[]>([])
    const [selectedCategory, setSelectedCategory] = useState<string>('all')
    const [search, setSearch] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const { addItem } = useCart()

    useEffect(() => {
        Promise.all([api.getCategories(), api.getProducts()])
            .then(([catRes, prodRes]) => {
                setCategories(catRes.data.data?.categories ?? catRes.data.data ?? [])
                setProducts(prodRes.data.data?.products ?? prodRes.data.data ?? [])
            })
            .catch(console.error)
            .finally(() => setIsLoading(false))
    }, [])

    const filtered = useMemo(() => {
        return products.filter(p => {
            const matchCat = selectedCategory === 'all' || p.categoryId === selectedCategory
            const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
            return p.available && matchCat && matchSearch
        })
    }, [products, selectedCategory, search])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full">
            {/* Search */}
            <div className="p-4 bg-white border-b">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Buscar platillo..."
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                </div>
            </div>

            {/* Category tabs */}
            <div className="flex flex-wrap gap-2 px-4 py-3 bg-white border-b">
                <button
                    onClick={() => setSelectedCategory('all')}
                    className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${selectedCategory === 'all' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'}`}
                >
                    Todos
                </button>
                {categories.map(cat => (
                    <button
                        key={cat._id}
                        onClick={() => setSelectedCategory(cat._id)}
                        className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${selectedCategory === cat._id ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'}`}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>

            {/* Product list */}
            <div className="flex-1 overflow-y-auto p-4">
                {filtered.length === 0 && (
                    <p className="text-center text-gray-400 py-12 text-sm">No hay platillos disponibles</p>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map(product => (
                        <div key={product._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col p-4 hover:shadow-md transition">
                            <div className="flex items-start gap-4 mb-3">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-20 h-20 rounded-xl object-cover shrink-0 bg-gray-100"
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-900 leading-tight">{product.name}</p>
                                    <p className="text-orange-600 font-bold text-lg mt-1">{formatCurrency(product.price)}</p>
                                </div>
                            </div>

                            {product.description && (
                                <p className="text-sm text-gray-500 mb-3 line-clamp-2 flex-grow">{product.description}</p>
                            )}

                            <button
                                onClick={() => addItem(product)}
                                className="mt-auto w-full py-2.5 bg-orange-50 text-orange-600 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-orange-500 hover:text-white transition-colors active:scale-95"
                            >
                                <Plus className="w-5 h-5" />
                                <span>Agregar</span>
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
