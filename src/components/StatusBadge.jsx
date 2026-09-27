const DEFAULT_STYLE = 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200'

export const ENTITY_VERIFICATION_STYLES = {
  PENDING: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200',
  VERIFIED: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200',
  REJECTED: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-200',
}

export const REQUEST_STATUS_STYLES = {
  ON_HOLD: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200',
  APPROVED: 'bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200',
  REJECTED: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-200',
  DELIVERED: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200',
}

function StatusBadge({ status, styles = {} }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        styles[status] || DEFAULT_STYLE
      }`}
    >
      {status || '—'}
    </span>
  )
}

export default StatusBadge
