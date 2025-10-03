const BASE = (import.meta.env.VITE_BACKEND || import.meta.env.REACT_APP_BACKEND || "http://localhost:8000").replace(
  /\/+$/,
  "",
) // trim trailing slash

export function getBaseUrl() {
  return BASE
}

async function handleJson(res) {
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(text || `HTTP ${res.status}`)
  }
  return res.json()
}

export async function fetchHealth() {
  const res = await fetch(`${BASE}/health`, { cache: "no-store" })
  return handleJson(res)
}

export async function fetchAlerts(limit = 100) {
  const url = `${BASE}/alerts?limit=${encodeURIComponent(limit)}`
  const res = await fetch(url, { cache: "no-store" })
  return handleJson(res)
}

export async function postOverride({ alert_id, action }) {
  const res = await fetch(`${BASE}/override`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ alert_id, action }),
  })
  return handleJson(res)
}

export async function uploadVideo(file) {
  const form = new FormData()
  form.append("file", file)
  const res = await fetch(`${BASE}/upload-video`, {
    method: "POST",
    body: form,
  })
  return handleJson(res)
}

export function buildMediaUrl(path) {
  if (!path) return ""
  const clean = path.replace(/^\/+/, "")
  return `${BASE}/${clean}`
}
