import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BookOpen, CalendarClock, GraduationCap } from "lucide-react";
import type { Program } from "@/lib/minval-programs";

export function ProgramDetailModal({
  program,
  onOpenChange,
  onRegister,
}: {
  program: Program | null;
  onOpenChange: (v: boolean) => void;
  onRegister: (p: Program) => void;
}) {
  return (
    <Dialog open={!!program} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-2xl">
        {program && (
          <>
            <DialogHeader>
              <p className="eyebrow">{program.categoryLabel}</p>
              <DialogTitle className="font-serif text-2xl">
                {program.emoji} {program.title}
              </DialogTitle>
              <DialogDescription>{program.subtitle}</DialogDescription>
            </DialogHeader>

            <blockquote className="rounded-xl bg-secondary/60 p-4 font-serif text-[15px] leading-relaxed text-foreground/90 italic">
              “{program.quote}”
            </blockquote>

            <p className="text-sm leading-relaxed text-muted-foreground">{program.description}</p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-border p-4">
                <p className="eyebrow flex items-center gap-1.5">
                  <GraduationCap className="h-3.5 w-3.5" /> Eğitmen
                </p>
                <p className="mt-2 text-sm text-foreground">{program.instructor}</p>
              </div>
              <div className="rounded-xl border border-border p-4">
                <p className="eyebrow flex items-center gap-1.5">
                  <CalendarClock className="h-3.5 w-3.5" /> Program
                </p>
                <p className="mt-2 text-sm text-foreground">{program.schedule}</p>
              </div>
            </div>

            {program.curriculum.length > 0 && (
              <div>
                <p className="eyebrow">Haftalık Müfredat (Müfredat Ana Hatları)</p>
                <ul className="mt-3 space-y-2">
                  {program.curriculum.map((c) => (
                    <li
                      key={c.week}
                      className="flex gap-3 rounded-lg border border-border/70 px-4 py-3 text-sm"
                    >
                      <span className="shrink-0 font-medium text-primary">{c.week}</span>
                      <span className="text-muted-foreground">{c.topic}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {program.books.length > 0 && (
              <div>
                <p className="eyebrow flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5" /> Okunacak Kaynaklar
                </p>
                <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-muted-foreground">
                  {program.books.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </div>
            )}

            {program.groups.length > 0 && (
              <div>
                <p className="eyebrow">Gruplar</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {program.groups.flatMap((g) =>
                    g.items.map((it) => (
                      <span
                        key={`${g.label}-${it}`}
                        className="rounded-full border border-accent/50 px-2.5 py-1 text-[11px] text-foreground"
                      >
                        {g.label} · {it}
                      </span>
                    )),
                  )}
                </div>
              </div>
            )}

            <button
              onClick={() => onRegister(program)}
              className="w-full rounded-full bg-primary px-4 py-3 text-sm text-primary-foreground transition-opacity hover:opacity-90"
            >
              Bu Programa Ön Kayıt Ol
            </button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
