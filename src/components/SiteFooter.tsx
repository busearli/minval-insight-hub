import { Link } from "@tanstack/react-router";
import { Instagram, Mail, MapPin, MessageCircle, Phone } from "lucide-react";

import { MinvalMark } from "@/components/MinvalMark";
import { whatsappUrl } from "@/lib/minval-programs";
import { mapsUrl, telUrl, useSiteSettings } from "@/lib/site-api";

export function SiteFooter() {
  const { settings } = useSiteSettings();

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
            {settings.intro ||
              "İlim, hikmet ve güzel ahlak ekseninde; bağımsız bir ilim, kültür ve gençlik hareketi."}
          </p>
        </div>

        <div>
          <h4 className="text-sm text-foreground">Keşfet</h4>
          <ul className="mt-4 space-y-2 text-[13px] text-muted-foreground">
            <li><Link to="/hakkimizda" className="hover:text-primary">Hakkımızda</Link></li>
            <li><Link to="/programlar" className="hover:text-primary">Programlarımız</Link></li>
            <li><Link to="/haftalik-program" className="hover:text-primary">Haftalık Program</Link></li>
            <li><Link to="/minval-sanat" className="hover:text-primary">Minval Sanat</Link></li>
            <li><Link to="/iletisim" className="hover:text-primary">İletişim</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm text-foreground">İletişim</h4>
          <ul className="mt-4 space-y-3 text-[13px] text-muted-foreground">
            <li className="flex gap-2">
              <MessageCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <a
                href={whatsappUrl(settings.whatsapp_number)}
                target="_blank"
                rel="noreferrer"
                className="hover:text-primary"
              >
                Kurumsal WhatsApp Hattı
              </a>
            </li>
            <li className="flex gap-2">
              <Instagram className="mt-0.5 h-4 w-4 shrink-0" />
              <a href={settings.instagram_url} target="_blank" rel="noreferrer" className="hover:text-primary">
                Instagram
              </a>
            </li>
            {settings.phone && (
              <li className="flex gap-2">
                <Phone className="mt-0.5 h-4 w-4 shrink-0" />
                <a href={telUrl(settings.phone)} className="hover:text-primary">{settings.phone}</a>
              </li>
            )}
            <li className="flex gap-2">
              <Mail className="mt-0.5 h-4 w-4 shrink-0" />
              <a href={`mailto:${settings.email}`} className="hover:text-primary">{settings.email}</a>
            </li>
            <li className="flex gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              <a
                href={mapsUrl(settings.address)}
                target="_blank"
                rel="noreferrer"
                className="hover:text-primary"
              >
                {settings.address}
              </a>
            </li>
          </ul>

        </div>
      </div>
      <div className="border-t border-border py-6 text-center text-[12px] text-muted-foreground">
        © 2026 Minval Akademi. Tüm hakları saklıdır.
      </div>
    </footer>
  );
}
