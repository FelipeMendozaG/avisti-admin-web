import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
const TOKEN_STORAGE_KEY = 'avisti_token'

const api = axios.create({
  baseURL: BASE_URL,
})

export function getStoredToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

export function setStoredToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
  }
}

// Attaches the Bearer token to every outgoing request when available.
api.interceptors.request.use((config) => {
  const token = getStoredToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Forces logout on any 401 response (expired/invalid token) unless it's the login call itself.
let onUnauthorized = null

export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const isLoginRequest = error.config?.url?.includes('/auth/login')
    if (status === 401 && !isLoginRequest) {
      setStoredToken(null)
      if (onUnauthorized) onUnauthorized()
    }
    return Promise.reject(error)
  },
)

export default api
