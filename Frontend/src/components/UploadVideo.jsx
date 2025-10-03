import { useRef, useState } from "react"
import { uploadVideo } from "../api.js"
import { useToast } from "./Toast.jsx"

export default function UploadVideo({ onUploaded }) {
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const { push } = useToast()
  const inputRef = useRef(null)

  function onSelectFile(e) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setPreviewUrl(URL.createObjectURL(f))
  }

  async function onUpload() {
    if (!file) return
    setLoading(true)
    try {
      await uploadVideo(file)
      push("Upload queued for processing.", "success")
      onUploaded?.()
      setFile(null)
      setPreviewUrl("")
      inputRef.current?.value && (inputRef.current.value = "")
    } catch (e) {
      push(`Upload failed: ${e.message}`, "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Upload Video</h2>
        <div className="text-xs text-text-secondary">POST /upload-video</div>
      </div>
      <div className="flex flex-col md:flex-row items-start gap-4">
        <div className="flex-1">
          <input
            ref={inputRef}
            type="file"
            accept="video/*"
            onChange={onSelectFile}
            className="w-full text-sm file:bg-accent file:text-white file:border-0 file:px-3 file:py-2 file:rounded-md file:mr-3"
          />
          <button
            onClick={onUpload}
            disabled={!file || loading}
            className="mt-3 inline-flex items-center gap-2 bg-accent hover:bg-[#cf2f3c] text-white px-4 py-2 rounded-md disabled:opacity-50"
          >
            {loading ? "Uploading..." : "Upload"}
          </button>
        </div>
        <div className="w-full md:w-56">
          <div className="text-xs text-text-secondary mb-2">Preview</div>
          <div className="aspect-video bg-black/40 rounded-md overflow-hidden border border-white/10 flex items-center justify-center">
            {previewUrl ? (
              <video src={previewUrl} className="w-full h-full object-cover" controls />
            ) : (
              <span className="text-text-secondary text-sm">{"No file selected"}</span>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
