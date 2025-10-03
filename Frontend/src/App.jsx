import { Outlet } from "react-router-dom"
import Sidebar from "./components/Sidebar.jsx"
import Topbar from "./components/Topbar.jsx"
import { useAppState } from "./state/AppContext.jsx"

export default function App() {
  const { sidebarOpen } = useAppState()
  return (
    <div className="min-h-screen bg-bg text-text-primary">
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Topbar />
          <main
            className={`flex-1 overflow-y-auto p-4 md:p-6 bg-[var(--bg)] ${sidebarOpen ? "md:ml-64" : "md:ml-64"}`}
            aria-label="Main content"
          >
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
