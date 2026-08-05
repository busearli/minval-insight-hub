export const WHATSAPP_NUMBER = "905000000000";
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  "Merhaba, Minval Akademi programlarına kayıt olmak istiyorum.",
)}`;

export type Program = {
  id: string;
  emoji: string;
  title: string;
  subtitle: string;
  badges: string[];
  paid?: boolean;
  quote: string;
  description: string;
  groups: { label: string; items: string[] }[];
  soon?: boolean;
};

export const programs: Program[] = [
  {
    id: "risale",
    emoji: "📖",
    title: "Minval Risale",
    subtitle: "Risale Okulları",
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
  },
  {
    id: "tefsir",
    emoji: "📗",
    title: "Tefsir",
    subtitle: "Asrın Diliyle Kur'an Okumaları",
    badges: ["Hanımlara Özel (16 yaş+)", "Ücretsiz", "Devam Zorunluluğu Yoktur"],
    quote: "Kelam, indiği çağı aşar; ama anlaşılmak için mütemadiyen kendi çağını bulmalıdır.",
    description:
      "Ayetlerin bugünün diline ve meselelerine dokunan, sakin ve derinlikli tefsir okumaları.",
    groups: [{ label: "Gündüz", items: ["1. Grup"] }],
  },
  {
    id: "hadis",
    emoji: "📜",
    title: "Minval Hadis",
    subtitle: "Hadis Okumaları",
    badges: ["Hanımlara Özel (16 yaş+)", "Ücretsiz", "Devam Zorunluluğu Yoktur"],
    quote: "Söz Resûl'ündür; şerh, ona yaklaşan aklın alçakgönüllü çabasıdır.",
    description: "Rivayet ve şerh geleneği içinde, hadis metinlerinin usulünce müzakeresi.",
    groups: [{ label: "Gruplar", items: ["Grup 1"] }],
  },
  {
    id: "psikoloji",
    emoji: "🧠",
    title: "Minval Psikoloji",
    subtitle: "Psikoloji Okumaları",
    badges: ["Hanımlara Özel (16 yaş+)", "Ücretli (Detaylar için iletişime geçiniz)"],
    paid: true,
    quote: "Nefsini bilen, Rabbini bilir; fakat nefsi bilmek de bir ilim ve emek işidir.",
    description:
      "Modern psikoloji birikimini insanın manevi dünyasıyla birlikte okuyan atölye programı.",
    groups: [{ label: "Gruplar", items: ["Grup 1", "Grup 2", "Grup 3"] }],
  },
  {
    id: "genc",
    emoji: "🌱",
    title: "Minval Genç",
    subtitle: "Minval MAG",
    badges: ["Sadece Kız Öğrenciler", "Ücretsiz"],
    quote:
      "Genç akıl, henüz yönünü arayan bir pusuladır; ona ihtiyacı olan, dayatma değil, yol arkadaşlığıdır.",
    description: "Ortaokuldan üniversiteye, yaş gruplarına göre kurgulanmış gençlik halkaları.",
    groups: [
      { label: "Ortaokul", items: ["Grup 1", "Grup 2"] },
      { label: "Lise", items: ["Grup 1"] },
      { label: "Üniversite", items: ["Grup 1"] },
    ],
  },
  {
    id: "sanat",
    emoji: "🎨",
    title: "Minval Sanat",
    subtitle: "Yakında",
    badges: ["Yakında / Detaylar Eklenecek"],
    soon: true,
    quote: "Güzellik, hakikatin gözle görülen tercümesidir.",
    description: "Hat, ebru ve estetik üzerine atölyelerimiz hazırlanıyor.",
    groups: [],
  },
];

export const principles = [
  { title: "Risale-i Nur Tefekkürü", text: "İman hakikatlerini akıl ve kalp birlikteliğiyle müzakere eden bir okuma usulü." },
  { title: "Kur'an & Sünnet Rehberliği", text: "Bütün program ve okumaların ölçüsü; vahiy ve Sünnet-i Seniyye çizgisidir." },
  { title: "Bağımsız Duruş", text: "Hiçbir yapıya bağlı olmayan, ilmî ve gönüllü bir hareket olarak yol alıyoruz." },
  { title: "Şahsiyet Eğitimi", text: "Bilgiyi ahlaka dönüştüren, güzel ahlakı merkeze alan bir terbiye anlayışı." },
];
