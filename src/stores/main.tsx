import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import {
  Product,
  ProjectVersion,
  Folder,
  PricingTemplate,
  TaxRates,
  EncargoRates,
  ProposalCondition,
  ProposalRecord,
} from '@/types'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'

interface MainStoreState {
  folders: Folder[]
  projects: any[]
  versions: ProjectVersion[]
  templates: PricingTemplate[]
  proposalConditions: ProposalCondition[]
  proposals: ProposalRecord[]
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
  createProject: (
    folderId: string,
    name: string,
    templateId?: string,
    isPublic?: boolean,
  ) => Promise<string>
  createVersion: (projectId: string, name: string, overrideProducts?: Product[]) => string
  loadVersion: (versionId: string) => void
  deleteVersion: (id: string) => void
  deleteProject: (id: string) => Promise<void>
  deleteFolder: (id: string) => Promise<void>
  startNewProject: (
    folderId: string,
    pName: string,
    vName: string,
    templateId?: string,
    isPublic?: boolean,
  ) => Promise<void>
  saveTemplate: (name: string, taxRates: TaxRates, encargoRates: EncargoRates) => void
  deleteTemplate: (id: string) => void
  applySimulationAndSave: (
    multiplier: number,
    preSimName: string,
    simName: string,
  ) => { preSimId: string; simId: string; preSimProducts: Product[]; simProducts: Product[] } | void
  saveProposalCondition: (condition: Omit<ProposalCondition, 'id'>, id?: string) => Promise<void>
  deleteProposalCondition: (id: string) => Promise<void>
  saveProposalRecord: (record: Omit<ProposalRecord, 'id' | 'createdAt'>) => Promise<void>
  deleteProposalRecord: (id: string) => Promise<void>
}

const MainStoreContext = createContext<MainStoreState | null>(null)

export function MainStoreProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth()

  const [folders, setFolders] = useState<Folder[]>(() =>
    JSON.parse(localStorage.getItem('p_fld') || '[{"id":"1","name":"Meus Projetos"}]'),
  )
  const [projects, setProjects] = useState<any[]>([])
  const [versions, setVersions] = useState<ProjectVersion[]>(() =>
    JSON.parse(localStorage.getItem('p_ver') || '[]'),
  )
  const [templates, setTemplates] = useState<PricingTemplate[]>(() =>
    JSON.parse(localStorage.getItem('p_tpl') || '[]'),
  )
  const [proposalConditions, setProposalConditions] = useState<ProposalCondition[]>([])
  const [proposals, setProposals] = useState<ProposalRecord[]>([])

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
            pis: p.taxRates.pis !== undefined ? p.taxRates.pis : 1.65,
            cofins: p.taxRates.cofins !== undefined ? p.taxRates.cofins : 7.6,
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

  // Fetch Projects and extra data from Supabase Database
  useEffect(() => {
    const fetchDbData = async () => {
      const [{ data: projData }, { data: condData }, { data: propData }] = await Promise.all([
        supabase.from('projects').select('*').order('created_at', { ascending: false }),
        supabase.from('proposal_conditions').select('*'),
        supabase.from('proposals').select('*').order('created_at', { ascending: false }),
      ])

      if (projData) {
        setProjects(
          projData.map((d: any) => ({
            id: d.id,
            folderId: d.folder_id || '',
            name: d.name,
            templateId: d.template_id || undefined,
            createdBy: d.owner_id,
            isPublic: d.is_public,
            createdAt: d.created_at,
          })),
        )
      }

      if (condData) {
        setProposalConditions(
          condData.map((c: any) => ({
            id: c.id,
            name: c.name,
            content: c.content,
            type: c.type,
          })),
        )
      }

      if (propData) {
        setProposals(
          propData.map((p: any) => ({
            id: p.id,
            projectId: p.project_id,
            versionId: p.version_id,
            fileName: p.file_name,
            proposalNumber: p.proposal_number,
            versionNumber: p.version_number,
            clientName: p.client_name,
            createdAt: p.created_at,
            createdBy: p.created_by,
          })),
        )
      }
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        fetchDbData()
      } else {
        setProjects([])
        setProposalConditions([])
        setProposals([])
      }
    })

    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) fetchDbData()
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    localStorage.setItem('p_fld', JSON.stringify(folders))
  }, [folders])
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
    if (activeProjectId) localStorage.setItem('p_pid', activeProjectId)
    else localStorage.removeItem('p_pid')
  }, [activeProjectId])

  useEffect(() => {
    if (activeVersionId) localStorage.setItem('p_vid', activeVersionId)
    else localStorage.removeItem('p_vid')
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

  const createProject = async (
    folderId: string,
    name: string,
    templateId?: string,
    isPublic: boolean = false,
  ) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('projects')
      .insert({
        name,
        folder_id: folderId,
        template_id: templateId,
        is_public: isPublic,
        owner_id: user?.id,
      })
      .select()
      .single()

    if (error || !data) {
      console.error('Error creating project:', error)
      return ''
    }

    const id = data.id
    setProjects((p) => [
      ...p,
      {
        id,
        folderId,
        name,
        templateId,
        createdBy: user?.id,
        isPublic: data.is_public,
        createdAt: data.created_at,
      },
    ])
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
          pis: p.taxRates.pis !== undefined ? p.taxRates.pis : 1.65,
          cofins: p.taxRates.cofins !== undefined ? p.taxRates.cofins : 7.6,
        },
      }))
      setProducts(migratedProducts)
      setExchangeRate(v.exchangeRate)
      setPID(v.projectId)
      setVID(v.id)
    }
  }

  const startNewProject = async (
    folderId: string,
    pName: string,
    vName: string,
    templateId?: string,
    isPublic?: boolean,
  ) => {
    const pid = await createProject(folderId, pName, templateId, isPublic)
    if (!pid) return
    setPID(pid)
    setProducts([])
    createVersion(pid, vName, [])
  }

  const deleteFolder = async (id: string) => {
    setFolders((p) => p.filter((f) => f.id !== id))
    const pids = projects.filter((p) => p.folderId === id).map((p) => p.id)

    for (const pid of pids) {
      await supabase.from('projects').delete().eq('id', pid)
    }

    setProjects((p) => p.filter((p) => p.folderId !== id))
    setVersions((p) => p.filter((v) => !pids.includes(v.projectId)))
    if (pids.includes(activeProjectId!)) {
      setPID(null)
      setVID(null)
      setProducts([])
    }
  }

  const deleteProject = async (id: string) => {
    await supabase.from('projects').delete().eq('id', id)
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
    if (activeVersionId === id) setVID(null)
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

  const saveProposalCondition = async (condition: Omit<ProposalCondition, 'id'>, id?: string) => {
    if (id) {
      const { error } = await supabase
        .from('proposal_conditions')
        .update(condition as any)
        .eq('id', id)
      if (!error) {
        setProposalConditions((p) => p.map((c) => (c.id === id ? { ...c, ...condition } : c)))
      }
    } else {
      const { data, error } = await supabase
        .from('proposal_conditions')
        .insert(condition as any)
        .select()
        .single()
      if (data && !error) {
        setProposalConditions((p) => [
          ...p,
          { id: data.id, name: data.name, content: data.content, type: data.type },
        ])
      }
    }
  }

  const deleteProposalCondition = async (id: string) => {
    const { error } = await supabase.from('proposal_conditions').delete().eq('id', id)
    if (!error) {
      setProposalConditions((p) => p.filter((c) => c.id !== id))
    }
  }

  const saveProposalRecord = async (record: Omit<ProposalRecord, 'id' | 'createdAt'>) => {
    const { data, error } = await supabase
      .from('proposals')
      .insert({
        project_id: record.projectId,
        version_id: record.versionId,
        file_name: record.fileName,
        proposal_number: record.proposalNumber,
        version_number: record.versionNumber,
        client_name: record.clientName,
        created_by: profile?.id,
      } as any)
      .select()
      .single()

    if (data && !error) {
      setProposals((p) => [
        {
          id: data.id,
          projectId: data.project_id,
          versionId: data.version_id,
          fileName: data.file_name,
          proposalNumber: data.proposal_number,
          versionNumber: data.version_number,
          clientName: data.client_name,
          createdAt: data.created_at,
          createdBy: data.created_by,
        },
        ...p,
      ])
    }
  }

  const deleteProposalRecord = async (id: string) => {
    const { error } = await supabase.from('proposals').delete().eq('id', id)
    if (!error) {
      setProposals((p) => p.filter((pr) => pr.id !== id))
    }
  }

  const store = {
    folders,
    projects,
    versions,
    templates,
    proposalConditions,
    proposals,
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
    saveProposalCondition,
    deleteProposalCondition,
    saveProposalRecord,
    deleteProposalRecord,
  }
  return React.createElement(MainStoreContext.Provider, { value: store }, children)
}

export const useMainStore = () => {
  const context = useContext(MainStoreContext)
  if (!context) throw new Error('useMainStore must be used within a MainStoreProvider')
  return context
}
