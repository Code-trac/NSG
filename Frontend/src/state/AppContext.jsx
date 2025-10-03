import { createContext, useContext, useEffect, useMemo, useState } from "react"
import useSWR from "swr"
import { fetchHealth } from "../api.js"

const AppCtx = createContext(null)

const defaultFilters = {
  eventType: "all",
  severity: "all",
  zoneId: "all",
  search: "",
}

const LS_KEYS = {
  demo: "demo-mode",
  filters: "filters",
}

export function AppProvider({ children }) {
  const [demo, setDemo] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(LS_KEYS.demo) || "false")
    } catch {
      return false
    }
  })
  const [filters, setFilters] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(LS_KEYS.filters) || JSON.stringify(defaultFilters))
    } catch {
      return defaultFilters
    }
  })
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem(LS_KEYS.demo, JSON.stringify(demo))
  }, [demo])

  useEffect(() => {
    localStorage.setItem(LS_KEYS.filters, JSON.stringify(filters))
  }, [filters])

  // Health polling
  const { data, error } = useSWR("health", fetchHealth, {
    refreshInterval: 5000,
    shouldRetryOnError: true,
  })

  const offline = !!error

  const value = useMemo(
    () => ({
      demo,
      setDemo,
      filters,
      setFilters,
      sidebarOpen,
      setSidebarOpen,
      offline,
      health: data ?? null,
    }),
    [demo, filters, sidebarOpen, offline, data],
  )

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>
}

export function useAppState() {
  const ctx = useContext(AppCtx)
  if (!ctx) throw new Error("useAppState must be used within AppProvider")
  return ctx
}
