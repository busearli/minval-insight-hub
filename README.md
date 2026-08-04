# Minval Spark

# Minval Akademi & LMS Web Uygulaması için Lovable Prompt Rehberi

Lovable üzerinde Minval Akademi'nin özgün kimliğini yansıtan; hem dışa dönük akademi/atölye tanıtımını hem de kayıtlı katılımcılar için LMS/öğrenci panelini içeren web uygulaması promptu.

---

## 1. Başlangıç (Master) Promptu

*(Lovable sohbet kutusuna doğrudan kopyalayıp yapıştırabilirsiniz)*

```text

Create a sophisticated, elegant, and modern full-stack React application using Tailwind CSS and Lucide icons for "Minval Akademi" (inspired by a warm, cultural, academic, and intellectual atmosphere).

The platform blends traditional warm aesthetics (intellectual cafe/academy vibe) with modern educational technology.

Include a global view switcher in the top navigation bar for testing purposes: "Akademi Tanıtım Sitesi" (Public Site) and "Katılımcı / Öğrenci Paneli" (LMS Portal).

---

### DESIGN SYSTEM & COLOR PALETTE (Minval Theme):

- **Atmosphere:** Warm, intellectual, cultural, minimalist, and serene.

- **Backgrounds:** Cream / Warm Off-White (`#FDFBF7`), Soft Beige (`#F5EFEB`), and Rich Charcoal Brown (`#1C1917`) for contrast.

- **Primary Accent Colors:** Terracotta / Warm Rust (`#C2593F`), Deep Earth Brown (`#4A3525`), Sage Green (`#6B7A63`).

- **Typography Style:** Serif headings (e.g., Playfair Display or Georgia feeling) for titles to give an editorial/academic touch, combined with clean Sans-Serif for readable body copy.

---

### VIEW 1: MINVAL AKADEMİ PUBLIC LANDING PAGE

1. **Header / Navigation:**

   - Brand Logo: "M İ N V A L" (Subtext: "Akademi & Düşünce").

   - Nav Links: Atölyeler & Seminerler, Eğitmenlerimiz, Minval Felsefesi, Yayınlar / Blog, İletişim.

   - Action Buttons: "Katılımcı Girişi" and accent button "Atölyelere Göz At".

2. **Hero Section:**

   - Editorial Headline: "Kültür, Sanat ve Düşüncenin Derinliklerine Yolculuk."

   - Subtitle: "Felsefeden edebiyata, psikolojiden sosyolojiye uzman akademisyenler eşliğinde derinleşen interaktif atölyeler."

   - Action Buttons: "Güz Dönemi Atölyeleri" & "Minval Kimdir?".

   - Visual: Warm aesthetic grid or mockup showing an active workshop session and cozy study atmosphere.

3. **Values / Manifesto Section (Minval Felsefesi):**

   - 3 minimalist cards explaining the core values: "Derinlikli Okuma", "Disiplinlerarası Düşünce", "Nitelikli Topluluk".

4. **Active Workshops & Seminars (Atölye Kataloğu):**

   - Filter Tabs: All, Felsefe & Düşünce, Edebiyat & Yazarlık, Sanat Tarihi, Psikoloji.

   - Workshop Cards feature: Warm image, Category Tag (e.g. "4 Haftalık Atölye"), Title (e.g., "Varoluşçu Edebiyat Okumaları"), Instructor Name & Academic Title, Dates/Schedule, Price, and "Detay ve Kayıt" button.

5. **Instructors / Academicians Section (Eğitmenlerimiz):**

   - Profile cards featuring esteemed academics, bio snippets, and their active courses.

6. **Minval Kahve & Mekan Touch (Subtle Footer Note):**

   - A tasteful small section mentioning the physical space: "Akademik derinliği yüz yüze kahve sohbetleriyle buluşturan fiziksel mekanımızda da sizleri ağırlıyoruz."

7. **Footer:**

   - E-bulletin subscription, social media links (Instagram focus), contact details, and address.

---

### VIEW 2: KATILIMCI / ÖĞRENCİ LMS PORTALI

1. **Sidebar Navigation:**

   - Minimalist warm sidebar: "Genel Bakış", "Kayıtlı Atölyelerim", "Canlı Oturumlar (Zoom)", "Ders Notları & Okumalar", "Soru & Tartışma Panosu", "Sertifikalarım".

2. **Dashboard Overview Page:**

   - Greeting Banner: "Hoş Geldiniz, Zeynep Hanım 🌿"

   - Active Workshop Progress Card: "Çağdaş Felsefe Okumaları" - Next session badge ("Bu Perşembe 20:00 - Canlı Yayın").

   - Recommended Reading List (Haftalık Okuma Listesi) with downloadable PDF icons.

   - Notice Board (Akademi Duyuruları).

3. **Course / Workshop Classroom View:**

   - Layout: Main Content (Video replay of past session OR PDF reading material) + Right Panel (Curriculum & Reading Schedule).

   - Below Content Tabs:

     - "Haftalık Okuma Metinleri & PDF'ler"

     - "Ders Kaydı (Tekrar İzle)"

     - "Atölye Tartışma Forumu (Katılımcı Yorumları)"

---

### GENERAL REQUIREMENTS:

- Fully responsive and mobile-optimized layout.

- Use realistic Turkish dummy data related to humanities, philosophy, literature, and art workshops.

- Smooth transitions, elegant borders, and clean spacing.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/72171efe-a32c-4345-9429-58f61f52be78).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
