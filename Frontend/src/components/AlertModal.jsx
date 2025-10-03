import { useEffect, useMemo, useRef, Suspense } from "react"
import { buildMediaUrl, postOverride } from "../api.js"
import { useToast } from "./Toast.jsx"

const VideoPlayer = (() => {
  // lazy load
  return (props) => {
    // simple HTML5 video wrapper
    return <video className="w-full h-full object-contain bg-black" controls preload="metadata" {...props} />
  }
})()

export default function AlertModal({ alert, onClose }) {
  const { push } = useToast()
  const overlayRef = useRef(null)
  const closeBtnRef = useRef(null)

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose?.()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [onClose])

  useEffect(() => {
    // focus close
    closeBtnRef.current?.focus()
  }, [])

  async function handleOverride(action) {
    try {
      await postOverride({ alert_id: alert.alert_id, action })
      push(`Override ${action} sent`, "success")
      onClose?.()
    } catch (e) {
      push(`Override failed: ${e.message}`, "error")
    }
  }

  const metaJson = useMemo(() => JSON.stringify(alert.meta ?? {}, null, 2), [alert.meta])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/60"
        onClick={(e) => {
          if (e.target === overlayRef.current) onClose?.()
        }}
      />
      <div className="relative z-10 w-[95vw] md:w-[900px] max-h-[90vh] card p-0 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold">{alert.event_type}</span>
            <span className="text-xs text-text-secondary">{alert.alert_id}</span>
          </div>
          <button
            ref={closeBtnRef}
            onClick={onClose}
            className="rounded-md border border-white/10 px-2 py-1 text-sm hover:bg-white/5"
          >
            Close <kbd>Esc</kbd>
          </button>
        </div>
        <div className="grid md:grid-cols-2 gap-0">
          <div className="p-3 space-y-3 border-r border-white/10">
            <div className="aspect-video bg-black/50 rounded overflow-hidden border border-white/10">
              <img
                src={buildMediaUrl(alert.snapshot_path) || "/placeholder.svg"}
                alt={`Snapshot ${alert.alert_id}`}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="aspect-video bg-black rounded overflow-hidden border border-white/10">
              <Suspense
                fallback={
                  <div className="w-full h-full flex items-center justify-center text-text-secondary text-sm">
                    {"Loading player..."}
                  </div>
                }
              >
                <VideoPlayer src={buildMediaUrl(alert.clip_path)} />
              </Suspense>
            </div>
          </div>
          <div className="p-3 flex flex-col">
            <div className="text-sm text-text-secondary">
              {"Zone "}
              {alert.zone_id}
              {" • Area "}
              {alert.area_id}
              {" • Camera "}
              {alert.camera_id}
            </div>
            <div className="mt-3">
              <div className="text-xs text-text-secondary mb-1">Metadata</div>
              <pre className="bg-black/40 p-3 rounded border border-white/10 overflow-auto text-xs max-h-64">
                {metaJson}
              </pre>
            </div>
            <div className="mt-auto pt-3 flex items-center gap-2">
              <button
                onClick={() => handleOverride("accept")}
                className="bg-success hover:brightness-110 text-white px-3 py-2 rounded-md"
              >
                Accept
              </button>
              <button
                onClick={() => handleOverride("reject")}
                className="bg-accent hover:bg-[#cf2f3c] text-white px-3 py-2 rounded-md"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
