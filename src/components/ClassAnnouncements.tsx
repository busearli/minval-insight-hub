import { useState } from "react";
import { toast } from "sonner";
import { Megaphone, Trash2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  useAnnouncements,
  useDeleteAnnouncement,
  useSaveAnnouncement,
} from "@/lib/announcements";

/** Sınıf bazlı duyurular: eğitmen ve yöneticiler kendi sınıflarına duyuru yazar. */
export function ClassAnnouncements({ classId }: { classId: string }) {
  const { data: all = [] } = useAnnouncements();
  const save = useSaveAnnouncement();
  const remove = useDeleteAnnouncement();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const rows = all.filter((a) => a.class_id === classId);

  const publish = () => {
    if (!title.trim()) {
      toast.error("Duyuru başlığı giriniz.");
      return;
    }
    save.mutate(
      { title: title.trim(), body: body.trim(), class_id: classId },
      {
        onSuccess: () => {
          setTitle("");
          setBody("");
          toast.success("Duyuru sınıfa iletildi.");
        },
        onError: (err) =>
          toast.error(err instanceof Error ? err.message : "Duyuru gönderilemedi."),
      },
    );
  };

  return (
    <div className="mt-4 rounded-xl border border-border bg-card p-4">
      <p className="flex items-center gap-2 text-sm text-foreground">
        <Megaphone className="h-4 w-4 text-primary" /> Sınıf Duyuruları
      </p>

      <div className="mt-3 grid gap-2">
        <Input
          placeholder="Duyuru başlığı"
          value={title}
          maxLength={120}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Textarea
          placeholder="Duyuru metni"
          value={body}
          maxLength={800}
          onChange={(e) => setBody(e.target.value)}
        />
        <button
          onClick={publish}
          className="w-fit rounded-full bg-primary px-4 py-2 text-[13px] text-primary-foreground"
        >
          Duyuruyu Yayınla
        </button>
      </div>

      <ul className="mt-4 space-y-2">
        {rows.length === 0 && (
          <li className="text-[13px] text-muted-foreground">Bu sınıfa henüz duyuru yazılmadı.</li>
        )}
        {rows.map((a) => (
          <li
            key={a.id}
            className="flex items-start gap-3 rounded-lg border border-border px-3 py-2"
          >
            <div className="min-w-0 flex-1">
              <p className="text-[13px] text-foreground">{a.title}</p>
              {a.body && <p className="text-[12px] text-muted-foreground">{a.body}</p>}
              <p className="text-[11px] text-muted-foreground">{a.created_at.slice(0, 10)}</p>
            </div>
            <button
              onClick={() => remove.mutate(a.id)}
              className="rounded-full border border-border p-1.5 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
