import { Badge } from "@/components/ui/badge";
import { programColor, type Program } from "@/lib/minval-programs";
import { ArrowUpRight, Users, Wallet } from "lucide-react";

export function ProgramCard({ p, onOpen }: { p: Program; onOpen?: (p: Program) => void }) {
  const tone = programColor[p.id] ?? programColor["sanat"]!;
  return (
    <article
      onClick={() => onOpen?.(p)}
      role={onOpen ? "button" : undefined}
      tabIndex={onOpen ? 0 : undefined}
      onKeyDown={(e) => {
        if (onOpen && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onOpen(p);
        }
      }}
      className={`card-soft hover-lift group relative flex flex-col overflow-hidden border-accent/40 p-7 ${
        onOpen ? "cursor-pointer" : ""
      }`}
    >
      <span className="absolute inset-x-0 top-0 h-1 bg-primary/70" />

      <div className="flex items-start justify-between gap-3">
        <span className={`rounded-full border px-3 py-1 text-[11px] ${tone}`}>{p.categoryLabel}</span>
        {onOpen && (
          <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
        )}
      </div>

      <div className="mt-5 flex items-start gap-3">
        <span className="text-2xl leading-none">{p.emoji}</span>
        <div>
          <h3 className="text-xl leading-snug text-foreground">{p.title}</h3>
          <p className="text-[13px] text-muted-foreground">{p.subtitle}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Badge
          variant="secondary"
          className="gap-1 rounded-full bg-secondary text-[11px] font-normal text-secondary-foreground"
        >
          <Users className="h-3 w-3" /> {p.audience}
        </Badge>
        <Badge
          variant="secondary"
          className={`gap-1 rounded-full text-[11px] font-normal ${
            p.paid ? "bg-late/15 text-foreground" : "bg-present/12 text-foreground"
          }`}
        >
          <Wallet className="h-3 w-3" /> {p.fee}
        </Badge>
      </div>

      <blockquote className="mt-5 rounded-xl bg-secondary/60 p-4 font-serif text-[15px] leading-relaxed text-foreground/90 italic">
        “{p.quote}”
      </blockquote>

      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{p.description}</p>

      {p.groups.length > 0 && (
        <div className="mt-6 border-t border-border pt-5">
          <p className="eyebrow">Açık Gruplar</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {p.groups.flatMap((g) =>
              g.items.map((it) => (
                <span
                  key={`${g.label}-${it}`}
                  className="rounded-full border border-accent/50 bg-background px-2.5 py-1 text-[11px] text-foreground"
                >
                  {g.label} · {it}
                </span>
              )),
            )}
          </div>
        </div>
      )}
    </article>
  );
}
