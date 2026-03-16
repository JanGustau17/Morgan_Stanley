"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { FolderOpen, Loader2, Trash2 } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";

interface BucketInfo {
  id: string;
  name: string;
  public: boolean;
}

interface FileInfo {
  name: string;
  id: string;
  updated_at: string;
  created_at: string;
  metadata: Record<string, unknown>;
}

export function StorageList() {
  const [buckets, setBuckets] = useState<BucketInfo[]>([]);
  const [selectedBucket, setSelectedBucket] = useState<string | null>(null);
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filesLoading, setFilesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/admin/storage");
        if (!res.ok) throw new Error("Failed to load buckets");
        const data = await res.json();
        setBuckets(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error");
        setBuckets([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedBucket) {
      setFiles([]);
      return;
    }
    setFilesLoading(true);
    fetch(`/api/admin/storage?bucket=${encodeURIComponent(selectedBucket)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load files");
        return res.json();
      })
      .then((data) => {
        setFiles(Array.isArray(data) ? data : []);
      })
      .catch(() => setFiles([]))
      .finally(() => setFilesLoading(false));
  }, [selectedBucket]);

  async function deleteFile(bucket: string, path: string) {
    if (!confirm(`Delete ${path}?`)) return;
    setDeleting(path);
    try {
      const res = await fetch("/api/admin/storage", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bucket, path }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? "Delete failed");
      }
      setFiles((prev) => prev.filter((f) => f.name !== path));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Buckets</h2>
          <p className="text-sm text-gray-500">
            Supabase Storage: flyer-photos, avatars, campaign-images
          </p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading…
            </div>
          ) : error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {buckets.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setSelectedBucket(b.id)}
                  className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                    selectedBucket === b.id
                      ? "border-green-500 bg-green-50 text-green-800"
                      : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <FolderOpen className="h-4 w-4" />
                  {b.name}
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedBucket && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">
              Files in {selectedBucket}
            </h2>
          </CardHeader>
          <CardContent>
            {filesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : files.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-500">
                No files in this bucket (or list is empty at root)
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-6 py-3 font-medium text-gray-600">Name</th>
                      <th className="px-6 py-3 font-medium text-gray-600">Updated</th>
                      <th className="px-6 py-3 font-medium text-gray-600 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {files.map((f) => (
                      <tr key={f.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">{f.name}</td>
                        <td className="px-6 py-4 text-gray-600">
                          {f.updated_at ? format(new Date(f.updated_at), "MMM d, yyyy HH:mm") : "—"}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => deleteFile(selectedBucket, f.name)}
                            disabled={deleting === f.name}
                            className="text-red-600 hover:text-red-800 disabled:opacity-50"
                          >
                            {deleting === f.name ? "Deleting…" : <Trash2 className="inline h-4 w-4" />}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
