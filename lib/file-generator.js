/**
 * File Generator
 * Processes templates and generates project files
 */

const fs = require("fs");
const path = require("path");

class FileGenerator {
  constructor(config, projectPath, templatesDir) {
    this.config = config;
    this.projectPath = projectPath;
    this.templatesDir = templatesDir;
  }

  /**
   * Apply template variables
   */
  applyTemplate(template, vars) {
    let result = template;
    for (const [key, value] of Object.entries(vars)) {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
      result = result.replace(regex, value);
    }
    return result;
  }

  /**
   * Get template variables
   */
  getTemplateVars() {
    const currentYear = new Date().getFullYear();

    return {
      // Project
      projectName: this.config.project.name,
      baseUrl: this.config.project.baseUrl,
      brandName: this.config.project.brandName,
      keywords: this.config.project.keywords,

      // GEO
      geoCountry: this.config.geo.name || '',
      geoCode: this.config.geo.code || '',
      geoCoords: `${this.config.geo.coordinates?.latitude || ''};${this.config.geo.coordinates?.longitude || ''}`,

      // Locales
      defaultLocale: this.config.geo.defaultLocale,
      localesArray: JSON.stringify(this.config.geo.locales),
      ogLocaleMap: JSON.stringify(this.config.geo.ogLocales),
      localeNamesMap: JSON.stringify(this.config.geo.localeNames),

      // Time
      year: currentYear,

      // Theme colors (will be replaced with actual theme)
      primaryColor: "#E59B4E",
      secondaryColor: "#6E1640",

      // Paths
      getStaticPath: "../../../lib/getStatic",
      headerPath: "../../components/Header/Header",
      footerPath: "../../components/Footer/Footer",
      heroPath: "../../components/SharedHero/SharedHero",

      // Pages for navigation (только ключи страниц)
      pagesArray: JSON.stringify(
        (this.config.pages || [{ key: "index" }, { key: "products" }]).map(
          (p) => p.key,
        ),
      ),
      locales: this.config.geo.locales,
    };
  }

  /**
   * Generate component files
   */
  generateComponents() {
    const vars = this.getTemplateVars();
    const componentsDir = path.join(this.projectPath, "src", "components");

    // Создаем подпапки для компонентов
    const headerDir = path.join(componentsDir, "Header");
    const footerDir = path.join(componentsDir, "Footer");
    const heroDir = path.join(componentsDir, "SharedHero");
    const linkDir = path.join(componentsDir, "Link");
    const uiDir = path.join(componentsDir, "UI");
    const langSwitcherDir = path.join(componentsDir, "LanguageSwitcher");

    const sectionsDir = path.join(componentsDir, "Sections");
    const featureGridDir = path.join(sectionsDir, "FeatureGrid");
    const faqBlockDir = path.join(sectionsDir, "FaqBlock");
    const ctaBlockDir = path.join(sectionsDir, "CtaBlock");
    const offerSectionDir = path.join(sectionsDir, "OfferSection");
    const paymentMethodsDir = path.join(sectionsDir, "PaymentMethods");
    const howToPlayDir = path.join(sectionsDir, "HowToPlay");
    const itemsListDir = path.join(sectionsDir, "ItemsList");
    const contentShowcaseDir = path.join(sectionsDir, "ContentShowcase");

    // HomeArticle
    const homeArticleDir = path.join(sectionsDir, "HomeArticle");
    if (!fs.existsSync(homeArticleDir)) {
      fs.mkdirSync(homeArticleDir, { recursive: true });
    }

    const homeArticleTemplate = fs.readFileSync(
      path.join(this.templatesDir, "components", "HomeArticle.tsx.template"),
      "utf8",
    );

    fs.writeFileSync(
      path.join(homeArticleDir, "HomeArticle.tsx"),
      this.applyTemplate(homeArticleTemplate, vars),
    );

    if (!fs.existsSync(featureGridDir))
      fs.mkdirSync(featureGridDir, { recursive: true });
    if (!fs.existsSync(faqBlockDir))
      fs.mkdirSync(faqBlockDir, { recursive: true });
    if (!fs.existsSync(ctaBlockDir))
      fs.mkdirSync(ctaBlockDir, { recursive: true });
    if (!fs.existsSync(offerSectionDir))
      fs.mkdirSync(offerSectionDir, { recursive: true });
    if (!fs.existsSync(paymentMethodsDir))
      fs.mkdirSync(paymentMethodsDir, { recursive: true });
    if (!fs.existsSync(howToPlayDir))
      fs.mkdirSync(howToPlayDir, { recursive: true });
    if (!fs.existsSync(itemsListDir))
      fs.mkdirSync(itemsListDir, { recursive: true });
    if (!fs.existsSync(contentShowcaseDir))
      fs.mkdirSync(contentShowcaseDir, { recursive: true });

    if (!fs.existsSync(headerDir)) fs.mkdirSync(headerDir, { recursive: true });
    if (!fs.existsSync(footerDir)) fs.mkdirSync(footerDir, { recursive: true });
    if (!fs.existsSync(heroDir)) fs.mkdirSync(heroDir, { recursive: true });
    if (!fs.existsSync(linkDir)) fs.mkdirSync(linkDir, { recursive: true });
    if (!fs.existsSync(uiDir)) fs.mkdirSync(uiDir, { recursive: true });
    if (!fs.existsSync(langSwitcherDir))
      fs.mkdirSync(langSwitcherDir, { recursive: true });

    // Header
    const headerTemplate = fs.readFileSync(
      path.join(this.templatesDir, "components", "Header.tsx.template"),
      "utf8",
    );
    fs.writeFileSync(
      path.join(headerDir, "Header.tsx"),
      this.applyTemplate(headerTemplate, vars),
    );

    // Footer
    const footerTemplate = fs.readFileSync(
      path.join(this.templatesDir, "components", "Footer.tsx.template"),
      "utf8",
    );
    fs.writeFileSync(
      path.join(footerDir, "Footer.tsx"),
      this.applyTemplate(footerTemplate, vars),
    );

    // SharedHero
    const heroTemplate = fs.readFileSync(
      path.join(this.templatesDir, "components", "SharedHero.tsx.template"),
      "utf8",
    );
    fs.writeFileSync(
      path.join(heroDir, "SharedHero.tsx"),
      this.applyTemplate(heroTemplate, vars),
    );

    // Link
    const linkTemplate = fs.readFileSync(
      path.join(this.templatesDir, "components", "Link.tsx.template"),
      "utf8",
    );
    fs.writeFileSync(
      path.join(linkDir, "Link.tsx"),
      this.applyTemplate(linkTemplate, vars),
    );

    // Button (UI)
    const buttonTemplate = fs.readFileSync(
      path.join(this.templatesDir, "components", "Button.tsx.template"),
      "utf8",
    );
    fs.writeFileSync(
      path.join(uiDir, "Button.tsx"),
      this.applyTemplate(buttonTemplate, vars),
    );

    // LanguageSwitcher
    const langSwitcherTemplate = fs.readFileSync(
      path.join(
        this.templatesDir,
        "components",
        "LanguageSwitcher.tsx.template",
      ),
      "utf8",
    );
    fs.writeFileSync(
      path.join(langSwitcherDir, "LanguageSwitcher.tsx"),
      this.applyTemplate(langSwitcherTemplate, vars),
    );

    // FeatureGrid
    const featureGridTemplate = fs.readFileSync(
      path.join(this.templatesDir, "components", "FeatureGrid.tsx.template"),
      "utf8",
    );
    fs.writeFileSync(
      path.join(featureGridDir, "FeatureGrid.tsx"),
      this.applyTemplate(featureGridTemplate, vars),
    );

    // FaqBlock
    const faqBlockTemplate = fs.readFileSync(
      path.join(this.templatesDir, "components", "FaqBlock.tsx.template"),
      "utf8",
    );
    fs.writeFileSync(
      path.join(faqBlockDir, "FaqBlock.tsx"),
      this.applyTemplate(faqBlockTemplate, vars),
    );

    // CtaBlock
    const ctaBlockTemplate = fs.readFileSync(
      path.join(this.templatesDir, "components", "CtaBlock.tsx.template"),
      "utf8",
    );
    fs.writeFileSync(
      path.join(ctaBlockDir, "CtaBlock.tsx"),
      this.applyTemplate(ctaBlockTemplate, vars),
    );

    // OfferSection
    const offerSectionTemplate = fs.readFileSync(
      path.join(this.templatesDir, "components", "OfferSection.tsx.template"),
      "utf8",
    );
    fs.writeFileSync(
      path.join(offerSectionDir, "OfferSection.tsx"),
      this.applyTemplate(offerSectionTemplate, vars),
    );

    // PaymentMethods
    const paymentMethodsTemplate = fs.readFileSync(
      path.join(this.templatesDir, "components", "PaymentMethods.tsx.template"),
      "utf8",
    );
    fs.writeFileSync(
      path.join(paymentMethodsDir, "PaymentMethods.tsx"),
      this.applyTemplate(paymentMethodsTemplate, vars),
    );

    // HowToPlay
    const howToPlayTemplate = fs.readFileSync(
      path.join(this.templatesDir, "components", "HowToPlay.tsx.template"),
      "utf8",
    );
    fs.writeFileSync(
      path.join(howToPlayDir, "HowToPlay.tsx"),
      this.applyTemplate(howToPlayTemplate, vars),
    );

    // ItemsList
    const itemsListTemplate = fs.readFileSync(
      path.join(this.templatesDir, "components", "ItemsList.tsx.template"),
      "utf8",
    );
    fs.writeFileSync(
      path.join(itemsListDir, "ItemsList.tsx"),
      this.applyTemplate(itemsListTemplate, vars),
    );

    // ContentShowcase
    const contentShowcaseTemplate = fs.readFileSync(
      path.join(this.templatesDir, "components", "ContentShowcase.tsx.template"),
      "utf8",
    );
    fs.writeFileSync(
      path.join(contentShowcaseDir, "ContentShowcase.tsx"),
      this.applyTemplate(contentShowcaseTemplate, vars),
    );

    console.log("✅ Компоненты созданы");
  }

  /**
   * Generate page files
   */
  generatePages() {
    const vars = this.getTemplateVars();
    const pagesDir = path.join(this.projectPath, "src", "pages");
    const localeDir = path.join(pagesDir, "[locale]");

    // _app.tsx
    const appTemplate = fs.readFileSync(
      path.join(this.templatesDir, "pages", "_app.tsx.template"),
      "utf8",
    );
    fs.writeFileSync(
      path.join(pagesDir, "_app.tsx"),
      this.applyTemplate(appTemplate, vars),
    );

    // _document.tsx
    const documentTemplate = fs.readFileSync(
      path.join(this.templatesDir, "pages", "_document.tsx.template"),
      "utf8",
    );
    fs.writeFileSync(
      path.join(pagesDir, "_document.tsx"),
      this.applyTemplate(documentTemplate, vars),
    );

    // Page template
    const pageTemplate = fs.readFileSync(
      path.join(this.templatesDir, "pages", "page.tsx.template"),
      "utf8",
    );

    // Generate pages
    for (const pageKey of this.config.pages) {
      // Ensure pageKey is a string
      const pageKeyStr = typeof pageKey === 'string' ? pageKey : pageKey.key || String(pageKey);
      
      const pageVars = {
        ...vars,
        pageKey: pageKeyStr,
        PageName: pageKeyStr.charAt(0).toUpperCase() + pageKeyStr.slice(1),
      };

      const pageContent = this.applyTemplate(pageTemplate, pageVars);

      if (pageKeyStr === 'home') {
        fs.writeFileSync(path.join(localeDir, "index.tsx"), pageContent);
      } else {
        fs.writeFileSync(path.join(localeDir, `${pageKeyStr}.tsx`), pageContent);
      }
    }

    console.log(`✅ Страницы созданы (${this.config.pages.length} страниц)`);
  }

  /**
   * Generate runtime config files used by pages/components.
   * - src/config/pageSpec.json: pageKey -> sectionKeys[]
   * - src/config/siteSettings.json: project-wide settings (e.g. referralLink)
   */
  generateConfigFiles() {
    const configDir = path.join(this.projectPath, "src", "config");
    if (!fs.existsSync(configDir)) fs.mkdirSync(configDir, { recursive: true });

    // pageSpec.json
    const pageSpec = {};
    for (const p of this.config.pages) {
      pageSpec[p.key] = Array.isArray(this.config.pageSections?.[p.key])
        ? this.config.pageSections[p.key]
        : [];
    }
    fs.writeFileSync(
      path.join(configDir, "pageSpec.json"),
      JSON.stringify(pageSpec, null, 2),
      "utf8",
    );

    // siteSettings.json (future use for CTA/referral, etc.)
    const siteSettings = {
      brandName: this.config.project?.brandName || "",
      baseUrl: this.config.project?.baseUrl || "",
      referralLink: this.config.project?.referralLink || "",
      geo: this.config.geo?.code || "",
    };
    fs.writeFileSync(
      path.join(configDir, "siteSettings.json"),
      JSON.stringify(siteSettings, null, 2),
      "utf8",
    );

    console.log("✅ src/config/*.json созданы (pageSpec, siteSettings)");
  }

  /**
   * Generate styles
   */
  generateStyles() {
    const { getTheme } = require("./color-themes");
    const theme = getTheme(this.config.theme || "dark");

    const vars = {
      ...this.getTemplateVars(),
      primaryColor: theme.colors.primary,
      secondaryColor: theme.colors.secondary,
    };

    const stylesDir = path.join(this.projectPath, "src", "styles");

    // GlobalStyle.js
    const globalStyleTemplate = fs.readFileSync(
      path.join(this.templatesDir, "styles", "GlobalStyle.js.template"),
      "utf8",
    );
    fs.writeFileSync(
      path.join(stylesDir, "GlobalStyle.js"),
      this.applyTemplate(globalStyleTemplate, vars),
    );

    // theme.js - создаем напрямую из выбранной темы
    const themeContent = `export const colors = ${JSON.stringify(theme.colors, null, 2)};

export const gradients = ${JSON.stringify(theme.gradients, null, 2)};

const font = {
  family: {
    primary:
      "Anybody, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    heading:
      "Anybody, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    code: "'Source Code Pro', monospace",
    button: "Anybody, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  size: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "2rem",
    "3xl": "3rem",
    "4xl": "3.5rem",
    "5xl": "4rem",
  },
  weight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 900,
  },
};

const spacing = {
  xs: "0.25rem",
  sm: "0.5rem",
  md: "1rem",
  lg: "1.5rem",
  xl: "2rem",
  "2xl": "3rem",
  "3xl": "4rem",
  "4xl": "6rem",
};

const radii = {
  sm: "0.25rem",
  md: "0.5rem",
  lg: "0.75rem",
  xl: "1rem",
  "2xl": "1.5rem",
  full: "9999px",
};

const shadow = {
  sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
  "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  glow: "0 0 20px rgba(255, 215, 0, 0.5)",
};

const container = {
  maxWidth: "1200px",
  padding: "1rem",
};

const breakpoints = {
  xs: "480px",
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
};

const mq = {
  xs: \`@media (min-width: \${breakpoints.xs})\`,
  sm: \`@media (min-width: \${breakpoints.sm})\`,
  md: \`@media (min-width: \${breakpoints.md})\`,
  lg: \`@media (min-width: \${breakpoints.lg})\`,
  xl: \`@media (min-width: \${breakpoints.xl})\`,
  "2xl": \`@media (min-width: \${breakpoints["2xl"]})\`,
};

const fontSizes = {
  xs: "0.75rem",
  sm: "0.875rem",
  base: "1rem",
  lg: "1.125rem",
  xl: "1.25rem",
  "2xl": "1.5rem",
  "3xl": "1.875rem",
  "4xl": "2.25rem",
  "5xl": "3rem",
  "6xl": "3.75rem",
};

const fontWeights = {
  light: 300,
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 900,
};

const transitions = {
  fast: "150ms ease-in-out",
  base: "250ms ease-in-out",
  slow: "350ms ease-in-out",
};

export const theme = {
  colors,
  gradients,
  font,
  spacing,
  radii,
  shadow,
  container,
  breakpoints,
  mq,
  fontWeights,
  fontSizes,
  transitions,
};
`;

    fs.writeFileSync(path.join(stylesDir, "theme.js"), themeContent);

    console.log(
      `✅ Стили созданы (GlobalStyle.js, theme.js) - тема: ${theme.name}`,
    );
  }

  /**
   * Generate SEO injection script
   */
  generateSeoScript() {
    const vars = this.getTemplateVars();
    const scriptsDir = path.join(this.projectPath, "scripts");

    const scriptTemplate = fs.readFileSync(
      path.join(this.templatesDir, "scripts", "inject-seo.js.template"),
      "utf8",
    );

    const scriptContent = this.applyTemplate(scriptTemplate, vars);
    const scriptPath = path.join(scriptsDir, "inject-seo.js");

    fs.writeFileSync(scriptPath, scriptContent);
    fs.chmodSync(scriptPath, "755"); // Make executable

    console.log("✅ SEO скрипт создан (inject-seo.js)");
  }

  /**
   * Generate all files
   */
  /**
   * Generate TypeScript types
   */
  generateTypes() {
    const typesDir = path.join(this.projectPath, "src", "types");
    if (!fs.existsSync(typesDir)) fs.mkdirSync(typesDir, { recursive: true });

    const styledTypesTemplate = fs.readFileSync(
      path.join(this.templatesDir, "types", "styled.d.ts.template"),
      "utf8",
    );
    fs.writeFileSync(path.join(typesDir, "styled.d.ts"), styledTypesTemplate);

    console.log("✅ Типы TypeScript созданы (styled.d.ts)");
  }

  /**
   * Copy fonts to public/fonts/
   */
  generateFonts() {
    const publicFontsDir = path.join(this.projectPath, "public", "fonts");
    const templateFontsDir = path.join(this.templatesDir, "fonts");

    if (!fs.existsSync(publicFontsDir)) {
      fs.mkdirSync(publicFontsDir, { recursive: true });
    }

    // Copy custom fonts
    const fonts = [
      "Lato-Regular.ttf",
      "Lato-Bold.ttf",
      "Raleway-Regular.ttf",
      "TiltNeon-Regular.ttf",
    ];

    fonts.forEach((font) => {
      const src = path.join(templateFontsDir, font);
      const dest = path.join(publicFontsDir, font);
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
      }
    });

    console.log("✅ Шрифты скопированы в public/fonts/");
  }

  async generateAll() {
    console.log("\n📝 Генерация файлов из шаблонов...\n");

    this.generateComponents();
    this.generateConfigFiles();
    this.generatePages();
    this.generateStyles();
    this.generateTypes();
    this.generateSeoScript();
    this.generateFonts();

    console.log("\n✅ Все файлы успешно сгенерированы!\n");
  }
}

module.exports = FileGenerator;
