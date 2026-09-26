import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  Boxes,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  UploadCloud,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

const navItems = [
  { to: '/products', label: 'Productos', icon: Boxes },
  { to: '/equipments', label: 'Equipos', icon: LayoutDashboard },
  { to: '/import', label: 'Importar datos', icon: UploadCloud },
  { to: '/data-loads', label: 'Cargas y logs', icon: ClipboardList },
]

const pageTitles = {
  '/products': 'Productos',
  '/equipments': 'Equipos',
  '/import': 'Importar datos',
  '/data-loads': 'Cargas y logs',
}

function Layout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const currentTitle = pageTitles[location.pathname] || 'Dashboard'

  return (
    <div className="flex min-h-screen w-full overflow-hidden bg-slate-100 text-slate-800">
      <aside className="flex h-screen w-72 shrink-0 flex-col border-r border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-200">
            <Boxes size={20} />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-600">Avistidata</p>
            <h1 className="text-lg font-semibold text-slate-900">Chepita Admin</h1>
          </div>
        </div>

        <div className="px-4 pb-2 pt-5">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            Navegación
          </p>
        </div>

        <nav className="flex-1 space-y-2 px-3 py-2">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'border-indigo-200 bg-indigo-50 text-indigo-700 shadow-sm'
                    : 'border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                  location.pathname === to
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                }`}
              >
                <Icon size={16} />
              </span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-200 px-4 py-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
                <ShieldCheck size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-800">Usuario conectado</p>
                <p className="truncate text-xs text-slate-500">{user || 'Sin usuario'}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              <LogOut size={16} />
              Cerrar sesión
            </button>
          </div>
        </div>
      </aside>

      <main className="flex h-screen w-full flex-1 flex-col overflow-y-auto bg-slate-50">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
          <div className="flex w-full items-center justify-between px-6 py-4">
            <div>
              <nav className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">
                Dashboard / <span className="text-slate-500">{currentTitle}</span>
              </nav>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{currentTitle}</h2>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              Sistema activo
            </div>
          </div>
        </header>

        <div className="w-full flex-1 px-6 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default Layout
