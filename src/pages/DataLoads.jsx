import { useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { getDataLoads, getImportLogs } from '../services/importService.js'
import { extractErrorMessage } from '../utils/errorUtils.js'

const statusStyles = {
  SUCCESS: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200',
  FAILED: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-200',
  ERROR: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-200',
  PROCESSING: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200',
}

const logLevelStyles = {
  INFO: 'bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200',
  WARN: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200',
  ERROR: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-200',
  SUCCESS: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200',
}

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

function LogsModal({ loadId, onClose }) {
  const [logs, setLogs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isCancelled = false

    async function fetchLogs() {
      setIsLoading(true)
      setError('')
      try {
        const response = await getImportLogs(loadId)
        if (!isCancelled) setLogs(response.data?.data || [])
      } catch (err) {
        if (!isCancelled) setError(extractErrorMessage(err, 'No se pudieron cargar los logs'))
      } finally {
        if (!isCancelled) setIsLoading(false)
      }
    }

    fetchLogs()
    return () => {
      isCancelled = true
    }
  }, [loadId])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="max-h-[80vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Auditoría</p>
            <h3 className="mt-1 text-xl font-semibold text-slate-900">Logs de la carga #{loadId}</h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500 transition-colors hover:border-slate-300 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
          {isLoading && <p className="text-sm text-slate-500">Cargando logs...</p>}
          {error && <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          {!isLoading && !error && logs.length === 0 && (
            <p className="text-sm text-slate-500">Esta carga no tiene logs registrados.</p>
          )}

          {!isLoading && logs.length > 0 && (
            <div className="space-y-5">
              {logs.map((log) => (
                <div key={log.log_id} className="relative pl-7">
                  <div className="absolute left-0 top-2 h-3 w-3 rounded-full border-2 border-white bg-indigo-500 shadow-sm shadow-indigo-100" />
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{log.procedure_name}</p>
                        {log.step_description && (
                          <p className="text-sm text-slate-500">{log.step_description}</p>
                        )}
                      </div>

                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                          logLevelStyles[log.log_level] || 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200'
                        }`}
                      >
                        {log.log_level}
                      </span>
                    </div>

                    <p className="text-sm leading-6 text-slate-700">{log.message}</p>
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                      <span>{log.created_at ? formatDateValue(log.created_at) : '—'}</span>
                      {log.log_level === 'ERROR' && <AlertTriangle size={14} className="text-red-500" />}
                      {log.log_level === 'SUCCESS' && <CheckCircle2 size={14} className="text-emerald-500" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function DataLoads() {
  const [dataLoads, setDataLoads] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedLoadId, setSelectedLoadId] = useState(null)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [pagination, setPagination] = useState(defaultPagination)

  useEffect(() => {
    let isCancelled = false

    async function fetchDataLoads() {
      setIsLoading(true)
      setError('')
      try {
        const response = await getDataLoads(page, pageSize)
        const payload = response.data || {}

        if (!isCancelled) {
          setDataLoads(payload.data || [])
          setPagination(payload.pagination || defaultPagination)
        }
      } catch (err) {
        if (!isCancelled) setError(extractErrorMessage(err, 'No se pudieron cargar los datos'))
      } finally {
        if (!isCancelled) setIsLoading(false)
      }
    }

    fetchDataLoads()
    return () => {
      isCancelled = true
    }
  }, [page, pageSize])

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-indigo-600">Historial de importaciones</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Cargas y logs</h2>
          </div>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm shadow-indigo-200 transition-colors hover:bg-indigo-500"
          >
            + Nueva carga
          </button>
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
                {['ID', 'Origen', 'Archivo', 'Fecha', 'Cargado por', 'Registros', 'Estado', 'Logs'].map((heading) => (
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
                  <td colSpan={8} className="px-5 py-10 text-center text-sm text-slate-500">
                    Cargando historial...
                  </td>
                </tr>
              )}

              {!isLoading && dataLoads.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-sm text-slate-500">
                    No hay cargas registradas.
                  </td>
                </tr>
              )}

              {!isLoading &&
                dataLoads.map((load) => (
                  <tr key={load.load_id} className="transition-colors hover:bg-slate-50/80">
                    <td className="px-5 py-4 text-slate-700">{load.load_id}</td>
                    <td className="px-5 py-4 text-slate-700">{load.data_source}</td>
                    <td className="px-5 py-4">
                      <div className="max-w-xs truncate text-slate-700">{load.file_name}</div>
                    </td>
                    <td className="px-5 py-4 text-slate-500">{formatDateValue(load.load_date)}</td>
                    <td className="px-5 py-4 text-slate-500">{load.loaded_by}</td>
                    <td className="px-5 py-4 text-slate-700">{load.processed_records}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          statusStyles[load.load_status] || 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200'
                        }`}
                      >
                        {load.load_status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => setSelectedLoadId(load.load_id)}
                        className="rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 transition-colors hover:border-indigo-300 hover:bg-indigo-100"
                      >
                        Ver logs
                      </button>
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

      {selectedLoadId && (
        <LogsModal loadId={selectedLoadId} onClose={() => setSelectedLoadId(null)} />
      )}
    </div>
  )
}

export default DataLoads
