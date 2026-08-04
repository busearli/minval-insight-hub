import philosophy from "@/assets/w-philosophy.jpg";
import literature from "@/assets/w-literature.jpg";
import art from "@/assets/w-art.jpg";
import psychology from "@/assets/w-psychology.jpg";

export type Workshop = {
  id: string;
  title: string;
  category: "Felsefe & Düşünce" | "Edebiyat & Yazarlık" | "Sanat Tarihi" | "Psikoloji";
  badge: string;
  instructor: string;
  academicTitle: string;
  schedule: string;
  price: string;
  image: string;
  summary: string;
};

export const workshops: Workshop[] = [
  {
    id: "varolusçu-edebiyat",
    title: "Varoluşçu Edebiyat Okumaları",
    category: "Edebiyat & Yazarlık",
    badge: "6 Haftalık Atölye",
    instructor: "Doç. Dr. Elif Karaman",
    academicTitle: "Karşılaştırmalı Edebiyat",
    schedule: "Salı 20.00 – 21.30 · 14 Ekim başlangıçlı",
    price: "3.200 ₺",
    image: literature,
    summary:
      "Camus, Sartre ve Oğuz Atay'ın metinleri üzerinden bireyin anlam arayışını yakın okuma yöntemiyle inceliyoruz.",
  },
  {
    id: "cagdas-felsefe",
    title: "Çağdaş Felsefe Okumaları",
    category: "Felsefe & Düşünce",
    badge: "8 Haftalık Atölye",
    instructor: "Prof. Dr. Necmi Aydın",
    academicTitle: "Felsefe Tarihi",
    schedule: "Perşembe 20.00 – 21.30 · 9 Ekim başlangıçlı",
    price: "3.800 ₺",
    image: philosophy,
    summary:
      "Foucault'dan Byung-Chul Han'a; iktidar, özne ve yorgunluk kavramlarını çağdaş metinler eşliğinde tartışıyoruz.",
  },
  {
    id: "modern-sanat",
    title: "Modern Sanatın Kırılma Anları",
    category: "Sanat Tarihi",
    badge: "5 Haftalık Seminer",
    instructor: "Dr. Ayşe Tunalı",
    academicTitle: "Sanat Tarihi",
    schedule: "Cumartesi 14.00 – 16.00 · 11 Ekim başlangıçlı",
    price: "2.900 ₺",
    image: art,
    summary:
      "Empresyonizmden kavramsal sanata uzanan hatta, sanatın kendi kurallarını nasıl yıktığını izliyoruz.",
  },
  {
    id: "psikanaliz-giris",
    title: "Psikanalize Giriş: Arzu ve Dil",
    category: "Psikoloji",
    badge: "4 Haftalık Atölye",
    instructor: "Uzm. Psk. Mert Soydan",
    academicTitle: "Klinik Psikoloji",
    schedule: "Pazartesi 19.30 – 21.00 · 6 Ekim başlangıçlı",
    price: "2.400 ₺",
    image: psychology,
    summary:
      "Freud ve Lacan'ın temel kavramlarını vaka örnekleri ve edebî metinlerle birlikte ele alıyoruz.",
  },
  {
    id: "siir-atolyesi",
    title: "Şiir Yazma Atölyesi: İmgenin Grameri",
    category: "Edebiyat & Yazarlık",
    badge: "6 Haftalık Atölye",
    instructor: "Yrd. Doç. Dr. Selin Peker",
    academicTitle: "Türk Dili ve Edebiyatı",
    schedule: "Çarşamba 20.00 – 21.30 · 15 Ekim başlangıçlı",
    price: "2.700 ₺",
    image: literature,
    summary:
      "Kendi şiirinizi kurarken imge, ritim ve sessizliğin işlevini atölye eleştirisiyle birlikte çalışıyoruz.",
  },
  {
    id: "etik-tartismalar",
    title: "Gündelik Hayatın Etiği",
    category: "Felsefe & Düşünce",
    badge: "4 Haftalık Seminer",
    instructor: "Prof. Dr. Necmi Aydın",
    academicTitle: "Felsefe Tarihi",
    schedule: "Pazar 11.00 – 12.30 · 12 Ekim başlangıçlı",
    price: "2.200 ₺",
    image: philosophy,
    summary:
      "Aristoteles'ten Levinas'a, sıradan kararlarımızın ardındaki ahlaki zemini birlikte sorguluyoruz.",
  },
];

export const categories = [
  "Tümü",
  "Felsefe & Düşünce",
  "Edebiyat & Yazarlık",
  "Sanat Tarihi",
  "Psikoloji",
] as const;

export const instructors = [
  {
    name: "Prof. Dr. Necmi Aydın",
    field: "Felsefe Tarihi",
    bio: "Otuz yılı aşkın süredir çağdaş Kıta felsefesi üzerine çalışıyor; Minval'de iki atölye yürütüyor.",
    courses: ["Çağdaş Felsefe Okumaları", "Gündelik Hayatın Etiği"],
    initials: "NA",
  },
  {
    name: "Doç. Dr. Elif Karaman",
    field: "Karşılaştırmalı Edebiyat",
    bio: "Modern roman ve varoluşçuluk ilişkisi üzerine yayınları bulunuyor; yakın okuma yönteminin savunucusu.",
    courses: ["Varoluşçu Edebiyat Okumaları"],
    initials: "EK",
  },
  {
    name: "Dr. Ayşe Tunalı",
    field: "Sanat Tarihi",
    bio: "Müze eğitimi ve modern sanat tarihi alanında çalışıyor; seminerlerini görsel arşivlerle kuruyor.",
    courses: ["Modern Sanatın Kırılma Anları"],
    initials: "AT",
  },
  {
    name: "Uzm. Psk. Mert Soydan",
    field: "Klinik Psikoloji",
    bio: "Psikanalitik yönelimli klinik pratiğini edebiyat okumalarıyla birlikte sürdürüyor.",
    courses: ["Psikanalize Giriş: Arzu ve Dil"],
    initials: "MS",
  },
];

export const values = [
  {
    title: "Derinlikli Okuma",
    text: "Hızlı tüketim yerine metnin kendisiyle kalmayı; satır aralarında yavaşlamayı öneriyoruz.",
  },
  {
    title: "Disiplinlerarası Düşünce",
    text: "Felsefe, edebiyat, sanat ve psikolojiyi aynı masada buluşturan bir düşünme biçimi kuruyoruz.",
  },
  {
    title: "Nitelikli Topluluk",
    text: "Sınırlı kontenjanlı atölyelerde, birbirini dinleyen ve tartışabilen bir topluluk oluşturuyoruz.",
  },
];
