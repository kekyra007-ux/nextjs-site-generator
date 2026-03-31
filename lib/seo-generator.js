/**
 * SEO Generator - robots.txt and sitemap.xml
 * Генерирует robots.txt и sitemap.xml для собранного проекта
 */

const fs = require("fs");
const path = require("path");

class SEOGenerator {
  constructor(config, projectPath) {
    this.config = config;
    this.projectPath = projectPath;
    // Используем baseUrl из config.project (тот же что и в siteSettings.json)
    this.siteUrl = config.project.baseUrl || "https://example.com";
  }

  /**
   * Генерирует robots.txt
   */
  generateRobotsTxt() {
    console.log("  📄 Генерация robots.txt...");

    const templatePath = path.join(
      __dirname,
      "..",
      "templates",
      "robots.txt.template",
    );
    let template = fs.readFileSync(templatePath, "utf-8");

    // Заменяем плейсхолдеры
    template = template.replace(/{{SITE_URL}}/g, this.siteUrl);

    // Сохраняем в public/
    const outputPath = path.join(this.projectPath, "public", "robots.txt");
    fs.writeFileSync(outputPath, template, "utf-8");

    console.log("  ✅ robots.txt создан");
  }

  /**
   * Генерирует sitemap.xml
   */
  generateSitemap() {
    console.log("  🗺️  Генерация sitemap.xml...");

    // Получаем список страниц из конфига
    const pages = this.getPages();

    // Получаем локали
    const locales = this.config.geo.locales || ['en'];
    const defaultLocale = this.config.geo.defaultLocale || locales[0];

    // Генерируем XML
    const urls = [];

    // Для каждой локали
    locales.forEach((locale) => {
      // Для каждой страницы
      pages.forEach((page) => {
        const url = this.buildUrl(locale, page);
        const priority = this.getPriority(page);
        const changefreq = this.getChangefreq(page);

        urls.push({
          loc: url,
          lastmod: new Date().toISOString().split("T")[0],
          changefreq: changefreq,
          priority: priority,
          // Альтернативные языки
          alternates: locales
            .filter((l) => l !== locale)
            .map((l) => ({
              hreflang: l,
              href: this.buildUrl(l, page),
            })),
        });
      });
    });

    // Формируем XML
    const xml = this.buildSitemapXML(urls);

    // Сохраняем в public/
    const outputPath = path.join(this.projectPath, "public", "sitemap.xml");
    fs.writeFileSync(outputPath, xml, "utf-8");

    console.log(`  ✅ sitemap.xml создан (${urls.length} URLs)`);
  }

  /**
   * Получает список страниц из конфига
   */
  getPages() {
    // Читаем standard-pages.json
    const pagesConfigPath = path.join(
      __dirname,
      "..",
      "config",
      "standard-pages.json",
    );
    const pagesConfig = JSON.parse(fs.readFileSync(pagesConfigPath, "utf-8"));

    return Object.keys(pagesConfig);
  }

  /**
   * Строит URL для страницы
   */
  buildUrl(locale, page) {
    const baseUrl = this.siteUrl.replace(/\/$/, ""); // Убираем trailing slash

    const defaultLocale = this.config.geo.defaultLocale || this.config.geo.locales[0];

    // Если это главная страница
    if (page === "home") {
      return locale === defaultLocale
        ? baseUrl
        : `${baseUrl}/${locale}`;
    }

    // Для остальных страниц
    return locale === defaultLocale
      ? `${baseUrl}/${page}`
      : `${baseUrl}/${locale}/${page}`;
  }

  /**
   * Получает приоритет для страницы
   */
  getPriority(page) {
    const priorities = {
      home: "1.0",
      products: "0.9",
      services: "0.9",
      events: "0.9",
      offers: "0.8",
      register: "0.7",
      app: "0.6",
      link: "0.5",
      login: "0.5",
    };

    return priorities[page] || "0.5";
  }

  /**
   * Получает частоту изменения для страницы
   */
  getChangefreq(page) {
    const frequencies = {
      home: "daily",
      products: "daily",
      services: "daily",
      events: "daily",
      offers: "weekly",
      register: "monthly",
      app: "monthly",
      link: "monthly",
      login: "monthly",
    };

    return frequencies[page] || "monthly";
  }

  /**
   * Формирует XML для sitemap
   */
  buildSitemapXML(urls) {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml +=
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';

    urls.forEach((url) => {
      xml += "  <url>\n";
      xml += `    <loc>${this.escapeXml(url.loc)}</loc>\n`;
      xml += `    <lastmod>${url.lastmod}</lastmod>\n`;
      xml += `    <changefreq>${url.changefreq}</changefreq>\n`;
      xml += `    <priority>${url.priority}</priority>\n`;

      // Добавляем альтернативные языки
      url.alternates.forEach((alt) => {
        xml += `    <xhtml:link rel="alternate" hreflang="${alt.hreflang}" href="${this.escapeXml(alt.href)}" />\n`;
      });

      xml += "  </url>\n";
    });

    xml += "</urlset>\n";

    return xml;
  }

  /**
   * Экранирует специальные символы для XML
   */
  escapeXml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }

  /**
   * Генерирует оба файла
   */
  generate() {
    console.log("\n🔍 ГЕНЕРАЦИЯ SEO ФАЙЛОВ");
    this.generateRobotsTxt();
    this.generateSitemap();
  }
}

module.exports = SEOGenerator;
