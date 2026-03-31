# Next.js Static Site Generator

A CLI tool for generating production-ready multilingual Next.js sites from an interactive configuration wizard. Designed for fast deployment of marketing sites, landing pages, and content platforms.

## Features

- **Interactive CLI** — step-by-step project setup: domain, brand, GEO, pages, sections, color theme
- **Next.js 14+ / App Router** — static site generation (SSG) for maximum performance
- **TypeScript + styled-components** — typed components with a fully themeable design system
- **Multilingual (i18n)** — next-i18next with support for EN, Filipino (TL), Bengali (BN), Vietnamese (VI)
- **OpenAI API integration** — automated SEO metadata, hero copy and section content generation via GPT
- **Smart caching** — API response cache to avoid redundant requests and reduce costs
- **5 color themes** — Dark, Light, Sport, Green, Burgundy, each fully customizable
- **10+ section components** — Hero, FeatureGrid, FAQ, CTA, OfferSection, ItemsList, PaymentMethods, HowToPlay, ContentShowcase and more
- **Auto-generated SEO files** — `robots.txt` and `sitemap.xml` with hreflang support

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (Pages Router + SSG) |
| Language | TypeScript |
| Styling | styled-components + custom theme system |
| i18n | next-i18next |
| Content API | OpenAI GPT (gpt-4 / gpt-4o-mini) |
| Runtime | Node.js |

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

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Generate a project (stub mode — no API key needed)

```bash
node orchestrator.js
```

Answer the prompts:
- Project name (e.g. `my-site`)
- Domain (e.g. `https://my-site.com`)
- Brand name
- GEO / locales
- Pages and sections to include
- Color theme

The generated project lands in `output/<project-name>/`.

### 3. Build and run the generated site

```bash
cd output/my-site
npm install
npm run dev
```

Open `http://localhost:3000`

---

## AI Content Mode

To generate real copy via OpenAI instead of placeholders:

### Setup

```bash
cp .env.example .env
# Fill in OPENAI_API_KEY
```

### Run

```bash
CONTENT_MODE=ai node orchestrator.js
```

The generator will:
1. Call GPT to write SEO metadata, hero copy and all selected section content in English
2. Translate everything to the other configured locales
3. Cache all responses (re-runs are instant and free)

### Environment variables

| Variable | Description | Default |
|---|---|---|
| `CONTENT_MODE` | `stub` or `ai` | `stub` |
| `OPENAI_API_KEY` | OpenAI secret key | — |
| `OPENAI_MODEL` | Model for content generation | `gpt-4` |
| `OPENAI_TRANSLATION_MODEL` | Model for translation | `gpt-4o-mini` |
| `ENABLE_CACHE` | Cache API responses | `true` |
| `CACHE_TTL_DAYS` | Cache lifetime in days | `30` |

---

## Generated Project Structure

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

| Key | Slug | Description |
|---|---|---|
| `home` | `/` | Homepage |
| `products` | `/products` | Products and services |
| `services` | `/services` | Our services |
| `events` | `/events` | Events and updates |
| `offers` | `/offers` | Special offers |
| `login` | `/login` | Login |
| `register` | `/register` | Registration |
| `app` | `/app` | Mobile app download |
| `link` | `/link` | Alternative link |

## Available Sections

| Key | Component | Description |
|---|---|---|
| `homeArticle` | HomeArticle | Rich article block |
| `featureGrid` | FeatureGrid | Benefits / features grid |
| `faqBlock` | FaqBlock | Accordion FAQ |
| `ctaBlock` | CtaBlock | Call to action |
| `offerSection` | OfferSection | Promotional offer cards |
| `paymentMethods` | PaymentMethods | Payment options |
| `itemsList` | ItemsList | Product / service cards |
| `howToPlay` | HowToPlay | Step-by-step guide |
| `contentShowcase` | ContentShowcase | Rich editorial block |
| `appFeatures` | AppFeatures | Mobile app highlights |
| `downloadLinks` | DownloadLinks | App store buttons |

---

## License

MIT
