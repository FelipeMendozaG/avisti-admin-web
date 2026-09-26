import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import * as authService from '../services/authService.js'
import { getStoredToken, setStoredToken, setUnauthorizedHandler } from '../services/api.js'

const AuthContext = createContext(null)

const USER_STORAGE_KEY = 'avisti_user_email'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getStoredToken())
  const [user, setUser] = useState(() => localStorage.getItem(USER_STORAGE_KEY))

  const clearSession = useCallback(() => {
    setStoredToken(null)
    localStorage.removeItem(USER_STORAGE_KEY)
    setToken(null)
    setUser(null)
  }, [])

  useEffect(() => {
    // Reacts to 401 responses coming from the Axios interceptor.
    setUnauthorizedHandler(clearSession)
    return () => setUnauthorizedHandler(null)
  }, [clearSession])

  const login = useCallback(async (email, password) => {
    const response = await authService.login(email, password)
    const newToken = response.data?.data?.token
    setStoredToken(newToken)
    localStorage.setItem(USER_STORAGE_KEY, email)
    setToken(newToken)
    setUser(email)
    return response.data
  }, [])

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } catch {
      // Ignore logout errors: the local session is cleared regardless.
    } finally {
      clearSession()
    }
  }, [clearSession])

  const value = useMemo(
    () => ({ token, user, isAuthenticated: Boolean(token), login, logout }),
    [token, user, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider')
  }
  return context
}
