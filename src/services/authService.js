import api from './api.js'

export function login(email, password) {
  return api.post('/api/v1/auth/login/', { email, password })
}

export function logout() {
  return api.post('/api/v1/auth/logout/')
}
