import api from './api.js'

export function importExcel(file, dataSource, loadedBy) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('data_source', dataSource)
  formData.append('loaded_by', loadedBy)
  return api.post('/api/v1/import/excel/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export function importCsv(file) {
  const formData = new FormData()
  formData.append('file', file)
  return api.post('/api/v1/import/csv/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export function importJson(payload) {
  return api.post('/api/v1/import/json/', payload)
}

export function getDataLoads(page = 1, pageSize = 20) {
  return api.get('/api/v1/import/data-loads/', {
    params: { page, page_size: pageSize },
  })
}

export function getImportLogs(loadId) {
  const params = loadId ? { load_id: loadId } : undefined
  return api.get('/api/v1/import/logs/', { params })
}
