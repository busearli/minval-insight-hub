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

export const workshopDetails: Record<
  string,
  {
    objectives: string[];
    overview: string;
    seatsLeft: number;
    syllabus: { week: string; title: string; text: string }[];
    instructorBio: { background: string; publications: string[] };
    readings: { required: string[]; recommended: string[] };
  }
> = {
  "varolusçu-edebiyat": {
    overview:
      "Varoluşçuluk yalnızca bir felsefe akımı değil, yirminci yüzyıl edebiyatının da nefes aldığı zemindir. Bu atölyede Kafka'dan Camus'ye, Sartre'dan Oğuz Atay'a uzanan hatta bireyin anlam arayışını, saçmayı ve sorumluluğu metinlerin kendi diliyle okuyoruz. Her hafta ortak bir metin etrafında toplanıyor, kısa yazma egzersizleriyle okumayı derinleştiriyoruz.",
    objectives: [
      "Varoluşçu düşüncenin temel kavramlarını edebi metinler üzerinden tanımak",
      "Yakın okuma (close reading) yöntemini pratikte uygulayabilmek",
      "Bir metnin felsefi arka planını kendi başına çözümleyebilmek",
      "Atölye tartışmasında kendi okumasını gerekçelendirerek savunabilmek",
    ],
    seatsLeft: 4,
    syllabus: [
      { week: "1. Hafta", title: "Kafka & Varoluş", text: "Dönüşüm ve Dava üzerinden yabancılaşmanın edebi kuruluşu." },
      { week: "2. Hafta", title: "Camus & Yabancılaşma", text: "Yabancı ve Sisifos Söyleni: saçma karşısında duruşlar." },
      { week: "3. Hafta", title: "Sartre & Özgürlük", text: "Bulantı ve seçim sorumluluğu; kötü niyet kavramı." },
      { week: "4. Hafta", title: "Dostoyevski & İnanç", text: "Yeraltından Notlar ve iradenin sınırları." },
      { week: "5. Hafta", title: "Oğuz Atay & Türkiye'de Varoluş", text: "Tutunamayanlar'da ironi, yalnızlık ve dil." },
      { week: "6. Hafta", title: "Kapanış Atölyesi", text: "Katılımcı metinlerinin ortak okuması ve değerlendirme." },
    ],
    instructorBio: {
      background:
        "Boğaziçi Üniversitesi Karşılaştırmalı Edebiyat bölümünde doktorasını tamamladı; modern roman ve varoluşçuluk ilişkisi üzerine dersler veriyor.",
      publications: [
        "Saçmanın Grameri: Camus ve Roman (2019)",
        "Tutunamayanlar'ı Yeniden Okumak (2022)",
        "Modern Anlatıda Yabancılaşma — makale derlemesi (2024)",
      ],
    },
    readings: {
      required: ["Franz Kafka — Dönüşüm", "Albert Camus — Yabancı", "Oğuz Atay — Tutunamayanlar (seçkiler)"],
      recommended: ["Jean-Paul Sartre — Bulantı", "Simone de Beauvoir — Belirsizliğin Ahlakı"],
    },
  },
};

export const defaultWorkshopDetail = {
  overview:
    "Bu atölye, konuyu haftalık ortak okumalar ve canlı tartışma oturumlarıyla derinlemesine ele alır. Her oturum öncesinde paylaşılan metinler üzerinden ilerlenir; katılımcılar kendi okumalarını sunmaya teşvik edilir.",
  objectives: [
    "Alanın temel kavram ve tartışmalarına hâkim olmak",
    "Birincil metinleri kendi başına çözümleyebilmek",
    "Disiplinlerarası bağlantılar kurabilmek",
    "Tartışmada kendi konumunu gerekçelendirebilmek",
  ],
  seatsLeft: 6,
  syllabus: [
    { week: "1. Hafta", title: "Giriş ve kavram haritası", text: "Alanın temel soruları ve ortak sözlük." },
    { week: "2. Hafta", title: "Birincil metinler", text: "Kurucu metinlerin yakın okuması." },
    { week: "3. Hafta", title: "Tartışmalar", text: "Karşıt yorumlar ve eleştiriler." },
    { week: "4. Hafta", title: "Kapanış", text: "Katılımcı sunumları ve genel değerlendirme." },
  ],
  instructorBio: {
    background: "Alanında uzun yıllardır ders veren, Minval'de düzenli atölye yürüten bir akademisyen.",
    publications: ["Seçilmiş makaleler ve derleme çalışmaları"],
  },
  readings: {
    required: ["Haftalık ortak metin seçkisi (PDF)"],
    recommended: ["Genişletilmiş okuma listesi (PDF)"],
  },
};

export type LibraryResource = {
  id: string;
  title: string;
  author: string;
  meta: string;
  category: "Haftalık PDF Metinler" | "Makaleler" | "E-Kitaplar" | "Ses Kayıtları / Podcastler";
  tags: string[];
};

export const libraryCategories = [
  "Tümü",
  "Haftalık PDF Metinler",
  "Makaleler",
  "E-Kitaplar",
  "Ses Kayıtları / Podcastler",
] as const;

export const libraryResources: LibraryResource[] = [
  {
    id: "r1",
    title: "Yorgunluk Toplumu — 1. Bölüm Seçkisi",
    author: "Byung-Chul Han",
    meta: "24 sayfa · 1.2 MB",
    category: "Haftalık PDF Metinler",
    tags: ["#Felsefe", "#ZorunluOkuma"],
  },
  {
    id: "r2",
    title: "Panoptikizm (Hapishanenin Doğuşu'ndan)",
    author: "Michel Foucault",
    meta: "31 sayfa · 860 KB",
    category: "Haftalık PDF Metinler",
    tags: ["#Felsefe", "#Gözetim"],
  },
  {
    id: "r3",
    title: "Saçmanın Grameri: Camus ve Roman",
    author: "Doç. Dr. Elif Karaman",
    meta: "18 sayfa · 640 KB",
    category: "Makaleler",
    tags: ["#Edebiyat", "#Varoluşçuluk"],
  },
  {
    id: "r4",
    title: "Modern Sanatta Kırılma: Manet'den Duchamp'a",
    author: "Dr. Ayşe Tunalı",
    meta: "22 sayfa · 3.1 MB",
    category: "Makaleler",
    tags: ["#SanatTarihi"],
  },
  {
    id: "r5",
    title: "Psikanalize Giriş — Ders Notları Kitapçığı",
    author: "Uzm. Psk. Mert Soydan",
    meta: "96 sayfa · 4.7 MB",
    category: "E-Kitaplar",
    tags: ["#Psikoloji", "#ZorunluOkuma"],
  },
  {
    id: "r6",
    title: "Tutunamayanlar Üzerine Notlar",
    author: "Doç. Dr. Elif Karaman",
    meta: "120 sayfa · 5.4 MB",
    category: "E-Kitaplar",
    tags: ["#Edebiyat"],
  },
  {
    id: "r7",
    title: "Minval Sohbetleri #12: Etik ve Gündelik Hayat",
    author: "Prof. Dr. Necmi Aydın",
    meta: "48 dk · 44 MB",
    category: "Ses Kayıtları / Podcastler",
    tags: ["#Felsefe", "#Podcast"],
  },
  {
    id: "r8",
    title: "Minval Sohbetleri #13: Şiirde İmge",
    author: "Yrd. Doç. Dr. Selin Peker",
    meta: "39 dk · 36 MB",
    category: "Ses Kayıtları / Podcastler",
    tags: ["#Edebiyat", "#Podcast"],
  },
];
