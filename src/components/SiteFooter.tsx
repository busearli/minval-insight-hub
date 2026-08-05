import { Link } from "@tanstack/react-router";
import { Instagram, Mail, MapPin, MessageCircle } from "lucide-react";

import { MinvalMark } from "@/components/MinvalMark";
import { WHATSAPP_URL } from "@/lib/minval-programs";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-secondary/50">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-3">
            <MinvalMark className="h-10 w-10" />
            <div>
              <div className="text-[13px] font-semibold tracking-[0.18em] text-foreground uppercase">
                Minval Akademi
              </div>
              <div className="text-[10px] tracking-[0.3em] text-muted-foreground uppercase">Kahve</div>
            </div>
          </div>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">
            İlim, hikmet ve güzel ahlak ekseninde; bağımsız bir ilim, kültür ve gençlik hareketi.
          </p>
        </div>

        <div>
          <h4 className="text-sm text-foreground">Keşfet</h4>
          <ul className="mt-4 space-y-2 text-[13px] text-muted-foreground">
            <li><Link to="/hakkimizda" className="hover:text-primary">Hakkımızda</Link></li>
            <li><Link to="/programlar" className="hover:text-primary">Programlarımız</Link></li>
            <li><Link to="/minval-sanat" className="hover:text-primary">Minval Sanat</Link></li>
            <li><Link to="/iletisim" className="hover:text-primary">İletişim</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm text-foreground">İletişim</h4>
          <ul className="mt-4 space-y-3 text-[13px] text-muted-foreground">
            <li className="flex gap-2">
              <MessageCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="hover:text-primary">
                Kurumsal WhatsApp Hattı
              </a>
            </li>
            <li className="flex gap-2"><Instagram className="mt-0.5 h-4 w-4 shrink-0" /> @minvalakademi</li>
            <li className="flex gap-2"><Mail className="mt-0.5 h-4 w-4 shrink-0" /> merhaba@minvalakademi.com</li>
            <li className="flex gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0" /> Minval Kahve, İstanbul</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-6 text-center text-[12px] text-muted-foreground">
        © 2026 Minval Akademi. Tüm hakları saklıdır.
      </div>
    </footer>
  );
}
