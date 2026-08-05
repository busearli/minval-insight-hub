import { Badge } from "@/components/ui/badge";
import type { Program } from "@/lib/minval-programs";

export function ProgramCard({ p }: { p: Program }) {
  return (
    <article className="card-soft hover-lift flex flex-col border-accent/40 p-7">
      <div className="flex items-start gap-3">
        <span className="text-2xl leading-none">{p.emoji}</span>
        <div>
          <h3 className="text-xl leading-snug text-foreground">{p.title}</h3>
          <p className="text-[13px] text-muted-foreground">{p.subtitle}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {p.badges.map((b) => (
          <Badge
            key={b}
            variant="secondary"
            className="rounded-full bg-secondary text-[11px] font-normal text-secondary-foreground"
          >
            {b}
          </Badge>
        ))}
      </div>

      <blockquote className="mt-5 border-l-2 border-accent pl-4 font-serif text-[15px] leading-relaxed text-foreground/90 italic">
        “{p.quote}”
      </blockquote>

      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{p.description}</p>

      {p.groups.length > 0 && (
        <div className="mt-6 border-t border-border pt-5">
          <p className="eyebrow">Açık Gruplar</p>
          <ul className="mt-3 space-y-2">
            {p.groups.map((g) => (
              <li key={g.label} className="text-[13px] text-foreground">
                <span className="text-muted-foreground">{g.label}:</span>{" "}
                {g.items.join(" · ")}
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}
