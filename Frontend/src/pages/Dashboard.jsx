import UploadVideo from "../components/UploadVideo.jsx"
import ZoneSummary from "../components/ZoneSummary.jsx"
import AlertsList from "../components/AlertsList.jsx"

export default function Dashboard() {
  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <UploadVideo />
        </div>
        <div className="lg:col-span-1">
          <ZoneSummary />
        </div>
      </div>
      <AlertsList />
    </div>
  )
}
