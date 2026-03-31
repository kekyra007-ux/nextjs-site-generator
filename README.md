# Генератор статических сайтов на Next.js

CLI-инструмент для создания готовых к продакшену многоязычных сайтов на Next.js через интерактивный мастер настройки. Подходит для быстрого запуска маркетинговых сайтов, лендингов и контент-платформ.

## Возможности

- **Интерактивный CLI** — пошаговая настройка проекта: домен, бренд, GEO, страницы, секции, цветовая тема
- **Next.js 14+ / App Router** — статическая генерация (SSG) для максимальной производительности
- **TypeScript + styled-components** — типизированные компоненты и полностью настраиваемая дизайн-система
- **Многоязычность (i18n)** — next-i18next с поддержкой EN, Filipino (TL), Bengali (BN), Vietnamese (VI)
- **Интеграция с OpenAI API** — автоматическая генерация SEO-метаданных, hero-текстов и контента секций через GPT
- **Умное кеширование** — кеш ответов API для снижения количества запросов и расходов
- **5 цветовых тем** — Dark, Light, Sport, Green, Burgundy, полностью настраиваемые
- **10+ компонентов секций** — Hero, FeatureGrid, FAQ, CTA, OfferSection, ItemsList, PaymentMethods, HowToPlay, ContentShowcase и другие
- **Автогенерация SEO-файлов** — `robots.txt` и `sitemap.xml` с поддержкой hreflang

## Tech Stack

| Layer       | Technology                              |
| ----------- | --------------------------------------- |
| Framework   | Next.js 14 (Pages Router + SSG)         |
| Language    | TypeScript                              |
| Styling     | styled-components + custom theme system |
| i18n        | next-i18next                            |
| Content API | OpenAI GPT (gpt-4 / gpt-4o-mini)        |
| Runtime     | Node.js                                 |

## Project Structure

```
├── generator.js          # Interactive CLI wizard
├── orchestrator.js       # Main pipeline runner
├── lib/
│   ├── content-generator.js    # OpenAI integration + caching
│   ├── placeholder-generator.js
│   ├── file-generator.js       # Template engine
│   ├── seo-generator.js        # robots.txt + sitemap
│   ├── project-builder.js
│   ├── config-validator.js
│   └── color-themes.js
├── templates/
│   ├── components/       # TSX component templates
│   ├── pages/            # Page templates
│   ├── styles/           # Theme + GlobalStyle
│   └── scripts/
├── config/
│   ├── standard-pages.json
│   ├── page-sections.json
│   └── geo-presets.json
└── output/               # Generated projects (git-ignored)
```

## Быстрый старт

### 1. Установка зависимостей

```bash
npm install
```

### 2. stub mode — API key

```bash
node orchestrator.js
```

Ответь на вопросы:

- Project name (e.g. `my-site`)
- Domain (e.g. `https://my-site.com`)
- Brand name
- GEO / locales
- Pages and sections to include
- Color theme

Сгенерированный проект появится в папке output/<project-name>/.

### 3. Build and run the generated site

```bash
cd output/my-site
npm install
npm run dev
```

Open `http://localhost:3000`

---

## Режим генерации контента через ИИ

Чтобы генерировать реальный контент через OpenAI (вместо заглушек):

### Настройка

````bash
cp .env.example .env
# Укажи OPENAI_API_KEY

### Run

```bash
CONTENT_MODE=ai node orchestrator.js
````

Генератор:

1. Обратится к GPT для создания SEO-метаданных, hero-текста и контента всех выбранных секций на английском
2. Переведёт всё на остальные настроенные локали
3. Закеширует все ответы

| Variable                   | Description                  | Default       |
| -------------------------- | ---------------------------- | ------------- |
| `CONTENT_MODE`             | `stub` or `ai`               | `stub`        |
| `OPENAI_API_KEY`           | OpenAI secret key            | —             |
| `OPENAI_MODEL`             | Model for content generation | `gpt-4`       |
| `OPENAI_TRANSLATION_MODEL` | Model for translation        | `gpt-4o-mini` |
| `ENABLE_CACHE`             | Cache API responses          | `true`        |
| `CACHE_TTL_DAYS`           | Cache lifetime in days       | `30`          |

---

```
output/my-site/
├── src/
│   ├── pages/[locale]/        # One page file per route
│   ├── components/
│   │   ├── SharedHero/
│   │   ├── Sections/
│   │   │   ├── FeatureGrid/
│   │   │   ├── FaqBlock/
│   │   │   ├── OfferSection/
│   │   │   ├── ItemsList/
│   │   │   └── ...
│   │   ├── Header/
│   │   └── Footer/
│   ├── styles/
│   │   ├── theme.js           # Generated from selected color theme
│   │   └── GlobalStyle.js
│   └── config/
│       ├── pageSpec.json      # Page → sections mapping
│       └── siteSettings.json
└── public/
    ├── locales/
    │   ├── en/common.json
    │   └── tl/common.json
    ├── robots.txt
    └── sitemap.xml
```

---

## Available Pages

| Key        | Slug        | Description           |
| ---------- | ----------- | --------------------- |
| `home`     | `/`         | Homepage              |
| `products` | `/products` | Products and services |
| `services` | `/services` | Our services          |
| `events`   | `/events`   | Events and updates    |
| `offers`   | `/offers`   | Special offers        |
| `login`    | `/login`    | Login                 |
| `register` | `/register` | Registration          |
| `app`      | `/app`      | Mobile app download   |
| `link`     | `/link`     | Alternative link      |

## Available Sections

| Key               | Component       | Description              |
| ----------------- | --------------- | ------------------------ |
| `homeArticle`     | HomeArticle     | Rich article block       |
| `featureGrid`     | FeatureGrid     | Benefits / features grid |
| `faqBlock`        | FaqBlock        | Accordion FAQ            |
| `ctaBlock`        | CtaBlock        | Call to action           |
| `offerSection`    | OfferSection    | Promotional offer cards  |
| `paymentMethods`  | PaymentMethods  | Payment options          |
| `itemsList`       | ItemsList       | Product / service cards  |
| `howToPlay`       | HowToPlay       | Step-by-step guide       |
| `contentShowcase` | ContentShowcase | Rich editorial block     |
| `appFeatures`     | AppFeatures     | Mobile app highlights    |
| `downloadLinks`   | DownloadLinks   | App store buttons        |


