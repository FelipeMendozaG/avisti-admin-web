import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Download, Search } from 'lucide-react'
import { getProducts } from '../services/catalogService.js'
import { useDebounce } from '../hooks/useDebounce.js'
import { extractErrorMessage } from '../utils/errorUtils.js'

const formatDateValue = (value) => {
  if (!value) return '—'

  try {
    return new Date(value).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return value
  }
}

const defaultPagination = {
  count: 0,
  page: 1,
  page_size: 20,
  total_pages: 1,
  has_next: false,
  has_previous: false,
}

function Products() {
  const [search, setSearch] = useState('')
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [pagination, setPagination] = useState(defaultPagination)

  const debouncedSearch = useDebounce(search, 400)

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  useEffect(() => {
    let isCancelled = false

    async function fetchProducts() {
      setIsLoading(true)
      setError('')
      try {
        const response = await getProducts(debouncedSearch || undefined, page, pageSize)
        const payload = response.data || {}

        if (!isCancelled) {
          setProducts(payload.data || [])
          setPagination(payload.pagination || defaultPagination)
        }
      } catch (err) {
        if (!isCancelled) {
          setError(extractErrorMessage(err, 'No se pudieron cargar los productos'))
        }
      } finally {
        if (!isCancelled) setIsLoading(false)
      }
    }

    fetchProducts()
    return () => {
      isCancelled = true
    }
  }, [debouncedSearch, page, pageSize])

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-indigo-600">Catálogo principal</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Productos</h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
            >
              <Download size={16} />
              Exportar
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm shadow-indigo-200 transition-colors hover:bg-indigo-500"
            >
              + Nuevo producto
            </button>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full max-w-md">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por código, nombre o descripción..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100"
            />
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            {pagination.count || products.length} registros
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                {['ID', 'Código', 'Nombre', 'Categoría', 'Descripción', 'Creado'].map((heading) => (
                  <th
                    key={heading}
                    className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {isLoading && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-slate-500">
                    Cargando productos...
                  </td>
                </tr>
              )}

              {!isLoading && products.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-slate-500">
                    No se encontraron productos.
                  </td>
                </tr>
              )}

              {!isLoading &&
                products.map((product) => (
                  <tr key={product.product_id} className="transition-colors hover:bg-slate-50/80">
                    <td className="px-5 py-4 text-slate-700">{product.product_id}</td>
                    <td className="px-5 py-4 font-semibold text-slate-900">{product.product_code}</td>
                    <td className="px-5 py-4 text-slate-700">{product.name}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                        {product.category}
                      </span>
                    </td>
                    <td className="max-w-xs px-5 py-4 text-slate-500">
                      <div className="line-clamp-2">{product.description}</div>
                    </td>
                    <td className="px-5 py-4 text-slate-500">{formatDateValue(product.created_at)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-slate-500">
          {pagination.count > 0
            ? `Mostrando ${(pagination.page - 1) * pagination.page_size + 1} - ${Math.min(
                pagination.page * pagination.page_size,
                pagination.count,
              )} de ${pagination.count}`
            : 'Sin registros'}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={!pagination.has_previous}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft size={16} />
            Anterior
          </button>

          <span className="min-w-[110px] text-center text-sm font-medium text-slate-600">
            Página {pagination.page} / {pagination.total_pages || 1}
          </span>

          <button
            type="button"
            onClick={() => setPage((current) => current + 1)}
            disabled={!pagination.has_next}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Siguiente
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default Products
