import { useRef, useState } from "react";
import { ChevronDown, FileText, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import {
  openMaterial,
  useDeleteMaterial,
  useMaterials,
  useUploadMaterial,
} from "@/lib/materials-api";

/** Sınıfa ait PDF/dosya materyalleri — yer kaplamaması için açılır-kapanır. */
export function ClassMaterials({
  classId,
  canManage = false,
  title = "Ders Materyalleri",
}: {
  classId?: string | null;
  canManage?: boolean;
  title?: string;
}) {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: files = [], isLoading } = useMaterials(open ? classId : null);
  const upload = useUploadMaterial();
  const remove = useDeleteMaterial();

  if (!classId) return null;

  const pick = (file?: File) => {
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      toast.error("Dosya en fazla 20 MB olabilir.");
      return;
    }
    upload.mutate(
      { classId, file },
      {
        onSuccess: () => toast.success("Materyal yüklendi."),
        onError: () => toast.error("Materyal yüklenemedi."),
      },
    );
  };

  return (
    <div className="rounded-xl border border-border/70 bg-card/60">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-2.5 text-[13px] text-muted-foreground hover:text-primary"
      >
        <span className="inline-flex items-center gap-2">
          <FileText className="h-3.5 w-3.5" /> {title}
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="space-y-2 border-t border-border/70 px-4 py-3">
          {canManage && (
            <>
              <input
                ref={inputRef}
                type="file"
                className="hidden"
                onChange={(e) => {
                  pick(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={upload.isPending}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[12px] text-muted-foreground hover:text-primary disabled:opacity-60"
              >
                <Upload className="h-3.5 w-3.5" />
                {upload.isPending ? "Yükleniyor…" : "PDF / Dosya Yükle"}
              </button>
            </>
          )}

          {isLoading && <p className="text-[12px] text-muted-foreground">Yükleniyor…</p>}
          {!isLoading && files.length === 0 && (
            <p className="text-[12px] text-muted-foreground">Henüz materyal yüklenmedi.</p>
          )}

          {files.map((f) => (
            <div key={f.id} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  void openMaterial(f.file_path).catch(() => toast.error("Dosya açılamadı."))
                }
                className="flex-1 truncate text-left text-[13px] text-foreground hover:text-primary"
              >
                {f.title || f.file_name}
              </button>
              <span className="text-[11px] text-muted-foreground">
                {Math.max(1, Math.round(f.file_size / 1024))} KB
              </span>
              {canManage && (
                <button
                  type="button"
                  onClick={() =>
                    remove.mutate(f, { onError: () => toast.error("Materyal silinemedi.") })
                  }
                  className="rounded-full border border-border p-1.5 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
