import { createContext, useCallback, useContext, useMemo, useState } from "react"
import { createPortal } from "react-dom"
import { clsx } from "clsx"

const ToastCtx = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const push = useCallback((msg, variant = "default", timeout = 3000) => {
    const id = crypto.randomUUID()
    setToasts((t) => [...t, { id, msg, variant }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), timeout)
  }, [])

  const value = useMemo(() => ({ push }), [push])

  return (
    <ToastCtx.Provider value={value}>
      {children}
      {createPortal(
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={clsx(
                "card px-4 py-3 text-sm min-w-[220px] border",
                t.variant === "success" && "border-success text-text-primary",
                t.variant === "error" && "border-accent text-text-primary",
                t.variant === "default" && "border-white/10 text-text-primary",
              )}
              role="status"
              aria-live="polite"
            >
              {t.msg}
            </div>
          ))}
        </div>,
        document.body,
      )}
    </ToastCtx.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastCtx)
  if (!ctx) throw new Error("useToast must be used within ToastProvider")
  return ctx
}
