import { createContext, useContext, useMemo, useState } from 'react'

const TOKEN_KEY = 'token'
const USER_KEY = 'user'

function readJson(key) {
  const raw = localStorage.getItem(key)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '')
  const [user, setUser] = useState(() => readJson(USER_KEY))

  const isAuthenticated = Boolean(token)

  const login = ({ token: nextToken, user: nextUser }) => {
    setToken(nextToken || '')
    setUser(nextUser ?? null)

    if (nextToken) localStorage.setItem(TOKEN_KEY, nextToken)
    else localStorage.removeItem(TOKEN_KEY)

    if (nextUser !== undefined) {
      if (nextUser === null) localStorage.removeItem(USER_KEY)
      else localStorage.setItem(USER_KEY, JSON.stringify(nextUser))
    }
  }

  const logout = () => {
    setToken('')
    setUser(null)
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }

  const value = useMemo(
    () => ({ token, user, isAuthenticated, login, logout }),
    [token, user, isAuthenticated],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

