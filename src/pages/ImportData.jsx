import { useState } from 'react'
import { CheckCircle2, FileJson, FileSpreadsheet, FileText, UploadCloud } from 'lucide-react'
import { importCsv, importExcel, importJson } from '../services/importService.js'
import { extractErrorMessage } from '../utils/errorUtils.js'

const TABS = [
  { id: 'excel', label: 'Excel', icon: FileSpreadsheet },
  { id: 'csv', label: 'CSV', icon: FileText },
  { id: 'json', label: 'JSON', icon: FileJson },
]

function ResultBanner({ result }) {
  if (!result) return null
  const isSuccess = result.type === 'success'
  return (
    <div
      className={`mt-4 flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${
        isSuccess
          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
          : 'border-red-200 bg-red-50 text-red-700'
      }`}
    >
      {isSuccess ? <CheckCircle2 size={16} /> : <FileText size={16} />}
      <span>{result.message}</span>
    </div>
  )
}

function FileDropzone({ accept, label, onFileSelect, selectedName }) {
  return (
    <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center transition-colors hover:border-indigo-300 hover:bg-indigo-50/40">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
        <UploadCloud size={24} />
      </div>
      <span className="text-base font-semibold text-slate-800">{label}</span>
      <span className="mt-1 text-sm text-slate-500">Arrastra tu archivo aquí o explora tus archivos</span>
      <span className="mt-3 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
        {accept}
      </span>
      <input
        type="file"
        accept={accept}
        onChange={(event) => onFileSelect(event.target.files?.[0] || null)}
        className="hidden"
      />
      {selectedName && (
        <span className="mt-4 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
          {selectedName}
        </span>
      )}
    </label>
  )
}

function ExcelForm() {
  const [file, setFile] = useState(null)
  const [dataSource, setDataSource] = useState('AVISTI_IMPORTER')
  const [loadedBy, setLoadedBy] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState(null)

  async function handleSubmit(event) {
    event.preventDefault()
    if (!file) {
      setResult({ type: 'error', message: 'Selecciona un archivo .xlsx' })
      return
    }
    setIsSubmitting(true)
    setResult(null)
    try {
      const response = await importExcel(file, dataSource, loadedBy)
      setResult({ type: 'success', message: response.data?.message || 'Archivo procesado correctamente' })
    } catch (err) {
      setResult({ type: 'error', message: extractErrorMessage(err, 'No se pudo importar el archivo') })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <FileDropzone
        accept=".xlsx"
        label="Carga de archivo Excel"
        selectedName={file?.name}
        onFileSelect={setFile}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Data source</label>
          <input
            type="text"
            required
            value={dataSource}
            onChange={(event) => setDataSource(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Loaded by</label>
          <input
            type="text"
            required
            value={loadedBy}
            onChange={(event) => setLoadedBy(event.target.value)}
            placeholder="usuario@correo.com"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-200 transition-colors hover:bg-indigo-500 disabled:opacity-60"
      >
        {isSubmitting ? 'Subiendo...' : 'Importar Excel'}
      </button>

      <ResultBanner result={result} />
    </form>
  )
}

function CsvForm() {
  const [file, setFile] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState(null)

  async function handleSubmit(event) {
    event.preventDefault()
    if (!file) {
      setResult({ type: 'error', message: 'Selecciona un archivo .csv' })
      return
    }
    setIsSubmitting(true)
    setResult(null)
    try {
      const response = await importCsv(file)
      setResult({ type: 'success', message: response.data?.message || 'Archivo procesado correctamente' })
    } catch (err) {
      setResult({ type: 'error', message: extractErrorMessage(err, 'No se pudo importar el archivo') })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <FileDropzone
        accept=".csv"
        label="Carga de archivo CSV"
        selectedName={file?.name}
        onFileSelect={setFile}
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-200 transition-colors hover:bg-indigo-500 disabled:opacity-60"
      >
        {isSubmitting ? 'Subiendo...' : 'Importar CSV'}
      </button>

      <ResultBanner result={result} />
    </form>
  )
}

function JsonForm() {
  const [rawJson, setRawJson] = useState(`[
  {
    "documento": "12345678",
    "nombre": "Juan Perez",
    "monto": 150.5
  }
]`)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState(null)

  async function handleSubmit(event) {
    event.preventDefault()
    let payload
    try {
      payload = JSON.parse(rawJson)
    } catch {
      setResult({ type: 'error', message: 'El texto no es un JSON válido' })
      return
    }
    setIsSubmitting(true)
    setResult(null)
    try {
      const response = await importJson(payload)
      setResult({ type: 'success', message: response.data?.message || 'Datos procesados correctamente' })
    } catch (err) {
      setResult({ type: 'error', message: extractErrorMessage(err, 'No se pudo importar el JSON') })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-slate-900 p-3 shadow-sm">
        <div className="mb-3 flex items-center justify-between border-b border-slate-700 pb-2">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
            <FileJson size={14} />
            JSON payload
          </div>
          <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-300">
            válido
          </span>
        </div>

        <textarea
          rows={12}
          value={rawJson}
          onChange={(event) => setRawJson(event.target.value)}
          className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 font-mono text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-200 transition-colors hover:bg-indigo-500 disabled:opacity-60"
      >
        {isSubmitting ? 'Enviando...' : 'Importar JSON'}
      </button>

      <ResultBanner result={result} />
    </form>
  )
}

function ImportData() {
  const [activeTab, setActiveTab] = useState('excel')

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-indigo-600">Integración y carga de datos</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Importar datos</h2>
          </div>
        </div>

        <div className="mt-6 inline-flex w-full max-w-xl rounded-xl border border-slate-200 bg-slate-100 p-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
                activeTab === id
                  ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {activeTab === 'excel' && <ExcelForm />}
        {activeTab === 'csv' && <CsvForm />}
        {activeTab === 'json' && <JsonForm />}
      </div>
    </div>
  )
}

export default ImportData
