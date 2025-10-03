import watchlist from "../mock/mock_watchlist.json"

export default function Watchlist() {
  return (
    <section className="grid gap-4">
      <div className="card p-4">
        <h2 className="text-lg font-semibold">Watchlist Alerts (mock)</h2>
        <div className="text-xs text-text-secondary">Served from mock_watchlist.json</div>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {watchlist.items.map((w) => (
          <div key={w.id} className="card p-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent" aria-hidden="true"></div>
              <div className="text-white font-medium">{w.title}</div>
            </div>
            <div className="mt-1 text-xs text-text-secondary">{`Confidence: ${(w.confidence * 100).toFixed(1)}%`}</div>
            <div className="mt-2 aspect-video overflow-hidden rounded border border-white/10">
              <img
                src={w.image || "/placeholder.svg"}
                alt={`Watchlist ${w.title}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
