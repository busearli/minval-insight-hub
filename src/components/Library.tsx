import { useMemo, useState } from "react";
import { Download, Eye, FileText, Headphones, Search } from "lucide-react";
import { toast } from "sonner";

import { libraryCategories, libraryResources, type LibraryResource } from "@/lib/minval-data";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function Library() {
  const [cat, setCat] = useState<string>("Tümü");
  const [q, setQ] = useState("");
  const [preview, setPreview] = useState<LibraryResource | null>(null);

  const list = useMemo(() => {
    const needle = q.trim().toLocaleLowerCase("tr");
    return libraryResources.filter(
      (r) =>
        (cat === "Tümü" || r.category === cat) &&
        (!needle ||
          r.title.toLocaleLowerCase("tr").includes(needle) ||
          r.author.toLocaleLowerCase("tr").includes(needle)),
    );
  }, [cat, q]);

  return (
    <div className="space-y-8">
      <header>
        <span className="eyebrow">Kütüphane</span>
        <h1 className="mt-3 text-3xl text-foreground">Dijital Kütüphane & Okuma Materyalleri</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Atölye metinleri, makaleler, e-kitaplar ve ses kayıtları tek yerde. Tarayıcıda inceleyin
          veya indirin.
        </p>
      </header>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="relative w-full lg:max-w-xs">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            maxLength={80}
            placeholder="Başlık veya yazar ara…"
            className="w-full rounded-full border border-border bg-card py-2.5 pr-4 pl-9 text-[13px] outline-none focus:border-primary"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {libraryCategories.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`rounded-full px-4 py-2 text-[12px] transition-colors ${
                cat === c
                  ? "bg-primary text-primary-foreground"
                  : "border border-border text-muted-foreground hover:border-primary hover:text-primary"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <p className="rounded-xl bg-secondary px-5 py-8 text-center text-sm text-muted-foreground">
          Aramanıza uygun materyal bulunamadı.
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((r) => {
            const audio = r.category === "Ses Kayıtları / Podcastler";
            return (
              <article key={r.id} className="card-soft hover-lift flex flex-col p-6">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-secondary text-primary">
                  {audio ? <Headphones className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                </div>
                <h2 className="mt-4 text-lg leading-snug text-foreground">{r.title}</h2>
                <p className="mt-1 text-[12px] text-muted-foreground">{r.author}</p>
                <p className="mt-1 text-[12px] text-muted-foreground">{r.meta}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {r.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-secondary px-2.5 py-1 text-[11px] text-secondary-foreground"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <div className="mt-6 flex gap-2 border-t border-border pt-4">
                  <button
                    onClick={() => setPreview(r)}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-primary/40 px-3 py-2 text-[12px] text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                  >
                    <Eye className="h-3.5 w-3.5" /> Tarayıcıda İncele
                  </button>
                  <button
                    onClick={() => toast.success(`${r.title} indiriliyor (demo).`)}
                    aria-label="İndir"
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border text-muted-foreground hover:bg-secondary"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <Dialog open={!!preview} onOpenChange={(v) => !v && setPreview(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">{preview?.title}</DialogTitle>
          </DialogHeader>
          <p className="text-[12px] text-muted-foreground">
            {preview?.author} · {preview?.meta}
          </p>
          <div className="mt-2 max-h-[55vh] overflow-y-auto rounded-lg border border-border bg-card p-6 text-[13px] leading-7 text-muted-foreground">
            <p className="font-serif text-lg text-foreground">Önizleme</p>
            <p className="mt-4">
              Bu bir demo önizlemesidir. Gerçek dosya yüklendiğinde metnin ilk sayfaları burada
              görüntülenecektir.
            </p>
            <p className="mt-4">
              “Her çağ kendi hastalığına sahiptir. Bugün mesele artık yasak değil, sınırsız
              yapabilme; disiplin değil, performanstır.”
            </p>
            <p className="mt-4">
              Metnin devamı için sağ üstteki indirme seçeneğini kullanabilir, atölye forumunda
              tartışmaya katılabilirsiniz.
            </p>
          </div>
          <button
            onClick={() => toast.success("Dosya indiriliyor (demo).")}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm text-primary-foreground"
          >
            <Download className="h-4 w-4" /> İndir
          </button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
