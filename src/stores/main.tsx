import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Product } from '@/types'

interface MainStoreState {
  products: Product[]
  exchangeRate: number
  setExchangeRate: (rate: number) => void
  updateProduct: (id: string, updates: Partial<Product>) => void
  addProduct: (product: Product) => void
  removeProduct: (id: string) => void
}

const defaultProducts: Product[] = [
  {
    id: '1',
    pn: 'CISCO-WS-C2960X',
    description: 'Switch Catalyst 2960-X 48 GigE',
    type: 'HW',
    currency: 'USD',
    qty: 5,
    unitCost: 850.0,
    taxRates: { icms: 18, ipi: 5, pisCofins: 9.25, iss: 0 },
    encargoRates: { nf: 2, admin: 5, comissao: 3 },
    salesFactor: 2.5,
  },
  {
    id: '2',
    pn: 'WIN-SVR-2022',
    description: 'Windows Server 2022 Standard',
    type: 'SW',
    currency: 'USD',
    qty: 2,
    unitCost: 970.0,
    taxRates: { icms: 5, ipi: 0, pisCofins: 9.25, iss: 0 },
    encargoRates: { nf: 2, admin: 5, comissao: 5 },
    salesFactor: 1.8,
  },
  {
    id: '3',
    pn: 'SRV-INST-01',
    description: 'Instalação e Configuração On-Site',
    type: 'Serviço',
    currency: 'BRL',
    qty: 40,
    unitCost: 150.0,
    taxRates: { icms: 0, ipi: 0, pisCofins: 9.25, iss: 5 },
    encargoRates: { nf: 2, admin: 10, comissao: 0 },
    salesFactor: 2.0,
  },
]

const MainStoreContext = createContext<MainStoreState | null>(null)

export function MainStoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('pricing_products')
    return saved ? JSON.parse(saved) : defaultProducts
  })

  const [exchangeRate, setExchangeRate] = useState<number>(() => {
    const saved = localStorage.getItem('pricing_exchange_rate')
    return saved ? parseFloat(saved) : 5.15
  })

  useEffect(() => {
    localStorage.setItem('pricing_products', JSON.stringify(products))
  }, [products])

  useEffect(() => {
    localStorage.setItem('pricing_exchange_rate', exchangeRate.toString())
  }, [exchangeRate])

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)))
  }

  const addProduct = (product: Product) => {
    setProducts((prev) => [product, ...prev])
  }

  const removeProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }

  return React.createElement(
    MainStoreContext.Provider,
    {
      value: {
        products,
        exchangeRate,
        setExchangeRate,
        updateProduct,
        addProduct,
        removeProduct,
      },
    },
    children,
  )
}

export function useMainStore() {
  const context = useContext(MainStoreContext)
  if (!context) {
    throw new Error('useMainStore must be used within a MainStoreProvider')
  }
  return context
}
