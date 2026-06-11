import React, { useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  UploadCloud, Image as ImageIcon, Copy, Trash2, Check, X,
  FileImage, Search, RefreshCw, Folder,
} from "lucide-react";

function fmtSize(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

function fmtDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString([], { year: "numeric", month: "short", day: "2-digit" });
  } catch { return ""; }
}

async function fetchFiles() {
  const { data } = await api.get("/admin/files");
  return data || [];
}

export default function FileManager() {
  const qc = useQueryClient();
  const { data: files = [], isFetching: loading, refetch } = useQuery({
    queryKey: ["admin-files"],
    queryFn: fetchFiles,
    staleTime: 10_000,
  });
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const inputRef = useRef(null);

  const backendBase = process.env.REACT_APP_BACKEND_URL || "";

  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-files"] });

  const uploadFiles = async (fileList) => {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    let success = 0, failed = 0;
    for (const f of Array.from(fileList)) {
      try {
        const fd = new FormData();
        fd.append("file", f);
        await api.post("/admin/files/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
        success++;
      } catch (e) {
        failed++;
        toast.error(`Upload failed: ${f.name}`, { description: e.response?.data?.detail || e.message });
      }
    }
    setUploading(false);
    if (success) toast.success(`Uploaded ${success} file${success > 1 ? "s" : ""}`);
    if (failed) toast.error(`${failed} upload${failed > 1 ? "s" : ""} failed`);
    refresh();
  };

  const onPick = (e) => uploadFiles(e.target.files);

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    uploadFiles(e.dataTransfer.files);
  };

  const fullUrl = (f) => `${backendBase}${f.url}`;

  const copyUrl = async (f) => {
    try {
      await navigator.clipboard.writeText(fullUrl(f));
      setCopiedId(f.id);
      setTimeout(() => setCopiedId(null), 1500);
      toast.success("URL copied to clipboard");
    } catch {
      toast.error("Copy failed");
    }
  };

  const remove = async (f) => {
    if (!window.confirm(`Delete "${f.original_filename}"?`)) return;
    try {
      await api.delete(`/admin/files/${f.id}`);
      toast.success("File deleted");
      refresh();
    } catch (e) {
      toast.error("Delete failed", { description: e.response?.data?.detail || e.message });
    }
  };

  const filtered = files.filter((f) =>
    f.original_filename?.toLowerCase().includes(search.toLowerCase())
  );

  const totalSize = files.reduce((s, f) => s + (f.size || 0), 0);

  return (
    <div className="border border-border bg-card/40 backdrop-blur-sm rounded-xl overflow-hidden" data-testid="file-manager">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-background/30 gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-md flex items-center justify-center border border-primary/40 bg-primary/10 text-primary">
            <Folder className="w-4 h-4" />
          </span>
          <div>
            <p className="font-heading text-base font-bold tracking-tight">File Manager</p>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {files.length} files · {fmtSize(totalSize)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search files…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-testid="file-search-input"
              className="pl-8 pr-3 py-2 bg-background/60 border border-border rounded-md font-mono text-xs focus:outline-none focus:border-primary w-44"
            />
          </div>
          <button
            onClick={refresh}
            data-testid="file-refresh-button"
            className="p-2 border border-border rounded-md hover:border-primary/60 hover:text-primary transition-colors"
            aria-label="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => inputRef.current?.click()}
            data-testid="file-upload-button"
            disabled={uploading}
            className="font-mono text-[10px] uppercase tracking-widest px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md flex items-center gap-1.5 disabled:opacity-50 transition-colors"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            {uploading ? "Uploading…" : "Upload"}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
            multiple
            onChange={onPick}
            className="hidden"
            data-testid="file-input-hidden"
          />
        </div>
      </div>

      {/* Drop zone (visible when empty or while uploading) */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`m-5 p-8 border-2 border-dashed rounded-lg text-center transition-colors ${
          dragOver ? "border-primary bg-primary/5" : "border-border bg-background/30"
        }`}
        data-testid="file-dropzone"
      >
        <UploadCloud className={`w-10 h-10 mx-auto mb-3 ${dragOver ? "text-primary" : "text-muted-foreground"}`} />
        <p className="font-heading text-sm font-bold tracking-tight">
          Drop images here, or <button onClick={() => inputRef.current?.click()} className="text-primary underline">browse</button>
        </p>
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mt-2">
          PNG, JPG, WEBP, GIF, SVG · max 5MB each
        </p>
      </div>

      {/* Gallery */}
      <div className="p-5 pt-0">
        {loading ? (
          <p className="font-mono text-xs text-muted-foreground py-8 text-center">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="font-mono text-xs text-muted-foreground py-8 text-center">
            {files.length === 0 ? "No files yet — upload your first image above." : "No files match your search."}
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {filtered.map((f) => (
              <div
                key={f.id}
                className="group relative border border-border bg-background/40 rounded-md overflow-hidden hover:border-primary/60 transition-colors"
                data-testid={`file-item-${f.id}`}
              >
                <div className="aspect-square bg-secondary overflow-hidden">
                  <img
                    src={fullUrl(f)}
                    alt={f.original_filename}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-2 space-y-0.5">
                  <p className="text-xs font-mono truncate" title={f.original_filename}>{f.original_filename}</p>
                  <p className="text-[10px] font-mono text-muted-foreground">{fmtSize(f.size)} · {fmtDate(f.created_at)}</p>
                </div>
                {/* Actions overlay */}
                <div className="absolute inset-0 bg-background/85 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => copyUrl(f)}
                    data-testid={`file-copy-${f.id}`}
                    aria-label="Copy URL"
                    className="p-2.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {copiedId === f.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <a
                    href={fullUrl(f)}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid={`file-view-${f.id}`}
                    aria-label="View"
                    className="p-2.5 rounded-md border border-border hover:border-primary hover:text-primary"
                  >
                    <ImageIcon className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => remove(f)}
                    data-testid={`file-delete-${f.id}`}
                    aria-label="Delete"
                    className="p-2.5 rounded-md border border-border hover:border-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
