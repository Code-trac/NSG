import { useAppState } from "../state/AppContext.jsx"
import { getBaseUrl } from "../api.js"

export default function Topbar() {
  const { demo, setDemo, offline, setSidebarOpen } = useAppState()

  return (
    <header className="sticky top-0 z-20 bg-bg/80 backdrop-blur border-b border-white/10">
      <div className="flex items-center justify-between px-4 md:px-6 py-3">
        <div className="flex items-center gap-3">
          <button
            className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-md border border-white/10 hover:bg-white/5"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <span className="block w-5 h-0.5 bg-white mb-1"></span>
            <span className="block w-5 h-0.5 bg-white mb-1"></span>
            <span className="block w-5 h-0.5 bg-white"></span>
          </button>
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${offline ? "bg-accent" : "bg-success"}`} aria-hidden="true"></span>
            <span className="text-sm text-text-secondary">
              Backend: {offline ? "Offline — retrying" : "Online"} ({getBaseUrl()})
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="accent-[var(--accent)]"
              checked={demo}
              onChange={(e) => setDemo(e.target.checked)}
              aria-label="Toggle Demo Mode"
            />
            <span>Demo Mode</span>
          </label>
        </div>
      </div>
      {offline && (
        <div
          className="bg-accent/20 border-t border-accent/50 text-white text-sm px-4 md:px-6 py-2"
          role="status"
          aria-live="polite"
        >
          Backend Offline — retrying. Falling back to demo data.
        </div>
      )}
    </header>
  )
}
