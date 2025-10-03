import { useMemo } from "react"
import { useAlerts } from "../hooks/useAlertsData.js"
import { useAppState } from "../state/AppContext.jsx"

export default function ZoneSummary() {
  const { alerts } = useAlerts(100)
  const { filters, setFilters } = useAppState()

  const counts = useMemo(() => {
    const map = new Map()
    for (const a of alerts) {
      map.set(a.zone_id, (map.get(a.zone_id) || 0) + 1)
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1])
  }, [alerts])

  const max = counts[0]?.[1] ?? 1

  return (
    <section className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Zone Summary</h2>
        <div className="text-xs text-text-secondary">Click a zone to filter</div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {counts.map(([zone, count]) => {
          const intensity = Math.max(0.15, count / max) // 0.15..1
          const active = filters.zoneId === zone
          return (
            <button
              key={zone}
              onClick={() => setFilters((f) => ({ ...f, zoneId: active ? "all" : zone }))}
              className={`rounded-lg p-3 text-left border ${active ? "border-accent" : "border-white/10"} bg-[rgb(230,57,70,0.08)] hover:bg-[rgb(230,57,70,0.15)]`}
              aria-pressed={active}
            >
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-white">{zone}</div>
                <div className="text-xs text-text-secondary">{count}</div>
              </div>
              <div className="mt-2 h-2 bg-white/10 rounded overflow-hidden">
                <div
                  className="h-full bg-accent"
                  style={{ width: `${Math.round((count / max) * 100)}%`, opacity: intensity }}
                />
              </div>
            </button>
          )
        })}
        {counts.length === 0 && <div className="text-sm text-text-secondary col-span-full">{"No zones available"}</div>}
      </div>
    </section>
  )
}
