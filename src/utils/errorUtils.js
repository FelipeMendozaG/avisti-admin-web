export function extractErrorMessage(error, fallback = 'Ocurrio un error inesperado') {
  const data = error?.response?.data
  if (!data) return error?.message || fallback
  if (data.message) {
    const details = data.errors && typeof data.errors === 'object'
      ? Object.values(data.errors).join(', ')
      : ''
    return details ? `${data.message}: ${details}` : data.message
  }
  return fallback
}
