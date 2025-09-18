"use client";
import { useState } from "react";

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
      console.log("Backend response:", res);
      if (res.ok) {
        const data = await res.json();
        console.log("Backend response:", data);

        if (data?.success) {
          setUploaded(true);
          onUploadComplete();
        } else {
          setError("Upload failed. Please try again.");
        }
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
    <div className="p-4 border rounded relative max-w-md mx-auto mt-6">
      <h1 className="text-2xl font-bold text-center text-blue-700 mb-4">
        LawBandit QA ChatBot
      </h1>

      <form onSubmit={handleUpload} className="flex flex-col items-center">
        <input
          type="file"
          name="files"
          multiple
          accept="application/pdf"
          className={`mb-2 w-full ${error ? "border border-red-500" : ""}`}
          disabled={loading}
        />
        <button
          type="submit"
          className={`w-full px-4 py-2 rounded text-white ${loading ? "bg-gray-400" : "bg-blue-600"}`}
          disabled={loading}
        >
          {loading ? "Uploading..." : "Upload PDFs"}
        </button>
        {error && <p className="text-red-600 mt-2 font-medium">{error}</p>}
      </form>

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
}
