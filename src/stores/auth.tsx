import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, UserRole, UserStatus } from '@/types'

const defaultUsers: User[] = [
  {
    id: '1',
    name: 'Administrador',
    email: 'enio.matunaga@leapit.com.br',
    password: 'z7B?j6m5Yb5b?H&N',
    role: 'Admin',
    status: 'Authorized',
  },
]

interface AuthStoreState {
  users: User[]
  currentUser: User | null
  isAuthenticated: boolean
  loginUser: (e: string, p: string) => { success: boolean; message?: string }
  registerUser: (n: string, e: string, p: string) => { success: boolean; message?: string }
  logoutUser: () => void
  updateUserRole: (id: string, role: UserRole) => void
  updateUserStatus: (id: string, status: UserStatus) => void
  changePassword: (c: string, n: string) => boolean
}

const AuthStoreContext = createContext<AuthStoreState | null>(null)

export function AuthStoreProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(() =>
    JSON.parse(localStorage.getItem('p_users') || JSON.stringify(defaultUsers)),
  )
  const [currentUser, setCurrentUser] = useState<User | null>(() =>
    JSON.parse(localStorage.getItem('p_user') || 'null'),
  )
  const [isAuthenticated, setIsAuth] = useState(() => localStorage.getItem('p_auth') === 'true')

  useEffect(() => {
    localStorage.setItem('p_users', JSON.stringify(users))
  }, [users])
  useEffect(() => {
    localStorage.setItem('p_user', JSON.stringify(currentUser))
  }, [currentUser])
  useEffect(() => {
    localStorage.setItem('p_auth', String(isAuthenticated))
  }, [isAuthenticated])

  const loginUser = (email: string, pass: string) => {
    const user = users.find((u) => u.email === email && u.password === pass)
    if (!user) return { success: false, message: 'Credenciais inválidas.' }
    if (user.status !== 'Authorized')
      return {
        success: false,
        message: 'Sua conta aguarda autorização de um administrador.',
      }

    setCurrentUser(user)
    setIsAuth(true)
    return { success: true }
  }

  const registerUser = (name: string, email: string, pass: string) => {
    if (users.find((u) => u.email === email))
      return { success: false, message: 'Email já cadastrado.' }
    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      password: pass,
      role: 'Viewer',
      status: 'Pending',
    }
    setUsers([...users, newUser])
    return { success: true }
  }

  const logoutUser = () => {
    setIsAuth(false)
    setCurrentUser(null)
  }

  const updateUserRole = (id: string, role: UserRole) =>
    setUsers((p) => p.map((u) => (u.id === id ? { ...u, role } : u)))

  const updateUserStatus = (id: string, status: UserStatus) =>
    setUsers((p) => p.map((u) => (u.id === id ? { ...u, status } : u)))

  const changePassword = (curr: string, newPass: string) => {
    if (!currentUser || currentUser.password !== curr) return false
    const updated = { ...currentUser, password: newPass }
    setCurrentUser(updated)
    setUsers((p) => p.map((u) => (u.id === currentUser.id ? updated : u)))
    return true
  }

  const store = {
    users,
    currentUser,
    isAuthenticated,
    loginUser,
    registerUser,
    logoutUser,
    updateUserRole,
    updateUserStatus,
    changePassword,
  }

  return React.createElement(AuthStoreContext.Provider, { value: store }, children)
}

const useAuthStore = () => {
  const context = useContext(AuthStoreContext)
  if (!context) throw new Error('useAuthStore must be used within AuthStoreProvider')
  return context
}

export default useAuthStore
