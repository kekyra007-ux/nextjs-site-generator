#!/usr/bin/env node

const readline = require("readline");
const fs = require("fs");
const path = require("path");

// Load configurations
const geoPresets = require("./config/geo-presets.json");
const standardPages = require("./config/standard-pages.json");
const { getAllThemes, getTheme } = require("./lib/color-themes");

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Utility function to ask questions
function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

// Main generator class
class SiteGenerator {
  constructor() {
    this.config = {
      project: {},
      geo: {},
      content: {},
      pages: standardPages.pages,
      theme: "dark",
    };
    this.currentYear = new Date().getFullYear();
  }

  // Display welcome message
  displayWelcome() {
    console.log("\n" + "=".repeat(60));
    console.log("🚀  ГЕНЕРАТОР СТАТИЧЕСКИХ САЙТОВ v3.0");
    console.log("    Hero / SEO / Контент → генерируются AI");
    console.log("=".repeat(60) + "\n");
  }

  // Step 1: Collect basic project parameters
  async collectProjectInfo() {
    console.log("📋 ШАГ 1: Основные параметры проекта\n");

    this.config.project.name = await ask(
      "Введите название проекта (например, my-site): ",
    );
    this.config.project.baseUrl = await ask(
      "Введите домен сайта (например, https://my-site.com): ",
    );
    this.config.project.brandName = await ask(
      "Введите название бренда (например, MyBrand): ",
    );
    this.config.project.referralLink = await ask(
      "❓ Реферальная ссылка (full URL, optional): ",
    );

    console.log("\n✅ Основные параметры сохранены\n");
  }

  // Step 2: Select GEO preset
  async selectGeo() {
    console.log("🌍 ШАГ 2: Выбор ГЕО\n");
    console.log("Доступные регионы:");
    console.log("1. Philippines (English + Filipino)");
    console.log("2. Bangladesh (English + Bengali)");
    console.log("3. Vietnam (English + Vietnamese)\n");

    const choice = await ask("Выберите регион (1-3): ");

    const geoMap = {
      1: "philippines",
      2: "bangladesh",
      3: "vietnam",
    };

    const selectedGeo = geoMap[choice];
    if (!selectedGeo) {
      console.log("❌ Неверный выбор. Используем Philippines по умолчанию.");
      this.config.geo = geoPresets.philippines;
    } else {
      this.config.geo = geoPresets[selectedGeo];
    }

    console.log(`\n✅ Выбран регион: ${this.config.geo.name}`);
    console.log(`   Языки: ${this.config.geo.locales.join(", ")}`);
    console.log(`   Язык по умолчанию: ${this.config.geo.defaultLocale}\n`);
  }

  // Step 3: Select pages to generate
  async selectPages() {
    console.log("📄 ШАГ 3: Выбор страниц для генерации\n");
    console.log("Доступные страницы:\n");

    standardPages.pages.forEach((page, index) => {
      console.log(`${index + 1}. ${page.key} - ${page.description}`);
    });

    console.log("\nВыберите страницы для генерации:");
    console.log("- Введите номера через запятую (например: 1,2,3,4)");
    console.log('- Или введите "all" для всех страниц\n');

    const input = await ask("Ваш выбор: ");

    if (input.toLowerCase() === "all") {
      this.config.pages = standardPages.pages;
      console.log(
        `\n✅ Выбраны все страницы (${standardPages.pages.length})\n`,
      );
    } else {
      const indices = input.split(",").map((n) => parseInt(n.trim()) - 1);
      this.config.pages = indices
        .filter((i) => i >= 0 && i < standardPages.pages.length)
        .map((i) => standardPages.pages[i]);

      if (this.config.pages.length === 0) {
        console.log(
          "\n⚠️  Неверный ввод. Используем все страницы по умолчанию.",
        );
        this.config.pages = standardPages.pages;
      } else {
        console.log(`\n✅ Выбрано страниц: ${this.config.pages.length}`);
        this.config.pages.forEach((p) => console.log(`   - ${p.key}`));
        console.log("");
      }
    }

    // Сбор секций для каждой страницы
    await this.collectPageSections();

    // Сбор keywords для каждой страницы (только EN — AI переведёт)
    await this.collectPageKeywords();
  }

  // Collect sections for each page
  async collectPageSections() {
    console.log("\n" + "=".repeat(60));
    console.log("📋 Выбор секций для каждой страницы");
    console.log("=".repeat(60) + "\n");

    const pageSections = require("./config/page-sections.json");

    if (!this.config.pageSections) {
      this.config.pageSections = {};
    }

    const pages = this.config.pages;

    for (const page of pages) {
      console.log(`\n📄 Страница: ${page.key.toUpperCase()}\n`);

      // Фильтруем доступные секции для данной страницы
      const availableSections = pageSections.availableSections.filter(
        (section) => section.applicablePages.includes(page.key),
      );

      if (availableSections.length === 0) {
        console.log("  ⚠️  Нет доступных секций для этой страницы\n");
        this.config.pageSections[page.key] = [];
        continue;
      }

      console.log("Доступные секции:\n");
      availableSections.forEach((section, index) => {
        console.log(`${index + 1}. ${section.key} - ${section.description}`);
      });

      console.log("\nВыберите секции:");
      console.log("- Введите номера через запятую (например: 1,2,3)");
      console.log('- Или введите "all" для всех секций\n');

      const input = await ask("Ваш выбор: ");

      if (input.toLowerCase() === "all") {
        this.config.pageSections[page.key] = availableSections.map(
          (s) => s.key,
        );
      } else {
        const indices = input.split(",").map((n) => parseInt(n.trim()) - 1);
        this.config.pageSections[page.key] = indices
          .filter((i) => i >= 0 && i < availableSections.length)
          .map((i) => availableSections[i].key);
      }

      console.log(
        `\n  ✅ Выбрано секций: ${this.config.pageSections[page.key].length}`,
      );
      this.config.pageSections[page.key].forEach((s) =>
        console.log(`     - ${s}`),
      );
    }

    console.log("\n✅ Секции для всех страниц выбраны!\n");
  }

  // Collect keywords for each page (only EN — AI will translate)
  async collectPageKeywords() {
    console.log("\n" + "=".repeat(60));
    console.log("🔑 Ключевые слова для SEO (только English)");
    console.log("   AI сам переведёт keywords на другие языки");
    console.log("=".repeat(60) + "\n");

    if (!this.config.pageKeywords) {
      this.config.pageKeywords = {};
    }

    const pages = this.config.pages;
    const locales = this.config.geo.locales;

    for (const page of pages) {
      console.log(`\n📄 Страница: ${page.key.toUpperCase()}`);

      if (!this.config.pageKeywords[page.key]) {
        this.config.pageKeywords[page.key] = {};
      }

      // Спрашиваем keywords только для EN
      const keywordsInput = await ask(`  🔑 EN keywords (через запятую): `);
      const enKeywords = keywordsInput
        .split(",")
        .map((k) => k.trim())
        .filter((k) => k.length > 0);

      // Сохраняем EN keywords
      this.config.pageKeywords[page.key]["en"] = enKeywords;

      // Для остальных локалей — копируем EN (AI потом переведёт)
      for (const locale of locales) {
        if (locale !== "en") {
          this.config.pageKeywords[page.key][locale] = [...enKeywords];
        }
      }

      console.log(`     ✅ Сохранено: ${enKeywords.length} keywords`);
    }

    console.log("\n✅ Ключевые слова для всех страниц собраны!\n");
  }

  // Step 4: Select color theme
  async selectColorTheme() {
    console.log("🎨 ШАГ 4: Выбор цветовой темы\n");
    const themes = getAllThemes();
    themes.forEach((theme, index) => {
      console.log(`${index + 1}. ${theme.name}`);
      console.log(`   ${theme.description}\n`);
    });

    const choice = await ask("Выберите тему (1-5): ");

    const themeMap = {
      1: "dark",
      2: "light",
      3: "sport",
      4: "green",
      5: "burgundy",
    };

    const selectedTheme = themeMap[choice];
    if (!selectedTheme) {
      console.log("❌ Неверный выбор. Используем темную тему по умолчанию.");
      this.config.theme = "dark";
    } else {
      this.config.theme = selectedTheme;
    }

    const theme = getTheme(this.config.theme);
    console.log(`\n✅ Выбрана тема: ${theme.name}`);
    console.log(`   Основной цвет: ${theme.colors.primary}`);
    console.log(`   Фон: ${theme.colors.background}\n`);
  }

  // Display summary
  displaySummary() {
    console.log("\n" + "=".repeat(60));
    console.log("📊 СВОДКА КОНФИГУРАЦИИ");
    console.log("=".repeat(60) + "\n");

    console.log(`Проект: ${this.config.project.name}`);
    console.log(`Домен: ${this.config.project.baseUrl}`);
    console.log(`Бренд: ${this.config.project.brandName}`);
    console.log(
      `Реферальная ссылка: ${this.config.project.referralLink || "не указана"}`,
    );
    console.log(`ГЕО: ${this.config.geo.name} (${this.config.geo.code})`);
    console.log(`Языки: ${this.config.geo.locales.join(", ")}`);
    console.log(`Страниц: ${this.config.pages.length}`);
    console.log(`Тема: ${this.config.theme}`);
    console.log("");

    // Показываем секции для каждой страницы
    console.log("Секции:");
    for (const page of this.config.pages) {
      const sections = this.config.pageSections[page.key] || [];
      console.log(`  ${page.key}: ${sections.join(", ") || "(нет секций)"}`);
    }
    console.log("");

    console.log("💡 Hero, SEO и контент секций будут сгенерированы AI");
    console.log("   (или заглушками в режиме stub)\n");
  }

  // Confirm and generate
  async confirmGeneration() {
    const confirm = await ask("Начать генерацию сайта? (yes/no): ");
    return confirm.toLowerCase() === "yes" || confirm.toLowerCase() === "y";
  }

  // Save configuration to file
  saveConfig() {
    const configPath = path.join(
      __dirname,
      "output",
      `${this.config.project.name}-config.json`,
    );

    // Create output directory if it doesn't exist
    const outputDir = path.join(__dirname, "output");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(configPath, JSON.stringify(this.config, null, 2));
    console.log(`\n✅ Конфигурация сохранена: ${configPath}\n`);
    return configPath;
  }

  // Main run method
  async run() {
    try {
      this.displayWelcome();
      await this.collectProjectInfo();
      await this.selectGeo();
      await this.selectPages(); // включает выбор секций + keywords
      await this.selectColorTheme();
      // ШАГ 5 (ручной ввод Hero/SEO) УДАЛЁН — AI генерирует автоматически
      this.displaySummary();

      const confirmed = await this.confirmGeneration();

      if (confirmed) {
        const configPath = this.saveConfig();
        console.log("🚀 Переходим к генерации проекта...\n");
        return configPath;
      } else {
        console.log("\n❌ Генерация отменена.\n");
        return null;
      }
    } catch (error) {
      console.error("\n❌ Ошибка:", error.message);
      return null;
    } finally {
      rl.close();
    }
  }
}

// Run generator if executed directly
if (require.main === module) {
  const generator = new SiteGenerator();
  generator.run().then((configPath) => {
    if (configPath) {
      console.log("✅ Интерактивный сбор данных завершен!");
      console.log("📦 Следующий этап: генерация файлов проекта\n");
    }
    process.exit(0);
  });
}

module.exports = SiteGenerator;
