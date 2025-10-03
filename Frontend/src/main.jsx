import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import "./index.css"
import App from "./App.jsx"
import Dashboard from "./pages/Dashboard.jsx"
import FaceRecognition from "./pages/FaceRecognition.jsx"
import LicensePlates from "./pages/LicensePlates.jsx"
import AudioEvents from "./pages/AudioEvents.jsx"
import Watchlist from "./pages/Watchlist.jsx"
import { AppProvider } from "./state/AppContext.jsx"
import { ToastProvider } from "./components/Toast.jsx"

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "faces", element: <FaceRecognition /> },
      { path: "plates", element: <LicensePlates /> },
      { path: "audio", element: <AudioEvents /> },
      { path: "watchlist", element: <Watchlist /> },
    ],
  },
])

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ToastProvider>
      <AppProvider>
        <RouterProvider router={router} />
      </AppProvider>
    </ToastProvider>
  </StrictMode>,
)
