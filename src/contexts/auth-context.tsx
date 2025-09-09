"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  User as FirebaseUser,
  createUserWithEmailAndPassword
} from 'firebase/auth'
import { auth } from '@/lib/firebase'

interface User {
  email: string
  name: string
  role: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, name: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Verificar estado de autenticação do Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // Usuário logado no Firebase
        const userData = {
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuário',
          role: 'user' // Role padrão, pode ser customizado no Firestore
        }
        setUser(userData)
      } else {
        setUser(null)
      }
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    
    try {
      await signInWithEmailAndPassword(auth, email, password)
      return true
    } catch (error) {
      console.error('Erro no login:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    setIsLoading(true)
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      // Aqui você pode adicionar o nome do usuário ao perfil
      // await updateProfile(userCredential.user, { displayName: name })
      return true
    } catch (error) {
      console.error('Erro no registro:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      router.push('/')
    } catch (error) {
      console.error('Erro no logout:', error)
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
