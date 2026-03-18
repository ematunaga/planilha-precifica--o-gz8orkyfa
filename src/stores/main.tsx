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
import { useAuth } from '@/hooks/use-auth'

interface MainStoreState {
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
  addProducts: (products: Product[]) => void
  removeProduct: (id: string) => void
  setProducts: (products: Product[]) => void
  createFolder: (name: string) => string
  createProject: (folderId: string, name: string, templateId?: string) => string
  createVersion: (projectId: string, name: string, overrideProducts?: Product[]) => string
  loadVersion: (versionId: string) => void
  deleteVersion: (id: string) => void
  deleteProject: (id: string) => void
  deleteFolder: (id: string) => void
  startNewProject: (folderId: string, pName: string, vName: string, templateId?: string) => void
  saveTemplate: (name: string, taxRates: TaxRates, encargoRates: EncargoRates) => void
  deleteTemplate: (id: string) => void
  applySimulationAndSave: (
    multiplier: number,
    preSimName: string,
    simName: string,
  ) => { preSimId: string; simId: string; preSimProducts: Product[]; simProducts: Product[] } | void
}

const MainStoreContext = createContext<MainStoreState | null>(null)

export function MainStoreProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth()

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

  const [products, setProducts] = useState<Product[]>(() => {
    const vid = localStorage.getItem('p_vid')
    if (vid) {
      const storedVersions = JSON.parse(localStorage.getItem('p_ver') || '[]')
      const activeVer = storedVersions.find((v: any) => v.id === vid)
      if (activeVer && activeVer.products) {
        return activeVer.products.map((p: any) => ({
          ...p,
          manufacturer: p.manufacturer || '',
          distributor: p.distributor || '',
          difal: p.difal !== undefined ? p.difal : p.st !== undefined ? p.st : 0,
          taxRates: {
            ...p.taxRates,
            pis:
              p.taxRates.pis !== undefined
                ? p.taxRates.pis
                : p.taxRates.pisCofins
                  ? p.taxRates.pisCofins * 0.178
                  : 1.65,
            cofins:
              p.taxRates.cofins !== undefined
                ? p.taxRates.cofins
                : p.taxRates.pisCofins
                  ? p.taxRates.pisCofins * 0.822
                  : 7.6,
          },
        }))
      }
    }
    return []
  })

  const [exchangeRate, setExchangeRate] = useState<number>(() => {
    const vid = localStorage.getItem('p_vid')
    if (vid) {
      const storedVersions = JSON.parse(localStorage.getItem('p_ver') || '[]')
      const activeVer = storedVersions.find((v: any) => v.id === vid)
      if (activeVer && activeVer.exchangeRate) {
        return activeVer.exchangeRate
      }
    }
    return 5.15
  })

  const [lastExchangeUpdate, setLastExchangeUpdate] = useState<string | null>(() =>
    localStorage.getItem('p_ex_date'),
  )
  const [displayCurrency, setDisplayCurrency] = useState<'BRL' | 'USD'>('BRL')

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
    setFolders((p) => [...p, { id, name, createdBy: profile?.id }])
    return id
  }

  const createProject = (folderId: string, name: string, templateId?: string) => {
    const id = Date.now().toString()
    setProjects((p) => [...p, { id, folderId, name, templateId, createdBy: profile?.id }])
    return id
  }

  const createVersion = (projectId: string, name: string, overrideProducts?: Product[]) => {
    const id = Date.now().toString()
    const targetProducts = overrideProducts || products
    setVersions((p) => [
      ...p,
      {
        id,
        projectId,
        name,
        date: new Date().toISOString(),
        products: [...targetProducts],
        exchangeRate,
        createdBy: profile?.id,
      },
    ])
    setVID(id)
    return id
  }

  const applySimulationAndSave = (multiplier: number, preSimName: string, simName: string) => {
    if (!activeProjectId) return

    const preSimId = Date.now().toString() + '-pre'
    const simId = Date.now().toString() + '-sim'

    const preSimProducts = [...products]
    const simProducts = products.map((p) => ({
      ...p,
      salesFactor: p.salesFactor * multiplier,
    }))

    const preSimVersion: ProjectVersion = {
      id: preSimId,
      projectId: activeProjectId,
      name: preSimName,
      date: new Date().toISOString(),
      products: preSimProducts,
      exchangeRate,
      createdBy: profile?.id,
    }

    const simVersion: ProjectVersion = {
      id: simId,
      projectId: activeProjectId,
      name: simName,
      date: new Date().toISOString(),
      products: simProducts,
      exchangeRate,
      createdBy: profile?.id,
    }

    setVersions((p) => [...p, preSimVersion, simVersion])
    setProducts(simProducts)
    setVID(simId)

    return { preSimId, simId, preSimProducts, simProducts }
  }

  const loadVersion = (versionId: string) => {
    const v = versions.find((v) => v.id === versionId)
    if (v) {
      const migratedProducts = v.products.map((p: any) => ({
        ...p,
        manufacturer: p.manufacturer || '',
        distributor: p.distributor || '',
        difal: p.difal !== undefined ? p.difal : p.st !== undefined ? p.st : 0,
        taxRates: {
          ...p.taxRates,
          pis:
            p.taxRates.pis !== undefined
              ? p.taxRates.pis
              : p.taxRates.pisCofins
                ? p.taxRates.pisCofins * 0.178
                : 1.65,
          cofins:
            p.taxRates.cofins !== undefined
              ? p.taxRates.cofins
              : p.taxRates.pisCofins
                ? p.taxRates.pisCofins * 0.822
                : 7.6,
        },
      }))
      setProducts(migratedProducts)
      setExchangeRate(v.exchangeRate)
      setPID(v.projectId)
      setVID(v.id)
    }
  }

  const startNewProject = (folderId: string, pName: string, vName: string, templateId?: string) => {
    const pid = createProject(folderId, pName, templateId)
    setPID(pid)

    setProducts([])
    createVersion(pid, vName, [])
  }

  const deleteFolder = (id: string) => {
    setFolders((p) => p.filter((f) => f.id !== id))
    const pids = projects.filter((p) => p.folderId === id).map((p) => p.id)
    setProjects((p) => p.filter((p) => p.folderId !== id))
    setVersions((p) => p.filter((v) => !pids.includes(v.projectId)))
    if (pids.includes(activeProjectId!)) {
      setPID(null)
      setVID(null)
      setProducts([])
    }
  }
  const deleteProject = (id: string) => {
    setProjects((p) => p.filter((p) => p.id !== id))
    setVersions((p) => p.filter((v) => v.projectId !== id))
    if (activeProjectId === id) {
      setPID(null)
      setVID(null)
      setProducts([])
    }
  }
  const deleteVersion = (id: string) => {
    setVersions((p) => p.filter((v) => v.id !== id))
    if (activeVersionId === id) {
      setVID(null)
    }
  }

  const saveTemplate = (name: string, taxRates: TaxRates, encargoRates: EncargoRates) => {
    setTemplates((p) => [...p, { id: Date.now().toString(), name, taxRates, encargoRates }])
  }
  const deleteTemplate = (id: string) => setTemplates((p) => p.filter((t) => t.id !== id))

  const updateProduct = (id: string, upd: Partial<Product>) =>
    setProducts((p) => p.map((x) => (x.id === id ? { ...x, ...upd } : x)))
  const addProduct = (product: Product) => setProducts((p) => [product, ...p])
  const addProducts = (newProducts: Product[]) => setProducts((p) => [...newProducts, ...p])
  const removeProduct = (id: string) => setProducts((p) => p.filter((x) => x.id !== id))

  const store = {
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
    addProducts,
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
    applySimulationAndSave,
  }
  return React.createElement(MainStoreContext.Provider, { value: store }, children)
}

export const useMainStore = () => {
  const context = useContext(MainStoreContext)
  if (!context) throw new Error('useMainStore must be used within a MainStoreProvider')
  return context
}
