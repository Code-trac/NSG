import { useMemo, useState } from "react"
import { format } from "date-fns"
import { buildMediaUrl } from "../api.js"
import { useAlerts } from "../hooks/useAlertsData.js"
import { useAppState } from "../state/AppContext.jsx"
import AlertModal from "./AlertModal.jsx"
import { clsx } from "clsx"

function ConfidenceBar({ value }) {
  const pct = Math.round((value ?? 0) * 100)
  return (
    <div className="w-full bg-white/10 rounded h-2 overflow-hidden" aria-label="Confidence">
      <div className="h-full bg-success" style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} />
    </div>
  )
}

function Snapshot({ src, alt }) {
  const [err, setErr] = useState(false)
  if (err || !src) {
    return (
      <div className="w-24 h-16 bg-black/50 rounded flex items-center justify-center border border-accent/40 text-accent">
        {/* alert icon */}
        <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="currentColor" d="M11 7h2v6h-2V7zm0 8h2v2h-2v-2z" />
          <path fill="currentColor" d="M1 21h22L12 2 1 21z" />
        </svg>
      </div>
    )
  }
  return (
    <img
      src={src || "/placeholder.svg"}
      alt={alt}
      className="w-24 h-16 object-cover rounded border border-white/10"
      onError={() => setErr(true)}
      loading="lazy"
    />
  )
}

export default function AlertsList() {
  const { filters, setFilters } = useAppState()
  const { alerts, isLoading } = useAlerts(100)
  const [open, setOpen] = useState(null)

  const filtered = useMemo(() => {
    return alerts
      .slice()
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .filter((a) => (filters.eventType === "all" ? true : a.event_type === filters.eventType))
      .filter((a) => (filters.severity === "all" ? true : a.severity === filters.severity))
      .filter((a) => (filters.zoneId === "all" ? true : a.zone_id === filters.zoneId))
      .filter((a) => {
        if (!filters.search?.trim()) return true
        const s = filters.search.trim().toLowerCase()
        return a.alert_id.toLowerCase().includes(s) || a.camera_id.toLowerCase().includes(s)
      })
  }, [alerts, filters])

  // Options
  const eventTypes = useMemo(() => Array.from(new Set(alerts.map((a) => a.event_type))), [alerts])
  const severities = ["low", "medium", "high"]
  const zones = useMemo(() => Array.from(new Set(alerts.map((a) => a.zone_id))), [alerts])

  return (
    <section className="card p-4">
      <div className="flex flex-col md:flex-row md:items-end gap-3 justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold">Alerts</h2>
          <p className="text-xs text-text-secondary">GET /alerts?limit=100 — polling every 3s</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search alert_id or camera_id"
            className="bg-black/40 border border-white/10 rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-accent col-span-2 md:col-span-2"
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
          />
          <select
            className="bg-black/40 border border-white/10 rounded px-3 py-2 text-sm"
            value={filters.eventType}
            onChange={(e) => setFilters((f) => ({ ...f, eventType: e.target.value }))}
          >
            <option value="all">{"All types"}</option>
            {eventTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <select
            className="bg-black/40 border border-white/10 rounded px-3 py-2 text-sm"
            value={filters.severity}
            onChange={(e) => setFilters((f) => ({ ...f, severity: e.target.value }))}
          >
            <option value="all">{"All severities"}</option>
            {severities.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            className="bg-black/40 border border-white/10 rounded px-3 py-2 text-sm"
            value={filters.zoneId}
            onChange={(e) => setFilters((f) => ({ ...f, zoneId: e.target.value }))}
          >
            <option value="all">{"All zones"}</option>
            {zones.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-3">
        {isLoading && <div className="text-sm text-text-secondary">{"Loading alerts..."}</div>}
        {!isLoading && filtered.length === 0 && (
          <div className="text-sm text-text-secondary">{"No alerts found for current filters"}</div>
        )}
        {filtered.map((a) => (
          <button
            key={a.alert_id}
            className="w-full text-left card p-3 grid grid-cols-[auto,1fr,auto] gap-3 hover:bg-white/5"
            onClick={() => setOpen(a)}
            aria-label={`Open alert ${a.alert_id}`}
          >
            <Snapshot src={buildMediaUrl(a.snapshot_path)} alt={`Snapshot for ${a.alert_id}`} />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-white font-medium">{a.event_type}</span>
                <span
                  className={clsx(
                    "text-xs px-2 py-0.5 rounded border",
                    a.severity === "high" && "border-accent text-accent",
                    a.severity === "medium" && "border-warning text-warning",
                    a.severity === "low" && "border-white/20 text-text-secondary",
                  )}
                >
                  {a.severity}
                </span>
                <span className="text-xs text-text-secondary">{format(new Date(a.timestamp), "PPpp")}</span>
              </div>
              <div className="text-xs text-text-secondary mt-1">
                {"Zone "}
                {a.zone_id}
                {" • Area "}
                {a.area_id}
                {" • Camera "}
                {a.camera_id}
                {" • Track "}
                {a.track_id}
              </div>
              <div className="mt-2">
                <ConfidenceBar value={a.confidence} />
              </div>
            </div>
            <div className="text-right text-xs text-text-secondary">
              <div className="opacity-80">{a.alert_id}</div>
            </div>
          </button>
        ))}
      </div>

      {open && <AlertModal alert={open} onClose={() => setOpen(null)} />}
    </section>
  )
}
