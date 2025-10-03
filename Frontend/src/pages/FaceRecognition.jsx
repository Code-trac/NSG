import faces from "../mock/mock_faces.json"

export default function FaceRecognition() {
  return (
    <section className="grid gap-4">
      <div className="card p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Face Recognition (mock)</h2>
          <div className="text-xs text-text-secondary">Served from mock_faces.json</div>
        </div>
        <div className="mt-3">
          <input
            type="text"
            placeholder="Search watchlist"
            className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {faces.items.map((f) => (
          <div key={f.id} className="card p-2">
            <div className="aspect-square overflow-hidden rounded border border-white/10">
              <img
                src={f.image || "/placeholder.svg"}
                alt={`Detected face ${f.name}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="mt-2 text-sm text-white">{f.name}</div>
            <div className="text-xs text-text-secondary">{`Match: ${(f.match * 100).toFixed(1)}%`}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
