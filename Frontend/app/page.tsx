"use client"

import { useMemo } from "react"
import "../src/index.css"
import { createBrowserRouter, RouterProvider } from "react-router-dom"

import App from "../src/App"
import Dashboard from "../src/pages/Dashboard"
import FaceRecognition from "../src/pages/FaceRecognition"
import LicensePlates from "../src/pages/LicensePlates"
import AudioEvents from "../src/pages/AudioEvents"
import Watchlist from "../src/pages/Watchlist"

import { AppProvider } from "../src/state/AppContext"
import { ToastProvider } from "../src/components/Toast"

export default function Page() {
  const router = useMemo(
    () =>
      createBrowserRouter([
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
      ]),
    [],
  )

  return (
    <ToastProvider>
      <AppProvider>
        <RouterProvider router={router} />
      </AppProvider>
    </ToastProvider>
  )
}
