import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import Modal from './Modal.jsx'
import { createDonationAssignment, getAvailableEquipments } from '../services/adminService.js'
import { extractErrorMessage } from '../utils/errorUtils.js'
import { useToast } from '../context/ToastContext.jsx'
import { useDebounce } from '../hooks/useDebounce.js'

const initialForm = {
  equipmentId: '',
  deliveryDate: '',
  donationDeedRef: '',
  estimatedBeneficiariesImpact: '',
}

function AssignEquipmentModal({ requestId, onClose, onAssigned }) {
  const toast = useToast()
  const [equipments, setEquipments] = useState([])
  const [isLoadingEquipments, setIsLoadingEquipments] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [search, setSearch] = useState('')
  const [form, setForm] = useState(initialForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const debouncedSearch = useDebounce(search, 400)

  useEffect(() => {
    let isCancelled = false

    async function fetchEquipments() {
      setIsLoadingEquipments(true)
      setLoadError('')
      try {
        const response = await getAvailableEquipments({
          page: 1,
          pageSize: 20,
          productQuery: debouncedSearch || undefined,
        })
        const payload = response.data || {}
        if (!isCancelled) {
          setEquipments(payload.data || [])
        }
      } catch (err) {
        if (!isCancelled) {
          setLoadError(extractErrorMessage(err, 'No se pudieron cargar los equipos disponibles'))
        }
      } finally {
        if (!isCancelled) setIsLoadingEquipments(false)
      }
    }

    fetchEquipments()
    return () => {
      isCancelled = true
    }
  }, [debouncedSearch])

  const isFormValid =
    form.equipmentId &&
    form.deliveryDate &&
    form.donationDeedRef.trim().length > 0 &&
    form.estimatedBeneficiariesImpact !== '' &&
    Number(form.estimatedBeneficiariesImpact) >= 0

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!isFormValid) return

    setIsSubmitting(true)
    setSubmitError('')
    try {
      await createDonationAssignment({
        request_id: Number(requestId),
        equipment_id: Number(form.equipmentId),
        delivery_date: form.deliveryDate,
        donation_deed_ref: form.donationDeedRef.trim(),
        estimated_beneficiaries_impact: Number(form.estimatedBeneficiariesImpact),
      })
      toast.success('Equipo asignado correctamente')
      onAssigned()
      onClose()
    } catch (err) {
      setSubmitError(extractErrorMessage(err, 'No se pudo registrar la asignación'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal title="Asignar equipo a la solicitud" onClose={onClose} maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Equipo disponible</label>
          <div className="relative mb-3">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por serie, código o nombre..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100"
            />
          </div>

          {loadError && (
            <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {loadError}
            </div>
          )}

          <div className="max-h-60 overflow-y-auto rounded-xl border border-slate-200">
            {isLoadingEquipments && (
              <div className="px-4 py-6 text-center text-sm text-slate-500">Cargando equipos...</div>
            )}

            {!isLoadingEquipments && equipments.length === 0 && (
              <div className="px-4 py-6 text-center text-sm text-slate-500">
                No hay equipos disponibles para donación.
              </div>
            )}

            {!isLoadingEquipments &&
              equipments.map((equipment) => {
                const isSelected = String(form.equipmentId) === String(equipment.equipment_id)
                return (
                  <label
                    key={equipment.equipment_id}
                    className={`flex cursor-pointer items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 text-sm last:border-b-0 transition-colors ${
                      isSelected ? 'bg-indigo-50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="equipment"
                        checked={isSelected}
                        onChange={() => updateField('equipmentId', equipment.equipment_id)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-400"
                      />
                      <div>
                        <p className="font-medium text-slate-900">{equipment.serial_number}</p>
                        <p className="text-xs text-slate-600">{equipment.product_name || '—'}</p>
                        <p className="text-xs text-slate-500">
                          {equipment.product_code || equipment.model || '—'} · {equipment.life_cycle_status}
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                      Score {equipment.technical_evaluation?.reusability_score ?? '—'}
                    </span>
                  </label>
                )
              })}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Fecha de entrega</label>
            <input
              type="date"
              required
              value={form.deliveryDate}
              onChange={(event) => updateField('deliveryDate', event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Impacto estimado (beneficiarios)</label>
            <input
              type="number"
              min="0"
              required
              value={form.estimatedBeneficiariesImpact}
              onChange={(event) => updateField('estimatedBeneficiariesImpact', event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Referencia de acta / convenio</label>
          <input
            type="text"
            required
            maxLength={100}
            value={form.donationDeedRef}
            onChange={(event) => updateField('donationDeedRef', event.target.value)}
            placeholder="Ej. ACTA-DON-2026-0001"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100"
          />
        </div>

        {submitError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {submitError}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-indigo-200 transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Registrando...' : 'Confirmar asignación'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default AssignEquipmentModal
