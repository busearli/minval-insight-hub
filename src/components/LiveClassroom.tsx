import { useEffect, useState } from "react";
import {
  ArrowBigUp,
  Check,
  Download,
  Maximize2,
  MessageSquare,
  Mic,
  Pause,
  Play,
  Radio,
  Send,
  Settings,
  Volume2,
} from "lucide-react";
import { toast } from "sonner";

type Question = { id: number; who: string; text: string; votes: number; answer?: string };

const initialQuestions: Question[] = [
  {
    id: 1,
    who: "Zeynep A.",
    text: "Han'ın 'başarı öznesi' kavramını Foucault'nun disiplin toplumuyla birlikte nasıl okumalıyız?",
    votes: 12,
    answer:
      "Disiplinden performansa geçişi bir kopuş değil, iktidarın içselleşmesi olarak düşünmenizi öneririm.",
  },
  { id: 2, who: "Kerem T.", text: "Şeffaflık toplumu bölümü için ek okuma önerir misiniz?", votes: 7 },
  { id: 3, who: "Elif D.", text: "Yorgunluk kavramı melankoliden nasıl ayrılıyor?", votes: 4 },
];

const initialChat = [
  { who: "Merve K.", text: "Ses gayet net, teşekkürler 🌿" },
  { who: "Ahmet S.", text: "Slaytlar sonrasında paylaşılacak mı?" },
  { who: "Moderatör", text: "Evet, oturum sonunda Oturum Notları sekmesinde olacak." },
];

function useCountdown(target: Date) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = Math.max(0, target.getTime() - now);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { d, h, m, s, done: diff === 0 };
}

export function LiveClassroom() {
  const [isLive, setIsLive] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [tab, setTab] = useState<"qa" | "chat" | "notes">("qa");
  const [questions, setQuestions] = useState(initialQuestions);
  const [voted, setVoted] = useState<number[]>([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [chat, setChat] = useState(initialChat);
  const [message, setMessage] = useState("");
  const [notes, setNotes] = useState(
    "· Performans öznesi: kendini sömüren özne\n· Disiplin → performans geçişi\n· Tartışma: yorgunluk bir direniş biçimi olabilir mi?\n",
  );

  const next = new Date();
  next.setDate(next.getDate() + ((4 - next.getDay() + 7) % 7 || 7));
  next.setHours(20, 0, 0, 0);
  const c = useCountdown(next);

  const addQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    const text = newQuestion.trim();
    if (!text) return;
    setQuestions((q) => [{ id: Date.now(), who: "Siz", text: text.slice(0, 300), votes: 1 }, ...q]);
    setNewQuestion("");
  };

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const text = message.trim();
    if (!text) return;
    setChat((c2) => [...c2, { who: "Siz", text: text.slice(0, 300) }]);
    setMessage("");
  };

  return (
    <div className="space-y-6">
      <div
        className={`flex flex-wrap items-center gap-3 rounded-xl px-5 py-4 ${
          isLive ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
        }`}
      >
        <Radio className={`h-4 w-4 ${isLive ? "animate-pulse" : ""}`} />
        {isLive ? (
          <span className="text-sm">Şu An Canlı · Çağdaş Felsefe Okumaları, 4. Oturum</span>
        ) : (
          <span className="text-sm">
            Sonraki Oturum: Perşembe 20:00 · {c.d}g {c.h}s {c.m}dk {c.s}sn
          </span>
        )}
        <button
          onClick={() => setIsLive((v) => !v)}
          className="ml-auto rounded-full border border-current/30 px-3 py-1 text-[11px]"
        >
          {isLive ? "Yayını sonlandır (demo)" : "Yayını başlat (demo)"}
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.8fr]">
        <section className="card-soft overflow-hidden">
          <div className="relative aspect-video bg-ink">
            <div className="absolute inset-0 grid place-items-center text-center text-ink-foreground/70">
              <div>
                <Mic className="mx-auto h-8 w-8 opacity-60" />
                <p className="mt-3 text-sm">
                  {isLive ? "Canlı yayın oynatılıyor" : "Yayın henüz başlamadı"}
                </p>
                <p className="mt-1 text-[11px] opacity-60">Zoom / YouTube Live gömülü oynatıcı</p>
              </div>
            </div>
            {isLive && (
              <span className="absolute top-4 left-4 flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 text-[11px] text-primary-foreground">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary-foreground" /> CANLI
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 border-t border-border px-5 py-3">
            <button
              onClick={() => setPlaying((v) => !v)}
              aria-label={playing ? "Duraklat" : "Oynat"}
              className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground"
            >
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
            <Volume2 className="h-4 w-4 text-muted-foreground" />
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
              <div className="h-full w-1/3 rounded-full bg-sage" />
            </div>
            <span className="text-[11px] text-muted-foreground">42:18</span>
            <Settings className="h-4 w-4 text-muted-foreground" />
            <Maximize2 className="h-4 w-4 text-muted-foreground" />
          </div>
        </section>

        <aside className="card-soft flex max-h-[36rem] min-h-[28rem] flex-col overflow-hidden">
          <div className="grid grid-cols-3 border-b border-border">
            {[
              { k: "qa" as const, l: "Soru & Cevap" },
              { k: "chat" as const, l: "Ders İçi Sohbet" },
              { k: "notes" as const, l: "Oturum Notları" },
            ].map((t) => (
              <button
                key={t.k}
                onClick={() => setTab(t.k)}
                className={`px-2 py-3 text-[12px] transition-colors ${
                  tab === t.k
                    ? "border-b-2 border-primary text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.l}
              </button>
            ))}
          </div>

          {tab === "qa" && (
            <div className="flex min-h-0 flex-1 flex-col">
              <ul className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
                {[...questions].sort((a, b) => b.votes - a.votes).map((q) => (
                  <li key={q.id} className="rounded-lg bg-secondary/60 p-3">
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          if (voted.includes(q.id)) return;
                          setVoted((v) => [...v, q.id]);
                          setQuestions((qs) =>
                            qs.map((x) => (x.id === q.id ? { ...x, votes: x.votes + 1 } : x)),
                          );
                        }}
                        className={`flex h-11 w-9 shrink-0 flex-col items-center justify-center rounded-md border text-[11px] ${
                          voted.includes(q.id)
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border text-muted-foreground hover:border-primary"
                        }`}
                      >
                        <ArrowBigUp className="h-3.5 w-3.5" />
                        {q.votes}
                      </button>
                      <div className="min-w-0">
                        <p className="text-[13px] leading-relaxed text-foreground">{q.text}</p>
                        <p className="mt-1 text-[11px] text-muted-foreground">{q.who}</p>
                        {q.answer && (
                          <p className="mt-2 flex gap-2 rounded-md bg-card p-2 text-[12px] text-muted-foreground">
                            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sage" />
                            {q.answer}
                          </p>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <form onSubmit={addQuestion} className="flex gap-2 border-t border-border p-3">
                <input
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  maxLength={300}
                  placeholder="Eğitmene soru sorun…"
                  className="min-w-0 flex-1 rounded-full border border-border bg-card px-4 py-2 text-[13px] outline-none focus:border-primary"
                />
                <button className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          )}

          {tab === "chat" && (
            <div className="flex min-h-0 flex-1 flex-col">
              <ul className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
                {chat.map((m, i) => (
                  <li key={i} className="text-[13px]">
                    <span className="text-primary">{m.who}</span>
                    <span className="text-muted-foreground"> · </span>
                    <span className="text-foreground">{m.text}</span>
                  </li>
                ))}
              </ul>
              <form onSubmit={send} className="flex gap-2 border-t border-border p-3">
                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={300}
                  placeholder="Mesaj yazın…"
                  className="min-w-0 flex-1 rounded-full border border-border bg-card px-4 py-2 text-[13px] outline-none focus:border-primary"
                />
                <button className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                  <MessageSquare className="h-4 w-4" />
                </button>
              </form>
            </div>
          )}

          {tab === "notes" && (
            <div className="flex min-h-0 flex-1 flex-col p-4">
              <p className="text-[11px] text-muted-foreground">
                Ortak not defteri · 6 katılımcı düzenliyor
              </p>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-3 min-h-0 flex-1 resize-none rounded-lg border border-border bg-card p-3 text-[13px] leading-relaxed outline-none focus:border-primary"
              />
              <button
                onClick={() => toast.success("Oturum özeti PDF olarak indiriliyor (demo).")}
                className="mt-3 inline-flex items-center justify-center gap-2 rounded-full border border-border px-4 py-2 text-[13px] text-foreground hover:bg-secondary"
              >
                <Download className="h-4 w-4" /> Oturum özetini indir (PDF)
              </button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
