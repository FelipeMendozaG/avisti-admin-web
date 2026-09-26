import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { getEquipments } from '../services/catalogService.js'
import { useDebounce } from '../hooks/useDebounce.js'
import { extractErrorMessage } from '../utils/errorUtils.js'

const statusStyles = {
  IN_USE: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200',
  RETIRED: 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200',
  MAINTENANCE: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200',
}

const defaultPagination = {
  count: 0,
  page: 1,
  page_size: 20,
  total_pages: 1,
  has_next: false,
  has_previous: false,
}

function Equipments() {
  const [productId, setProductId] = useState('')
  const [equipments, setEquipments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [pagination, setPagination] = useState(defaultPagination)

  const debouncedProductId = useDebounce(productId, 400)

  useEffect(() => {
    setPage(1)
  }, [debouncedProductId])

  useEffect(() => {
    let isCancelled = false

    async function fetchEquipments() {
      setIsLoading(true)
      setError('')
      try {
        const response = await getEquipments(debouncedProductId || undefined, page, pageSize)
        const payload = response.data || {}

        if (!isCancelled) {
          setEquipments(payload.data || [])
          setPagination(payload.pagination || defaultPagination)
        }
      } catch (err) {
        if (!isCancelled) {
          setError(extractErrorMessage(err, 'No se pudieron cargar los equipos'))
        }
      } finally {
        if (!isCancelled) setIsLoading(false)
      }
    }

    fetchEquipments()
    return () => {
      isCancelled = true
    }
  }, [debouncedProductId, page, pageSize])

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-indigo-600">Inventario y ciclo de vida</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Equipos</h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
            >
              <Search size={16} />
              Filtros
            </button>
          </div>
        </div>

        <div className="mt-5 max-w-sm">
          <label htmlFor="productId" className="mb-2 block text-sm font-medium text-slate-700">
            Filtrar por Product ID
          </label>
          <div className="relative">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              id="productId"
              type="number"
              min="1"
              value={productId}
              onChange={(event) => setProductId(event.target.value)}
              placeholder="Ej. 1"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100"
            />
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
                {['ID', 'Producto', 'Serie', 'Adquisición', 'Fin vida útil', 'Valor actual', 'Estado'].map((heading) => (
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
                  <td colSpan={7} className="px-5 py-10 text-center text-sm text-slate-500">
                    Cargando equipos...
                  </td>
                </tr>
              )}

              {!isLoading && equipments.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-sm text-slate-500">
                    No se encontraron equipos.
                  </td>
                </tr>
              )}

              {!isLoading &&
                equipments.map((equipment) => (
                  <tr key={equipment.equipment_id} className="transition-colors hover:bg-slate-50/80">
                    <td className="px-5 py-4 text-slate-700">{equipment.equipment_id}</td>
                    <td className="px-5 py-4 font-medium text-slate-900">{equipment.product_code}</td>
                    <td className="px-5 py-4 text-slate-700">{equipment.serial_number}</td>
                    <td className="px-5 py-4 text-slate-500">{equipment.acquisition_date || '—'}</td>
                    <td className="px-5 py-4 text-slate-500">{equipment.end_of_useful_life || '—'}</td>
                    <td className="px-5 py-4 text-slate-700">{equipment.current_market_value || '—'}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          statusStyles[equipment.life_cycle_status] || 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200'
                        }`}
                      >
                        {equipment.life_cycle_status}
                      </span>
                    </td>
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

export default Equipments
