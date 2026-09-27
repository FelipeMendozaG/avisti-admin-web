import Modal from './Modal.jsx'

const TONE_STYLES = {
  default: 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-200',
  danger: 'bg-red-600 hover:bg-red-500 shadow-red-200',
  success: 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-200',
}

function ConfirmDialog({ title, message, tone = 'default', isSubmitting, onConfirm, onCancel, confirmLabel = 'Confirmar' }) {
  return (
    <Modal title={title} onClose={onCancel} maxWidth="max-w-md">
      <p className="text-sm text-slate-600">{message}</p>

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isSubmitting}
          className={`rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors disabled:opacity-60 ${
            TONE_STYLES[tone] || TONE_STYLES.default
          }`}
        >
          {isSubmitting ? 'Procesando...' : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}

export default ConfirmDialog
