"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

// User interface with premium flag
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

// Password map for all users
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
  
  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser")
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        setUser(parsedUser)
      } catch (error) {
        console.error("Failed to parse stored user:", error)
        localStorage.removeItem("currentUser")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (username: string, password: string): Promise<User> => {
    return new Promise((resolve, reject) => {
      setIsLoading(true)
      
      // Simulate API delay
      setTimeout(() => {
        const foundUser = USERS_DB.find(u => u.username === username)
        const correctPassword = PASSWORD_MAP[username]
        
        if (foundUser && password === correctPassword) {
          setUser(foundUser)
          localStorage.setItem("currentUser", JSON.stringify(foundUser))
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
    setUser(null)
    localStorage.removeItem("currentUser")
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