import api from './api.js'

export function getProducts(search, page = 1, pageSize = 20) {
  const params = { page, page_size: pageSize }

  if (search) {
    params.search = search
  }

  return api.get('/api/v1/products/', { params })
}

export function getEquipments(productId, page = 1, pageSize = 20) {
  const params = { page, page_size: pageSize }

  if (productId) {
    params.product_id = productId
  }

  return api.get('/api/v1/equipments/', { params })
}
