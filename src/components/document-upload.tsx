"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { DOCUMENT_TYPES } from "@/lib/constants";
import { Badge } from "@/components/badge";

type Doc = {
  id: string;
  fileName: string;
  fileUrl: string;
  docType: string;
  reviewStatus: string;
};

export function DocumentUpload({ documents }: { documents: Doc[] }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [docType, setDocType] = useState<(typeof DOCUMENT_TYPES)[number]>("id");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("Choose a file first");
      return;
    }
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("docType", docType);

    const res = await fetch("/api/documents", { method: "POST", body: formData });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(data.error ?? "Upload failed");
      setLoading(false);
      return;
    }

    if (fileRef.current) fileRef.current.value = "";
    setLoading(false);
    router.refresh();
  }

  return (
    <div>
      <ul className="space-y-2">
        {documents.map((doc) => (
          <li key={doc.id} className="flex items-center justify-between rounded-md border border-stone-200 bg-white px-3 py-2 text-sm">
            <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="text-teal-700 hover:underline">
              {doc.fileName}
            </a>
            <div className="flex items-center gap-2">
              <span className="text-xs capitalize text-stone-500">{doc.docType}</span>
              <Badge status={doc.reviewStatus} />
            </div>
          </li>
        ))}
        {documents.length === 0 && <p className="text-sm text-stone-500">No documents uploaded yet.</p>}
      </ul>

      <form onSubmit={handleUpload} className="mt-3 flex items-center gap-2">
        <select
          value={docType}
          onChange={(e) => setDocType(e.target.value as (typeof DOCUMENT_TYPES)[number])}
          className="rounded-md border border-stone-300 px-2 py-1.5 text-sm"
        >
          {DOCUMENT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <input ref={fileRef} type="file" accept=".pdf,.png,.jpg,.jpeg" className="text-sm" />
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-teal-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-teal-800 disabled:opacity-50"
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </form>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
