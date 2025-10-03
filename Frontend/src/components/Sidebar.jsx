import { NavLink } from "react-router-dom"
import { useAppState } from "../state/AppContext.jsx"
import { useAlertsStats } from "../hooks/useAlertsData.js"

function NavItem({ to, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-2 rounded-md hover:bg-white/5 ${isActive ? "bg-white/10 text-white" : "text-text-secondary"}`
      }
    >
      <span className="w-2 h-2 rounded-full bg-accent" aria-hidden="true" />
      <span className="text-sm">{label}</span>
    </NavLink>
  )
}

export default function Sidebar() {
  const { sidebarOpen, setSidebarOpen } = useAppState()
  const stats = useAlertsStats()

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 z-30 bg-black/50 md:hidden ${sidebarOpen ? "block" : "hidden"}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden={!sidebarOpen}
      />

      <aside
        className={`fixed z-40 inset-y-0 left-0 w-64 bg-panel border-r border-white/10 shadow-soft flex flex-col transition-transform duration-200 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
        aria-label="Sidebar"
      >
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-accent" aria-hidden="true" />
            <h1 className="text-lg font-semibold text-white">Surveillance</h1>
          </div>
        </div>

        <nav className="p-3 flex-1 flex flex-col gap-1">
          <NavItem to="/" label="Dashboard" />
          <NavItem to="/faces" label="Face Recognition (mock)" />
          <NavItem to="/plates" label="License Plates (mock)" />
          <NavItem to="/audio" label="Audio Events (mock)" />
          <NavItem to="/watchlist" label="Watchlist (mock)" />
        </nav>

        <div className="p-3 border-t border-white/10 text-text-secondary text-xs">
          <div className="mb-2">Stats</div>
          <div className="grid grid-cols-2 gap-2">
            <div className="card p-3">
              <div className="text-[11px] text-text-secondary">Active Cameras</div>
              <div className="text-white text-lg">{stats.activeCameras}</div>
            </div>
            <div className="card p-3">
              <div className="text-[11px] text-text-secondary">Alerts Today</div>
              <div className="text-white text-lg">{stats.alertsToday}</div>
            </div>
            <div className="card p-3 col-span-2">
              <div className="text-[11px] text-text-secondary">Storage Used</div>
              <div className="text-white text-lg">1.2 TB</div>
            </div>
          </div>
          <div className="sr-only" aria-live="polite">
            Sidebar stats updated as alerts change
          </div>
        </div>
      </aside>
    </>
  )
}
