import api from './api.js'

const BASE = '/api/v1/admin'

// --- Entidades ---

export function getEntities({ verificationStatus, search, page = 1, pageSize = 20 } = {}) {
  const params = { page, page_size: pageSize }
  if (verificationStatus) params.verification_status = verificationStatus
  if (search) params.search = search
  return api.get(`${BASE}/entities`, { params })
}

export function updateEntityVerification(entityId, verificationStatus) {
  return api.patch(`${BASE}/entities/${entityId}/verification`, {
    verification_status: verificationStatus,
  })
}

// --- Solicitudes de donación ---

export function getDonationRequests({
  requestStatus,
  requestType,
  dateFrom,
  dateTo,
  page = 1,
  pageSize = 20,
} = {}) {
  const params = { page, page_size: pageSize }
  if (requestStatus) params.request_status = requestStatus
  if (requestType) params.request_type = requestType
  if (dateFrom) params.date_from = dateFrom
  if (dateTo) params.date_to = dateTo
  return api.get(`${BASE}/donation-requests`, { params })
}

export function getDonationRequestDetail(requestId) {
  return api.get(`${BASE}/donation-requests/${requestId}`)
}

export function updateDonationRequestStatus(requestId, requestStatus) {
  return api.patch(`${BASE}/donation-requests/${requestId}/status`, {
    request_status: requestStatus,
  })
}

// --- Equipos y asignaciones ---

export function getAvailableEquipments({ page = 1, pageSize = 20, productQuery } = {}) {
  const params = { page, page_size: pageSize }
  if (productQuery) params.product_query = productQuery
  return api.get(`${BASE}/equipments/available-for-donation`, { params })
}

export function createDonationAssignment(payload) {
  return api.post(`${BASE}/donation-assignments`, payload)
}

export function deleteDonationAssignment(assignmentId) {
  return api.delete(`${BASE}/donation-assignments/${assignmentId}`)
}
