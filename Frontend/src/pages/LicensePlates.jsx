import plates from "../mock/mock_plates.json"

export default function LicensePlates() {
  return (
    <section className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">License Plates (mock)</h2>
        <div className="text-xs text-text-secondary">Served from mock_plates.json</div>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {plates.items.map((p) => (
          <div key={p.id} className="card p-3">
            <div className="text-white font-medium">{p.plate}</div>
            <div className="text-xs text-text-secondary">
              {p.vehicle} • {p.color}
            </div>
            <div className="text-xs text-text-secondary">{new Date(p.timestamp).toLocaleString()}</div>
            <div className="mt-2 aspect-video overflow-hidden rounded border border-white/10">
              <img
                src={p.image || "/placeholder.svg"}
                alt={`Vehicle ${p.plate}`}
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
