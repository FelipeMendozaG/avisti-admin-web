import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, ChevronLeft, ChevronRight, Eye, XCircle } from 'lucide-react'
import { getDonationRequests, updateDonationRequestStatus } from '../services/adminService.js'
import { extractErrorMessage } from '../utils/errorUtils.js'
import { useToast } from '../context/ToastContext.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import StatusBadge, { REQUEST_STATUS_STYLES } from '../components/StatusBadge.jsx'

const STATUS_FILTERS = [
  { value: '', label: 'Todos los estados' },
  { value: 'ON_HOLD', label: 'En espera' },
  { value: 'APPROVED', label: 'Aprobadas' },
  { value: 'REJECTED', label: 'Rechazadas' },
  { value: 'DELIVERED', label: 'Entregadas' },
]

const defaultPagination = {
  count: 0,
  page: 1,
  page_size: 20,
  total_pages: 1,
  has_next: false,
  has_previous: false,
}

const formatDateValue = (value) => {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  } catch {
    return value
  }
}

function DonationRequests() {
  const toast = useToast()
  const [requestStatus, setRequestStatus] = useState('')
  const [requestType, setRequestType] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [requests, setRequests] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [pagination, setPagination] = useState(defaultPagination)
  const [pendingAction, setPendingAction] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    setPage(1)
  }, [requestStatus, requestType, dateFrom, dateTo])

  useEffect(() => {
    let isCancelled = false

    async function fetchRequests() {
      setIsLoading(true)
      setError('')
      try {
        const response = await getDonationRequests({
          requestStatus: requestStatus || undefined,
          requestType: requestType || undefined,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
          page,
          pageSize,
        })
        const payload = response.data || {}
        if (!isCancelled) {
          setRequests(payload.data || [])
          setPagination(payload.pagination || defaultPagination)
        }
      } catch (err) {
        if (!isCancelled) {
          setError(extractErrorMessage(err, 'No se pudieron cargar las solicitudes'))
        }
      } finally {
        if (!isCancelled) setIsLoading(false)
      }
    }

    fetchRequests()
    return () => {
      isCancelled = true
    }
  }, [requestStatus, requestType, dateFrom, dateTo, page, pageSize, refreshKey])

  async function handleConfirmAction() {
    if (!pendingAction) return
    setIsSubmitting(true)
    try {
      await updateDonationRequestStatus(pendingAction.request.request_id, pendingAction.status)
      toast.success(`Solicitud #${pendingAction.request.request_id} actualizada a ${pendingAction.status}`)
      setPendingAction(null)
      setRefreshKey((key) => key + 1)
    } catch (err) {
      toast.error(extractErrorMessage(err, 'No se pudo actualizar la solicitud'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <p className="text-sm font-medium text-indigo-600">Convenios y donaciones</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Solicitudes de donación</h2>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <select
            value={requestStatus}
            onChange={(event) => setRequestStatus(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100"
          >
            {STATUS_FILTERS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <input
            type="text"
            value={requestType}
            onChange={(event) => setRequestType(event.target.value)}
            placeholder="Tipo de solicitud"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100"
          />

          <input
            type="date"
            value={dateFrom}
            onChange={(event) => setDateFrom(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100"
          />

          <input
            type="date"
            value={dateTo}
            onChange={(event) => setDateTo(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100"
          />
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
                {['ID', 'Entidad', 'Tipo', 'Fecha', 'Cantidad', 'Estado', 'Acciones'].map((heading) => (
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
                    Cargando solicitudes...
                  </td>
                </tr>
              )}

              {!isLoading && requests.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-sm text-slate-500">
                    No se encontraron solicitudes.
                  </td>
                </tr>
              )}

              {!isLoading &&
                requests.map((request) => (
                  <tr key={request.request_id} className="transition-colors hover:bg-slate-50/80">
                    <td className="px-5 py-4 font-medium text-slate-900">#{request.request_id}</td>
                    <td className="px-5 py-4 text-slate-700">{request.entity?.company_name || '—'}</td>
                    <td className="px-5 py-4 text-slate-500">{request.request_type}</td>
                    <td className="px-5 py-4 text-slate-500">{formatDateValue(request.request_date)}</td>
                    <td className="px-5 py-4 text-slate-700">{request.requested_quantity}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={request.request_status} styles={REQUEST_STATUS_STYLES} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <Link
                          to={`/admin/donation-requests/${request.request_id}`}
                          title="Ver detalle"
                          className="rounded-lg p-1.5 text-indigo-600 transition-colors hover:bg-indigo-50"
                        >
                          <Eye size={16} />
                        </Link>
                        <button
                          type="button"
                          title="Aprobar"
                          disabled={request.request_status !== 'ON_HOLD'}
                          onClick={() => setPendingAction({ request, status: 'APPROVED' })}
                          className="rounded-lg p-1.5 text-emerald-600 transition-colors hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          <CheckCircle2 size={16} />
                        </button>
                        <button
                          type="button"
                          title="Rechazar"
                          disabled={request.request_status !== 'ON_HOLD'}
                          onClick={() => setPendingAction({ request, status: 'REJECTED' })}
                          className="rounded-lg p-1.5 text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          <XCircle size={16} />
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
          title="Actualizar solicitud"
          message={`¿Confirmas cambiar la solicitud #${pendingAction.request.request_id} a ${pendingAction.status}?`}
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

export default DonationRequests
