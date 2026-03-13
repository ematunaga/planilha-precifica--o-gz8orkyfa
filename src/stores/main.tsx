import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import {
  Product,
  ProjectVersion,
  Folder,
  Project,
  PricingTemplate,
  TaxRates,
  EncargoRates,
} from '@/types'

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

interface MainStoreState {
  isAuthenticated: boolean
  loginUser: () => void
  logoutUser: () => void
  folders: Folder[]
  projects: Project[]
  versions: ProjectVersion[]
  templates: PricingTemplate[]
  activeProjectId: string | null
  activeVersionId: string | null
  products: Product[]
  exchangeRate: number
  displayCurrency: 'BRL' | 'USD'
  lastExchangeUpdate: string | null
  setExchangeRate: (rate: number) => void
  setDisplayCurrency: (c: 'BRL' | 'USD') => void
  fetchExchangeRate: () => Promise<void>
  updateProduct: (id: string, updates: Partial<Product>) => void
  addProduct: (product: Product) => void
  removeProduct: (id: string) => void
  setProducts: (products: Product[]) => void
  createFolder: (name: string) => string
  createProject: (folderId: string, name: string, templateId?: string) => string
  createVersion: (projectId: string, name: string) => string
  loadVersion: (versionId: string) => void
  deleteVersion: (id: string) => void
  deleteProject: (id: string) => void
  deleteFolder: (id: string) => void
  startNewProject: (folderId: string, pName: string, vName: string, templateId?: string) => void
  saveTemplate: (name: string, taxRates: TaxRates, encargoRates: EncargoRates) => void
  deleteTemplate: (id: string) => void
}

const MainStoreContext = createContext<MainStoreState | null>(null)

export function MainStoreProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuth] = useState(() => localStorage.getItem('p_auth') === 'true')
  const [folders, setFolders] = useState<Folder[]>(() =>
    JSON.parse(localStorage.getItem('p_fld') || '[{"id":"1","name":"Meus Projetos"}]'),
  )
  const [projects, setProjects] = useState<Project[]>(() =>
    JSON.parse(localStorage.getItem('p_prj') || '[]'),
  )
  const [versions, setVersions] = useState<ProjectVersion[]>(() =>
    JSON.parse(localStorage.getItem('p_ver') || '[]'),
  )
  const [templates, setTemplates] = useState<PricingTemplate[]>(() =>
    JSON.parse(localStorage.getItem('p_tpl') || '[]'),
  )
  const [activeProjectId, setPID] = useState<string | null>(() => localStorage.getItem('p_pid'))
  const [activeVersionId, setVID] = useState<string | null>(() => localStorage.getItem('p_vid'))
  const [products, setProducts] = useState<Product[]>(defaultProducts)
  const [exchangeRate, setExchangeRate] = useState<number>(5.15)
  const [lastExchangeUpdate, setLastExchangeUpdate] = useState<string | null>(() =>
    localStorage.getItem('p_ex_date'),
  )
  const [displayCurrency, setDisplayCurrency] = useState<'BRL' | 'USD'>('BRL')

  useEffect(() => {
    localStorage.setItem('p_auth', String(isAuthenticated))
  }, [isAuthenticated])
  useEffect(() => {
    localStorage.setItem('p_fld', JSON.stringify(folders))
  }, [folders])
  useEffect(() => {
    localStorage.setItem('p_prj', JSON.stringify(projects))
  }, [projects])
  useEffect(() => {
    localStorage.setItem('p_ver', JSON.stringify(versions))
  }, [versions])
  useEffect(() => {
    localStorage.setItem('p_tpl', JSON.stringify(templates))
  }, [templates])
  useEffect(() => {
    if (lastExchangeUpdate) localStorage.setItem('p_ex_date', lastExchangeUpdate)
  }, [lastExchangeUpdate])

  useEffect(() => {
    if (activeProjectId) {
      localStorage.setItem('p_pid', activeProjectId)
    } else {
      localStorage.removeItem('p_pid')
    }
  }, [activeProjectId])

  useEffect(() => {
    if (activeVersionId) {
      localStorage.setItem('p_vid', activeVersionId)
    } else {
      localStorage.removeItem('p_vid')
    }
  }, [activeVersionId])

  const loginUser = () => setIsAuth(true)
  const logoutUser = () => {
    setIsAuth(false)
    setPID(null)
    setVID(null)
  }

  const fetchExchangeRate = async () => {
    try {
      const res = await fetch('https://economia.awesomeapi.com.br/last/USD-BRL')
      const data = await res.json()
      if (data?.USDBRL?.ask) {
        setExchangeRate(parseFloat(data.USDBRL.ask))
        setLastExchangeUpdate(new Date().toISOString())
      }
    } catch (e) {
      console.error(e)
    }
  }

  const createFolder = (name: string) => {
    const id = Date.now().toString()
    setFolders((p) => [...p, { id, name }])
    return id
  }
  const createProject = (folderId: string, name: string, templateId?: string) => {
    const id = Date.now().toString()
    setProjects((p) => [...p, { id, folderId, name, templateId }])
    return id
  }
  const createVersion = (projectId: string, name: string) => {
    const id = Date.now().toString()
    setVersions((p) => [
      ...p,
      {
        id,
        projectId,
        name,
        date: new Date().toISOString(),
        products: [...products],
        exchangeRate,
      },
    ])
    setVID(id)
    return id
  }

  const loadVersion = (versionId: string) => {
    const v = versions.find((v) => v.id === versionId)
    if (v) {
      setProducts(v.products)
      setExchangeRate(v.exchangeRate)
      setPID(v.projectId)
      setVID(v.id)
    }
  }

  const startNewProject = (folderId: string, pName: string, vName: string, templateId?: string) => {
    const pid = createProject(folderId, pName, templateId)
    setPID(pid)
    let initialProducts = [...defaultProducts]
    if (templateId) {
      const tpl = templates.find((t) => t.id === templateId)
      if (tpl)
        initialProducts = initialProducts.map((p) => ({
          ...p,
          taxRates: { ...tpl.taxRates },
          encargoRates: { ...tpl.encargoRates },
        }))
    }
    setProducts(initialProducts)
    const vid = Date.now().toString()
    setVersions((p) => [
      ...p,
      {
        id: vid,
        projectId: pid,
        name: vName,
        date: new Date().toISOString(),
        products: [...initialProducts],
        exchangeRate,
      },
    ])
    setVID(vid)
  }

  const deleteFolder = (id: string) => {
    setFolders((p) => p.filter((f) => f.id !== id))
    const pids = projects.filter((p) => p.folderId === id).map((p) => p.id)
    setProjects((p) => p.filter((p) => p.folderId !== id))
    setVersions((p) => p.filter((v) => !pids.includes(v.projectId)))
    if (pids.includes(activeProjectId!)) {
      setPID(null)
      setVID(null)
    }
  }
  const deleteProject = (id: string) => {
    setProjects((p) => p.filter((p) => p.id !== id))
    setVersions((p) => p.filter((v) => v.projectId !== id))
    if (activeProjectId === id) {
      setPID(null)
      setVID(null)
    }
  }
  const deleteVersion = (id: string) => {
    setVersions((p) => p.filter((v) => v.id !== id))
    if (activeVersionId === id) setVID(null)
  }

  const saveTemplate = (name: string, taxRates: TaxRates, encargoRates: EncargoRates) => {
    setTemplates((p) => [...p, { id: Date.now().toString(), name, taxRates, encargoRates }])
  }
  const deleteTemplate = (id: string) => setTemplates((p) => p.filter((t) => t.id !== id))

  const updateProduct = (id: string, upd: Partial<Product>) =>
    setProducts((p) => p.map((x) => (x.id === id ? { ...x, ...upd } : x)))
  const addProduct = (product: Product) => setProducts((p) => [product, ...p])
  const removeProduct = (id: string) => setProducts((p) => p.filter((x) => x.id !== id))

  const store = {
    isAuthenticated,
    loginUser,
    logoutUser,
    folders,
    projects,
    versions,
    templates,
    activeProjectId,
    activeVersionId,
    products,
    exchangeRate,
    displayCurrency,
    lastExchangeUpdate,
    setExchangeRate,
    setDisplayCurrency,
    fetchExchangeRate,
    updateProduct,
    addProduct,
    removeProduct,
    setProducts,
    createFolder,
    createProject,
    createVersion,
    loadVersion,
    deleteVersion,
    deleteProject,
    deleteFolder,
    startNewProject,
    saveTemplate,
    deleteTemplate,
  }
  return React.createElement(MainStoreContext.Provider, { value: store }, children)
}

export const useMainStore = () => {
  const context = useContext(MainStoreContext)
  if (!context) throw new Error('useMainStore must be used within a MainStoreProvider')
  return context
}
