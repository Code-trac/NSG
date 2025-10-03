import audio from "../mock/mock_audio.json"

export default function AudioEvents() {
  return (
    <section className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Audio Events (mock)</h2>
        <div className="text-xs text-text-secondary">Served from mock_audio.json</div>
      </div>
      <ul className="grid gap-2">
        {audio.items.slice(0, 5).map((e) => (
          <li key={e.id} className="flex items-center justify-between p-3 rounded border border-white/10 bg-black/30">
            <div className="text-white">{e.type}</div>
            <div className="text-xs text-text-secondary">{new Date(e.timestamp).toLocaleString()}</div>
          </li>
        ))}
      </ul>
    </section>
  )
}
