"use client";
import { useState } from "react";
import "./FileUpload.css";

export default function FileUpload({ onUploadComplete }: { onUploadComplete: () => void }) {
  const [loading, setLoading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [error, setError] = useState("");

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const files = formData.getAll("files");
    if (!files || files.length === 0 || !(files[0] instanceof File) || (files[0] as File).size === 0) {
      setError("⚠️ You haven't uploaded any file. Please upload at least one PDF to proceed.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (res.ok && data?.success) {
        setUploaded(true);
        onUploadComplete();
      } else {
        setError("Upload failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (uploaded) return null;

  return (
    <div className="upload-container">
      <div className="upload-card">
        <h1>LawBandit QA ChatBot</h1>
        <form onSubmit={handleUpload} className="upload-form">
          <input type="file" name="files" multiple accept="application/pdf" disabled={loading} />
          <button type="submit" disabled={loading}>
            {loading ? "Uploading..." : "Upload PDFs"}
          </button>
          {error && <p className="error">{error}</p>}
        </form>

        {loading && <div className="loading-overlay"><div className="spinner"></div></div>}
      </div>
    </div>
  );
}
