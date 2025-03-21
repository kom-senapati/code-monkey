"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { setCookie, getCookie, deleteCookie } from 'cookies-next'
import { useSnippetStore } from "@/store/snippetStore"
import { useChatStore } from "@/store/chatStore"
import { useRoadmapStore } from "@/store/roadmapStore"
import { useQuizStore } from "@/store/quizStore"

export interface User {
  id: string
  username: string
  name: string
  email: string
  premium: boolean
  createdAt: string
}

const USERS_DB: User[] = [
  {
    id: "1",
    username: "admin",
    name: "Admin User",
    email: "admin@example.com",
    premium: true,
    createdAt: "2023-01-01"
  },
  {
    id: "2",
    username: "dev1",
    name: "Developer One",
    email: "dev1@example.com",
    premium: true,
    createdAt: "2023-02-15"
  },
  {
    id: "3", 
    username: "user",
    name: "Regular User",
    email: "user@example.com",
    premium: false,
    createdAt: "2023-03-20"
  }
]

const PASSWORD_MAP: Record<string, string> = {
  "admin": "12345",
  "dev1": "12345",
  "user": "12345"
}

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<User>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => { throw new Error("Not implemented") },
  logout: () => {},
  isLoading: true
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const router = useRouter()
  
  useEffect(() => {
    const userFromCookie = getCookie('currentUser')
    
    if (userFromCookie) {
      try {
        const parsedUser = JSON.parse(userFromCookie as string)
        setUser(parsedUser)
      } catch (error) {
        console.error("Failed to parse stored user:", error)
        deleteCookie('currentUser')
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (username: string, password: string): Promise<User> => {
    return new Promise((resolve, reject) => {
      setIsLoading(true)
      
      setTimeout(() => {
        const foundUser = USERS_DB.find(u => u.username === username)
        const correctPassword = PASSWORD_MAP[username]
        
        if (foundUser && password === correctPassword) {
          setUser(foundUser)
          setCookie('currentUser', JSON.stringify(foundUser), {
            maxAge: 60 * 60 * 24 * 7,
            path: '/',
          })
          setIsLoading(false)
          resolve(foundUser)
        } else {
          setIsLoading(false)
          reject(new Error("Invalid username or password"))
        }
      }, 800)
    })
  }

  const logout = () => {
    useSnippetStore.getState().reset();
    useChatStore.getState().reset();
    useRoadmapStore.getState().reset();
    useQuizStore.getState().reset();
    
    localStorage.removeItem('snippet-storage');
    localStorage.removeItem('chat-storage');
    localStorage.removeItem('roadmap-storage');
    localStorage.removeItem('quiz-storage');
    
    setUser(null)
    deleteCookie('currentUser')
    router.push('/sign-in')
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}