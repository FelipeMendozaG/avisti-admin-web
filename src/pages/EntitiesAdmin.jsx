import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Search, ShieldCheck, ShieldX, TimerReset } from 'lucide-react'
import { getEntities, updateEntityVerification } from '../services/adminService.js'
import { useDebounce } from '../hooks/useDebounce.js'
import { extractErrorMessage } from '../utils/errorUtils.js'
import { useToast } from '../context/ToastContext.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import StatusBadge, { ENTITY_VERIFICATION_STYLES } from '../components/StatusBadge.jsx'

const STATUS_FILTERS = [
  { value: '', label: 'Todos los estados' },
  { value: 'PENDING', label: 'Pendientes' },
  { value: 'VERIFIED', label: 'Verificadas' },
  { value: 'REJECTED', label: 'Rechazadas' },
]

const defaultPagination = {
  count: 0,
  page: 1,
  page_size: 20,
  total_pages: 1,
  has_next: false,
  has_previous: false,
}

function EntitiesAdmin() {
  const toast = useToast()
  const [search, setSearch] = useState('')
  const [verificationStatus, setVerificationStatus] = useState('')
  const [entities, setEntities] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [pagination, setPagination] = useState(defaultPagination)
  const [pendingAction, setPendingAction] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const debouncedSearch = useDebounce(search, 400)

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, verificationStatus])

  useEffect(() => {
    let isCancelled = false

    async function fetchEntities() {
      setIsLoading(true)
      setError('')
      try {
        const response = await getEntities({
          verificationStatus: verificationStatus || undefined,
          search: debouncedSearch || undefined,
          page,
          pageSize,
        })
        const payload = response.data || {}
        if (!isCancelled) {
          setEntities(payload.data || [])
          setPagination(payload.pagination || defaultPagination)
        }
      } catch (err) {
        if (!isCancelled) {
          setError(extractErrorMessage(err, 'No se pudieron cargar las entidades'))
        }
      } finally {
        if (!isCancelled) setIsLoading(false)
      }
    }

    fetchEntities()
    return () => {
      isCancelled = true
    }
  }, [debouncedSearch, verificationStatus, page, pageSize, refreshKey])

  async function handleConfirmAction() {
    if (!pendingAction) return
    setIsSubmitting(true)
    try {
      await updateEntityVerification(pendingAction.entity.entity_id, pendingAction.status)
      toast.success(`Entidad actualizada a ${pendingAction.status}`)
      setPendingAction(null)
      setRefreshKey((key) => key + 1)
    } catch (err) {
      toast.error(extractErrorMessage(err, 'No se pudo actualizar el estado de la entidad'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-indigo-600">Verificación institucional</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Entidades</h2>
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
              placeholder="Buscar por RUC o razón social..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100"
            />
          </div>

          <select
            value={verificationStatus}
            onChange={(event) => setVerificationStatus(event.target.value)}
            className="w-full max-w-xs rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100"
          >
            {STATUS_FILTERS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
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
                {['RUC / Tax ID', 'Razón social', 'Tipo', 'Contacto', 'Estado', 'Acciones'].map((heading) => (
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
                    Cargando entidades...
                  </td>
                </tr>
              )}

              {!isLoading && entities.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-slate-500">
                    No se encontraron entidades.
                  </td>
                </tr>
              )}

              {!isLoading &&
                entities.map((entity) => (
                  <tr key={entity.entity_id} className="transition-colors hover:bg-slate-50/80">
                    <td className="px-5 py-4 font-medium text-slate-900">{entity.tax_id}</td>
                    <td className="px-5 py-4 text-slate-700">{entity.company_name}</td>
                    <td className="px-5 py-4 text-slate-500">{entity.entity_type || '—'}</td>
                    <td className="px-5 py-4 text-slate-500">
                      <div>{entity.contact_email || '—'}</div>
                      <div className="text-xs text-slate-400">{entity.contact_phone || ''}</div>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={entity.verification_status} styles={ENTITY_VERIFICATION_STYLES} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          title="Verificar"
                          disabled={entity.verification_status === 'VERIFIED'}
                          onClick={() => setPendingAction({ entity, status: 'VERIFIED' })}
                          className="rounded-lg p-1.5 text-emerald-600 transition-colors hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          <ShieldCheck size={16} />
                        </button>
                        <button
                          type="button"
                          title="Rechazar"
                          disabled={entity.verification_status === 'REJECTED'}
                          onClick={() => setPendingAction({ entity, status: 'REJECTED' })}
                          className="rounded-lg p-1.5 text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          <ShieldX size={16} />
                        </button>
                        <button
                          type="button"
                          title="Marcar pendiente"
                          disabled={entity.verification_status === 'PENDING'}
                          onClick={() => setPendingAction({ entity, status: 'PENDING' })}
                          className="rounded-lg p-1.5 text-amber-600 transition-colors hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          <TimerReset size={16} />
                        </button>
                      </div>
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

      {pendingAction && (
        <ConfirmDialog
          title="Actualizar verificación"
          message={`¿Confirmas cambiar el estado de "${pendingAction.entity.company_name}" a ${pendingAction.status}?`}
          tone={pendingAction.status === 'REJECTED' ? 'danger' : 'success'}
          confirmLabel="Actualizar"
          isSubmitting={isSubmitting}
          onConfirm={handleConfirmAction}
          onCancel={() => setPendingAction(null)}
        />
      )}
    </div>
  )
}

export default EntitiesAdmin
