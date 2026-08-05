import { createFileRoute } from "@tanstack/react-router";
import { Instagram, Mail, MapPin, MessageCircle, Phone, Sparkles } from "lucide-react";
import { useState } from "react";

import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { RegistrationModal } from "@/components/RegistrationModal";
import { whatsappUrl } from "@/lib/minval-programs";
import { useSiteSettings } from "@/lib/site-api";


export const Route = createFileRoute("/iletisim")({
  head: () => ({
    meta: [
      { title: "İletişim & Kayıt — Minval Akademi | Kahve" },
      {
        name: "description",
        content:
          "Minval Akademi programlarına kayıt kurumsal WhatsApp hattımız üzerinden alınmaktadır. İletişim ve sosyal medya bilgilerimiz.",
      },
      { property: "og:title", content: "İletişim & Kayıt — Minval Akademi" },
      {
        property: "og:description",
        content: "Kayıtlar WhatsApp hattımız üzerinden. Bize ulaşın.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { settings } = useSiteSettings();
  const [regOpen, setRegOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-5 py-16">
        <p className="eyebrow">İletişim</p>
        <h1 className="mt-4 text-4xl text-foreground sm:text-5xl">Kayıt ve iletişim</h1>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="card-soft border-accent/40 p-8">
            <MessageCircle className="h-6 w-6 text-primary" />
            <h2 className="mt-4 text-xl text-foreground">Ön kayıt ve WhatsApp</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Ön kayıt formunu doldurabilir ya da kurumsal WhatsApp hattımızdan katılmak istediğiniz
              programı belirterek bize yazabilirsiniz.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => setRegOpen(true)}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground"
              >
                <Sparkles className="h-4 w-4" /> Ön Kayıt Ol
              </button>
              <a
                href={whatsappUrl(settings.whatsapp_number)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm text-foreground"
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
            </div>
          </div>

          <div className="card-soft border-accent/40 p-8">
            <h2 className="text-xl text-foreground">Bize ulaşın</h2>
            <ul className="mt-5 space-y-4 text-sm text-muted-foreground">
              <li className="flex gap-3">
                <Instagram className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <a href={settings.instagram_url} target="_blank" rel="noreferrer" className="hover:text-primary">
                  Instagram
                </a>
              </li>
              {settings.phone && (
                <li className="flex gap-3">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <span>{settings.phone}</span>
                </li>
              )}
              <li className="flex gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <span>{settings.email}</span>
              </li>
              <li className="flex gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <span>{settings.address}</span>
              </li>
            </ul>
            <p className="mt-6 text-[13px] leading-relaxed text-muted-foreground">
              Programlarımızın büyük bölümü hanımlara özeldir (16 yaş+) ve ücretsizdir. Ücretli
              programlar için detayları WhatsApp hattımızdan öğrenebilirsiniz.
            </p>
          </div>
        </div>
      </main>
      <RegistrationModal open={regOpen} onOpenChange={setRegOpen} />
      <SiteFooter />
    </div>
  );
}

