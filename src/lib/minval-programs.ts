export const WHATSAPP_NUMBER = "905000000000";
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  "Merhaba, Minval Akademi programlarına kayıt olmak istiyorum.",
)}`;

export function whatsappUrl(number: string, text = "Merhaba, Minval Akademi programlarına kayıt olmak istiyorum.") {
  return `https://wa.me/${number.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
}

export type ProgramCategory = "risale" | "tefsir-hadis" | "psikoloji" | "genc" | "sanat";

export const categoryTabs: { id: "all" | ProgramCategory; label: string }[] = [
  { id: "all", label: "Tüm Programlar" },
  { id: "risale", label: "Risale Okulları" },
  { id: "tefsir-hadis", label: "Tefsir & Hadis" },
  { id: "psikoloji", label: "Psikoloji Okumaları" },
  { id: "genc", label: "Minval Genç / MAG" },
];

export type Program = {
  id: string;
  emoji: string;
  title: string;
  subtitle: string;
  category: ProgramCategory;
  categoryLabel: string;
  audience: string;
  fee: string;
  paid?: boolean;
  badges: string[];
  quote: string;
  description: string;
  groups: { label: string; items: string[] }[];
  instructor: string;
  schedule: string;
  books: string[];
  curriculum: { week: string; topic: string }[];
  soon?: boolean;
};

export const programs: Program[] = [
  {
    id: "risale",
    emoji: "📖",
    title: "Minval Risale",
    subtitle: "Risale Okulları",
    category: "risale",
    categoryLabel: "Risale Okulları",
    audience: "Hanımlara Özel (16 yaş+)",
    fee: "Ücretsiz",
    badges: ["Hanımlara Özel (16 yaş+)", "Ücretsiz", "Kontenjanlı & Devam Zorunlu"],
    quote: "Söz, mana ile beraber gönle nüzul eder; fakat idrak, terbiye ister.",
    description:
      "Risale-i Nur tefekkür halkaları; imandan tevhide kademeli olarak ilerleyen bir müzakere mektebi.",
    groups: [
      { label: "Başlangıç Düzey", items: ["Grup 1", "Grup 2"] },
      { label: "Orta Düzey", items: ["Grup 1"] },
      { label: "Orta Düzey N2", items: ["Grup 1"] },
      { label: "Kavram Odaklı", items: ["Grup 1"] },
      { label: "Akşam Grubu", items: ["Başlangıç Düzey"] },
      { label: "Online Risale Okulu", items: ["Grup 1", "Orta Düzey"] },
    ],
    instructor: "Minval Risale Okulu müzakere ekibi",
    schedule: "Hafta içi gündüz ve akşam grupları · Haftada 1 oturum (90 dk)",
    books: ["Sözler", "Mektubat (seçme bahisler)", "Küçük Sözler", "Haftalık müzakere notları"],
    curriculum: [
      { week: "1–4. Hafta", topic: "Usul: Risale metnine nasıl yaklaşılır, kavram haritası" },
      { week: "5–8. Hafta", topic: "İman ve marifetullah bahisleri; Küçük Sözler müzakeresi" },
      { week: "9–12. Hafta", topic: "Haşir ve nübüvvet bahislerine giriş" },
      { week: "13–16. Hafta", topic: "Tevhid ekseninde bütüncül okuma ve dönem değerlendirmesi" },
    ],
  },
  {
    id: "tefsir",
    emoji: "📗",
    title: "Tefsir",
    subtitle: "Asrın Diliyle Kur'an Okumaları",
    category: "tefsir-hadis",
    categoryLabel: "Tefsir & Hadis",
    audience: "Hanımlara Özel (16 yaş+)",
    fee: "Ücretsiz",
    badges: ["Hanımlara Özel (16 yaş+)", "Ücretsiz", "Devam Zorunluluğu Yoktur"],
    quote: "Kelam, indiği çağı aşar; ama anlaşılmak için mütemadiyen kendi çağını bulmalıdır.",
    description:
      "Ayetlerin bugünün diline ve meselelerine dokunan, sakin ve derinlikli tefsir okumaları.",
    groups: [{ label: "Gündüz", items: ["1. Grup"] }],
    instructor: "Minval Tefsir halkası hocası",
    schedule: "Gündüz grubu · Haftada 1 oturum (75 dk)",
    books: ["Kur'an-ı Kerim Meali", "Seçme tefsir metinleri", "Ders föyleri"],
    curriculum: [
      { week: "1–3. Hafta", topic: "Tefsir usulüne giriş: sebeb-i nüzul ve siyak" },
      { week: "4–8. Hafta", topic: "Kısa sureler ekseninde tematik okuma" },
      { week: "9–12. Hafta", topic: "Ahlak ve muamelat ayetleri; çağdaş meselelerle irtibat" },
    ],
  },
  {
    id: "hadis",
    emoji: "📜",
    title: "Minval Hadis",
    subtitle: "Hadis Okumaları",
    category: "tefsir-hadis",
    categoryLabel: "Tefsir & Hadis",
    audience: "Hanımlara Özel (16 yaş+)",
    fee: "Ücretsiz",
    badges: ["Hanımlara Özel (16 yaş+)", "Ücretsiz", "Devam Zorunluluğu Yoktur"],
    quote: "Söz Resûl'ündür; şerh, ona yaklaşan aklın alçakgönüllü çabasıdır.",
    description: "Rivayet ve şerh geleneği içinde, hadis metinlerinin usulünce müzakeresi.",
    groups: [{ label: "Gruplar", items: ["Grup 1"] }],
    instructor: "Minval Hadis halkası hocası",
    schedule: "Haftada 1 oturum (75 dk)",
    books: ["Riyâzü's-Sâlihîn", "Kırk Hadis derlemesi", "Şerh notları"],
    curriculum: [
      { week: "1–3. Hafta", topic: "Hadis usulü: rivayet, sened ve metin" },
      { week: "4–8. Hafta", topic: "İhlas, niyet ve ahlak hadisleri" },
      { week: "9–12. Hafta", topic: "Muaşeret ve toplumsal hayat hadisleri" },
    ],
  },
  {
    id: "psikoloji",
    emoji: "🧠",
    title: "Minval Psikoloji",
    subtitle: "Psikoloji Okumaları",
    category: "psikoloji",
    categoryLabel: "Psikoloji Okumaları",
    audience: "Hanımlara Özel (16 yaş+)",
    fee: "Ücretli (Detaylar için iletişime geçiniz)",
    paid: true,
    badges: ["Hanımlara Özel (16 yaş+)", "Ücretli (Detaylar için iletişime geçiniz)"],
    quote: "Nefsini bilen, Rabbini bilir; fakat nefsi bilmek de bir ilim ve emek işidir.",
    description:
      "Modern psikoloji birikimini insanın manevi dünyasıyla birlikte okuyan atölye programı.",
    groups: [{ label: "Gruplar", items: ["Grup 1", "Grup 2", "Grup 3"] }],
    instructor: "Uzman psikolog eşliğinde okuma grubu",
    schedule: "Haftada 1 oturum (90 dk) · Üç ayrı grup saati",
    books: ["Seçme psikoloji makaleleri", "Vaka çalışması föyleri", "Tavsiye okuma listesi"],
    curriculum: [
      { week: "1–3. Hafta", topic: "İnsan tasavvuru: modern psikoloji ve gelenek" },
      { week: "4–7. Hafta", topic: "Duygu düzenleme, kaygı ve maneviyat" },
      { week: "8–12. Hafta", topic: "İlişkiler, aile ve şahsiyet gelişimi" },
    ],
  },
  {
    id: "genc",
    emoji: "🌱",
    title: "Minval Genç",
    subtitle: "Minval MAG",
    category: "genc",
    categoryLabel: "Minval Genç / MAG",
    audience: "Sadece Kız Öğrenciler",
    fee: "Ücretsiz",
    badges: ["Sadece Kız Öğrenciler", "Ücretsiz"],
    quote:
      "Genç akıl, henüz yönünü arayan bir pusuladır; ona ihtiyacı olan, dayatma değil, yol arkadaşlığıdır.",
    description: "Ortaokuldan üniversiteye, yaş gruplarına göre kurgulanmış gençlik halkaları.",
    groups: [
      { label: "Ortaokul", items: ["Grup 1", "Grup 2"] },
      { label: "Lise", items: ["Grup 1"] },
      { label: "Üniversite", items: ["Grup 1"] },
    ],
    instructor: "Minval Genç rehber ekibi",
    schedule: "Hafta sonu · Yaş gruplarına göre ayrı saatler",
    books: ["Gençlik Rehberi", "Seçme kısa metinler", "Atölye çalışma kağıtları"],
    curriculum: [
      { week: "1–4. Hafta", topic: "Kimlik, alışkanlıklar ve zaman" },
      { week: "5–8. Hafta", topic: "Okuma alışkanlığı ve tefekkür atölyeleri" },
      { week: "9–12. Hafta", topic: "Sosyal sorumluluk ve proje çalışması" },
    ],
  },
  {
    id: "sanat",
    emoji: "🎨",
    title: "Minval Sanat",
    subtitle: "Yakında",
    category: "sanat",
    categoryLabel: "Minval Sanat",
    audience: "Herkese açık",
    fee: "Yakında",
    badges: ["Yakında / Detaylar Eklenecek"],
    soon: true,
    quote: "Güzellik, hakikatin gözle görülen tercümesidir.",
    description: "Hat, ebru ve estetik üzerine atölyelerimiz hazırlanıyor.",
    groups: [],
    instructor: "Atölye eğitmenleri açıklanacak",
    schedule: "Program takvimi yakında duyurulacak",
    books: [],
    curriculum: [],
  },
];

export const principles = [
  { title: "Risale-i Nur Tefekkürü", text: "İman hakikatlerini akıl ve kalp birlikteliğiyle müzakere eden bir okuma usulü." },
  { title: "Kur'an & Sünnet Rehberliği", text: "Bütün program ve okumaların ölçüsü; vahiy ve Sünnet-i Seniyye çizgisidir." },
  { title: "Bağımsız Duruş", text: "Hiçbir yapıya bağlı olmayan, ilmî ve gönüllü bir hareket olarak yol alıyoruz." },
  { title: "Şahsiyet Eğitimi", text: "Bilgiyi ahlaka dönüştüren, güzel ahlakı merkeze alan bir terbiye anlayışı." },
];

export const weekDays = [
  "Pazartesi",
  "Salı",
  "Çarşamba",
  "Perşembe",
  "Cuma",
  "Cumartesi",
  "Pazar",
] as const;

export type TimetableEntry = {
  day: (typeof weekDays)[number];
  time: string;
  programId: string;
  group: string;
};

export const timetable: TimetableEntry[] = [
  { day: "Pazartesi", time: "10:30", programId: "risale", group: "Başlangıç Düzey · Grup 1" },
  { day: "Pazartesi", time: "20:00", programId: "risale", group: "Akşam Grubu" },
  { day: "Salı", time: "11:00", programId: "tefsir", group: "Gündüz · 1. Grup" },
  { day: "Salı", time: "14:00", programId: "psikoloji", group: "Grup 1" },
  { day: "Çarşamba", time: "10:30", programId: "risale", group: "Orta Düzey · Grup 1" },
  { day: "Çarşamba", time: "19:30", programId: "risale", group: "Online Risale Okulu" },
  { day: "Perşembe", time: "11:00", programId: "hadis", group: "Grup 1" },
  { day: "Perşembe", time: "14:30", programId: "psikoloji", group: "Grup 2" },
  { day: "Cuma", time: "10:30", programId: "risale", group: "Kavram Odaklı · Grup 1" },
  { day: "Cuma", time: "15:00", programId: "psikoloji", group: "Grup 3" },
  { day: "Cumartesi", time: "11:00", programId: "genc", group: "Ortaokul · Grup 1" },
  { day: "Cumartesi", time: "13:30", programId: "genc", group: "Lise · Grup 1" },
  { day: "Cumartesi", time: "16:00", programId: "risale", group: "Orta Düzey N2 · Grup 1" },
  { day: "Pazar", time: "12:00", programId: "genc", group: "Üniversite · Grup 1" },
  { day: "Pazar", time: "15:00", programId: "genc", group: "Ortaokul · Grup 2" },
];

export const programColor: Record<string, string> = {
  risale: "bg-primary/10 text-primary border-primary/25",
  tefsir: "bg-accent/20 text-foreground border-accent/40",
  hadis: "bg-secondary text-secondary-foreground border-border",
  psikoloji: "bg-late/15 text-foreground border-late/40",
  genc: "bg-present/12 text-foreground border-present/35",
  sanat: "bg-muted text-muted-foreground border-border",
};
