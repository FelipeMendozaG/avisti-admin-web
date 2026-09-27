import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, PlusCircle, Trash2, XCircle } from 'lucide-react'
import {
  deleteDonationAssignment,
  getDonationRequestDetail,
  updateDonationRequestStatus,
} from '../services/adminService.js'
import { extractErrorMessage } from '../utils/errorUtils.js'
import { useToast } from '../context/ToastContext.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import AssignEquipmentModal from '../components/AssignEquipmentModal.jsx'
import StatusBadge, { REQUEST_STATUS_STYLES } from '../components/StatusBadge.jsx'

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

function DonationRequestDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()

  const [request, setRequest] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [pendingStatus, setPendingStatus] = useState(null)
  const [pendingRevert, setPendingRevert] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)

  const fetchDetail = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const response = await getDonationRequestDetail(id)
      setRequest(response.data?.data || null)
    } catch (err) {
      setError(extractErrorMessage(err, 'No se pudo cargar la solicitud'))
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchDetail()
  }, [fetchDetail])

  async function handleConfirmStatus() {
    if (!pendingStatus) return
    setIsSubmitting(true)
    try {
      await updateDonationRequestStatus(id, pendingStatus)
      toast.success(`Solicitud actualizada a ${pendingStatus}`)
      setPendingStatus(null)
      fetchDetail()
    } catch (err) {
      toast.error(extractErrorMessage(err, 'No se pudo actualizar la solicitud'))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleConfirmRevert() {
    if (!pendingRevert) return
    setIsSubmitting(true)
    try {
      await deleteDonationAssignment(pendingRevert.assignment_id)
      toast.success('Asignación revertida correctamente')
      setPendingRevert(null)
      fetchDetail()
    } catch (err) {
      toast.error(extractErrorMessage(err, 'No se pudo revertir la asignación'))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
        Cargando solicitud...
      </div>
    )
  }

  if (error || !request) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => navigate('/admin/donation-requests')}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft size={16} />
          Volver a solicitudes
        </button>
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error || 'Solicitud no encontrada'}
        </div>
      </div>
    )
  }

  const assignments = request.assignments || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to="/admin/donation-requests"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft size={16} />
          Volver a solicitudes
        </Link>

        <div className="flex items-center gap-2">
          {request.request_status === 'ON_HOLD' && (
            <>
              <button
                type="button"
                onClick={() => setPendingStatus('APPROVED')}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm shadow-emerald-200 transition-colors hover:bg-emerald-500"
              >
                <CheckCircle2 size={16} />
                Aprobar
              </button>
              <button
                type="button"
                onClick={() => setPendingStatus('REJECTED')}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm shadow-red-200 transition-colors hover:bg-red-500"
              >
                <XCircle size={16} />
                Rechazar
              </button>
            </>
          )}
          {request.request_status === 'APPROVED' && (
            <button
              type="button"
              onClick={() => setShowAssignModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm shadow-indigo-200 transition-colors hover:bg-indigo-500"
            >
              <PlusCircle size={16} />
              Asignar equipo
            </button>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-medium text-indigo-600">Solicitud #{request.request_id}</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
              {request.entity?.company_name || 'Entidad no disponible'}
            </h2>
            <p className="mt-1 text-sm text-slate-500">RUC / Tax ID: {request.entity?.tax_id || '—'}</p>
          </div>
          <StatusBadge status={request.request_status} styles={REQUEST_STATUS_STYLES} />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Tipo</p>
            <p className="mt-1 text-sm font-medium text-slate-800">{request.request_type}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Fecha de solicitud</p>
            <p className="mt-1 text-sm font-medium text-slate-800">{formatDateValue(request.request_date)}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Cantidad solicitada</p>
            <p className="mt-1 text-sm font-medium text-slate-800">{request.requested_quantity}</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Necesidad social</h3>
        <p className="mt-3 text-sm leading-relaxed text-slate-700">
          {request.need_description || 'Sin descripción registrada.'}
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
            Equipos asignados
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                {['N° Serie', 'Modelo', 'Fecha de entrega', 'Referencia de acta', 'Beneficiarios', 'Acciones'].map(
                  (heading) => (
                    <th
                      key={heading}
                      className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500"
                    >
                      {heading}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {assignments.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-sm text-slate-500">
                    Aún no hay equipos asignados a esta solicitud.
                  </td>
                </tr>
              )}

              {assignments.map((assignment) => (
                <tr key={assignment.assignment_id} className="transition-colors hover:bg-slate-50/80">
                  <td className="px-5 py-4 font-medium text-slate-900">
                    {assignment.equipment?.serial_number || '—'}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {assignment.equipment?.product_name ||
                      assignment.equipment?.product_code ||
                      assignment.equipment?.model ||
                      '—'}
                  </td>
                  <td className="px-5 py-4 text-slate-600">{formatDateValue(assignment.delivery_date)}</td>
                  <td className="px-5 py-4 text-slate-600">{assignment.donation_deed_ref}</td>
                  <td className="px-5 py-4 text-slate-600">{assignment.estimated_beneficiaries_impact}</td>
                  <td className="px-5 py-4">
                    <button
                      type="button"
                      title="Revertir asignación"
                      onClick={() => setPendingRevert(assignment)}
                      className="rounded-lg p-1.5 text-red-600 transition-colors hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {pendingStatus && (
        <ConfirmDialog
          title="Actualizar solicitud"
          message={`¿Confirmas cambiar el estado de la solicitud a ${pendingStatus}?`}
          tone={pendingStatus === 'REJECTED' ? 'danger' : 'success'}
          confirmLabel="Actualizar"
          isSubmitting={isSubmitting}
          onConfirm={handleConfirmStatus}
          onCancel={() => setPendingStatus(null)}
        />
      )}

      {pendingRevert && (
        <ConfirmDialog
          title="Revertir asignación"
          message={`¿Confirmas revertir la asignación del equipo ${
            pendingRevert.equipment?.serial_number || pendingRevert.assignment_id
          }? El equipo volverá a estar disponible.`}
          tone="danger"
          confirmLabel="Revertir"
          isSubmitting={isSubmitting}
          onConfirm={handleConfirmRevert}
          onCancel={() => setPendingRevert(null)}
        />
      )}

      {showAssignModal && (
        <AssignEquipmentModal
          requestId={id}
          onClose={() => setShowAssignModal(false)}
          onAssigned={fetchDetail}
        />
      )}
    </div>
  )
}

export default DonationRequestDetail
