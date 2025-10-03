import useSWR from "swr"
import mockAlerts from "../mock/mock_alerts.json"
import { fetchAlerts } from "../api.js"
import { isToday } from "date-fns"
import { useAppState } from "../state/AppContext.jsx"

export function useAlerts(limit = 100) {
  const { demo, offline } = useAppState()

  const isDemo = demo || offline
  const { data, error, isLoading } = useSWR(isDemo ? null : ["alerts", limit], () => fetchAlerts(limit), {
    refreshInterval: isDemo ? 0 : 3000,
    revalidateOnFocus: false,
    shouldRetryOnError: true,
  })

  // Handle both response formats: {alerts: [...]} or [...]
  const alerts = isDemo ? mockAlerts.alerts : (data?.alerts || data || [])
  return { alerts, error, isLoading, isDemo }
}

export function useAlertsStats() {
  const { alerts } = useAlerts(100)
  const cameras = new Set(alerts.map((a) => a.camera_id))
  const alertsToday = alerts.filter((a) => isToday(new Date(a.timestamp))).length
  return {
    activeCameras: cameras.size,
    alertsToday,
  }
}
