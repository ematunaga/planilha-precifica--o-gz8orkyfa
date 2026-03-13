import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Product, ProjectVersion } from '@/types'

interface MainStoreState {
  products: Product[]
  exchangeRate: number
  displayCurrency: 'BRL' | 'USD'
  versions: ProjectVersion[]
  setExchangeRate: (rate: number) => void
  setDisplayCurrency: (currency: 'BRL' | 'USD') => void
  updateProduct: (id: string, updates: Partial<Product>) => void
  addProduct: (product: Product) => void
  removeProduct: (id: string) => void
  saveVersion: (name: string) => void
  loadVersion: (id: string) => void
  deleteVersion: (id: string) => void
  setProducts: (products: Product[]) => void
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
    st: 0,
    salesModel: 'Direct',
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
    st: 0,
    salesModel: 'Direct',
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
    st: 0,
    salesModel: 'Direct',
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

  const [displayCurrency, setDisplayCurrency] = useState<'BRL' | 'USD'>(() => {
    return (localStorage.getItem('pricing_display_currency') as 'BRL' | 'USD') || 'BRL'
  })

  const [versions, setVersions] = useState<ProjectVersion[]>(() => {
    const saved = localStorage.getItem('pricing_versions')
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    localStorage.setItem('pricing_products', JSON.stringify(products))
  }, [products])

  useEffect(() => {
    localStorage.setItem('pricing_exchange_rate', exchangeRate.toString())
  }, [exchangeRate])

  useEffect(() => {
    localStorage.setItem('pricing_display_currency', displayCurrency)
  }, [displayCurrency])

  useEffect(() => {
    localStorage.setItem('pricing_versions', JSON.stringify(versions))
  }, [versions])

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)))
  }

  const addProduct = (product: Product) => {
    setProducts((prev) => [product, ...prev])
  }

  const removeProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }

  const saveVersion = (name: string) => {
    const newVersion: ProjectVersion = {
      id: Date.now().toString(),
      name,
      date: new Date().toISOString(),
      products: [...products],
      exchangeRate,
    }
    setVersions((prev) => [newVersion, ...prev])
  }

  const loadVersion = (id: string) => {
    const v = versions.find((v) => v.id === id)
    if (v) {
      setProducts(v.products)
      setExchangeRate(v.exchangeRate)
    }
  }

  const deleteVersion = (id: string) => {
    setVersions((prev) => prev.filter((v) => v.id !== id))
  }

  return React.createElement(
    MainStoreContext.Provider,
    {
      value: {
        products,
        exchangeRate,
        displayCurrency,
        versions,
        setExchangeRate,
        setDisplayCurrency,
        updateProduct,
        addProduct,
        removeProduct,
        saveVersion,
        loadVersion,
        deleteVersion,
        setProducts,
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
