/**
 * Content Generator v3.4
 * Генерирует контент для common.json в режимах stub/ai
 * v3.13: Добавлен контроль количества слов (~2000 на страницу)
 * v3.4: Разные целевые значения слов для разных типов страниц
 *
 * Режимы работы:
 * - stub: Заглушки без GPT (EN = плейсхолдеры, второй язык = копия EN)
 * - ai: Генерация через GPT (EN = контент от AI, второй язык = перевод от AI)
 */

require("dotenv").config();

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const OpenAI = require("openai");

let openai = null;
function getOpenAI() {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}
function hashObject(obj) {
  return crypto
    .createHash("sha1")
    .update(JSON.stringify(obj))
    .digest("hex")
    .slice(0, 12);
}

/**
 * Подсчет слов в объекте (рекурсивно)
 */
function countWords(obj) {
  if (typeof obj === "string") {
    return obj.split(/\s+/).filter((w) => w.length > 0).length;
  }
  if (Array.isArray(obj)) {
    return obj.reduce((sum, item) => sum + countWords(item), 0);
  }
  if (typeof obj === "object" && obj !== null) {
    return Object.values(obj).reduce((sum, val) => sum + countWords(val), 0);
  }
  return 0;
}
class ContentGenerator {
  constructor(config, projectPath, mode = "stub") {
    this.config = config;
    this.projectPath = projectPath;
    this.mode = mode; // 'stub' или 'ai'
    this.cacheDir = path.join(__dirname, "..", "cache");

    // Создаём папку кэша если её нет
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  /**
   * Главный метод генерации контента
   */
  async generateContent() {
    console.log(`🤖 Режим генерации контента: ${this.mode.toUpperCase()}`);

    const locales = this.config.geo.locales;
    const sourceLocale = "en"; // EN всегда источник
    const targetLocales = locales.filter((l) => l !== sourceLocale);

    // 1. Генерируем контент для EN (source)
    console.log(`\n📝 Генерация контента для ${sourceLocale.toUpperCase()}...`);
    await this.generateLocaleContent(sourceLocale, null);

    // 2. Генерируем/переводим для остальных локалей
    for (const targetLocale of targetLocales) {
      console.log(
        `\n🌐 Генерация контента для ${targetLocale.toUpperCase()} (перевод с EN)...`,
      );
      await this.generateLocaleContent(targetLocale, sourceLocale);
    }

    console.log("\n✅ Генерация контента завершена");
  }

  /**
   * Генерация контента для одной локали
   * @param {string} locale - Целевая локаль
   * @param {string|null} sourceLocale - Исходная локаль для перевода (null = генерация с нуля)
   */
  async generateLocaleContent(locale, sourceLocale = null) {
    const commonPath = path.join(
      this.projectPath,
      "public",
      "locales",
      locale,
      "common.json",
    );

    if (!fs.existsSync(commonPath)) {
      console.log(`⚠️  Файл не найден: ${commonPath}`);
      return;
    }

    // Читаем текущий common.json с плейсхолдерами
    const commonData = JSON.parse(fs.readFileSync(commonPath, "utf-8"));

    if (this.mode === "stub") {
      // Режим stub: оставляем плейсхолдеры как есть или копируем из EN
      if (sourceLocale) {
        const sourceCommonPath = path.join(
          this.projectPath,
          "public",
          "locales",
          sourceLocale,
          "common.json",
        );
        const sourceData = JSON.parse(
          fs.readFileSync(sourceCommonPath, "utf-8"),
        );

        // Копируем контент из EN (в stub режиме это просто плейсхолдеры)
        fs.writeFileSync(
          commonPath,
          JSON.stringify(sourceData, null, 2),
          "utf-8",
        );
        console.log(
          `  ✓ ${locale}: скопировано из ${sourceLocale} (stub mode)`,
        );
      } else {
        console.log(
          `  ✓ ${locale}: плейсхолдеры оставлены без изменений (stub mode)`,
        );
      }
    } else if (this.mode === "ai") {
      // Режим AI: генерируем/переводим через GPT
      if (sourceLocale) {
        // Перевод с EN
        await this.translateContent(
          commonData,
          sourceLocale,
          locale,
          commonPath,
        );
      } else {
        // Генерация контента для EN
        await this.generateAIContent(commonData, locale, commonPath);
      }
    }
  }

  /**
   * Генерация контента через AI (для EN)
   * @param {object} commonData - Текущий common.json с плейсхолдерами
   * @param {string} locale - Локаль
   * @param {string} outputPath - Путь для сохранения
   */
  async generateAIContent(commonData, locale, outputPath) {
    console.log(`  🤖 Генерация AI-контента для ${locale}...`);

    // Собираем контекст для AI
    // const context = this.buildAIContext(locale);
    const baseContext = this.buildAIContext(locale);

    // Обрабатываем каждую страницу
    const pages = this.config.pages;

    for (const page of pages) {
      const pageKey = typeof page === "string" ? page : page.key;
      const sections = this.config.pageSections?.[pageKey] || [];
      const pageKeywords = this.config.pageKeywords?.[pageKey]?.[locale] || [];

      const context = {
        ...baseContext,
        pageKey,
        keywords: pageKeywords,
        sections,
      };
      console.log(
        `    📄 Страница: ${pageKey} (секции: ${sections.join(", ")})`,
      );

      // Рассчитываем целевое распределение слов по секциям
        const wordDistribution = this.calculateWordDistribution(sections, pageKey);

      // Генерируем SEO (короткие тексты, не считаем в общий объем)
      commonData.seo[pageKey] = await this.generateSEO(pageKey, context);

      // Генерируем Hero (короткие тексты, не считаем в общий объем)
      commonData.hero[pageKey] = await this.generateHero(pageKey, context);

      // Генерируем секции с учетом целевого количества слов
      for (const sectionKey of sections) {
        if (!commonData.sections[sectionKey]) {
          commonData.sections[sectionKey] = {};
        }

        const targetWords = wordDistribution[sectionKey] || 300;

        commonData.sections[sectionKey][pageKey] = await this.generateSection(
          pageKey,
          sectionKey,
          context,
          targetWords,
        );
      }

      // Подсчитываем итоговое количество слов на странице
      const pageContent = {
        seo: commonData.seo[pageKey],
        hero: commonData.hero[pageKey],
        sections: {},
      };

      for (const sectionKey of sections) {
        pageContent.sections[sectionKey] =
          commonData.sections[sectionKey][pageKey];
      }

      const totalWords = countWords(pageContent);
      console.log(`    📊 Итого слов на странице ${pageKey}: ${totalWords}`);
    }

    // Сохраняем обновлённый common.json
    fs.writeFileSync(outputPath, JSON.stringify(commonData, null, 2), "utf-8");
    console.log(`  ✅ ${locale}: AI-контент сгенерирован`);
  }

  /**
   * Перевод контента через AI
   * @param {object} commonData - Текущий common.json целевой локали
   * @param {string} sourceLocale - Исходная локаль (EN)
   * @param {string} targetLocale - Целевая локаль
   * @param {string} outputPath - Путь для сохранения
   */
  async translateContent(commonData, sourceLocale, targetLocale, outputPath) {
    console.log(`  🌐 Перевод с ${sourceLocale} на ${targetLocale}...`);

    // Читаем EN версию
    const sourceCommonPath = path.join(
      this.projectPath,
      "public",
      "locales",
      sourceLocale,
      "common.json",
    );
    const sourceData = JSON.parse(fs.readFileSync(sourceCommonPath, "utf-8"));

    // Переводим структуру
    const translated = await this.translateStructure(
      sourceData,
      sourceLocale,
      targetLocale,
    );

    // Сохраняем
    fs.writeFileSync(outputPath, JSON.stringify(translated, null, 2), "utf-8");
    console.log(`  ✅ ${targetLocale}: перевод завершён`);
  }

  /**
   * Построение контекста для AI
   */
  buildAIContext(locale) {
    // const keywords = this.config.pageKeywords || {};

    return {
      brandName: this.config.project.brandName,
      referralLink: this.config.project.referralLink,
      geo: this.config.geo.name,
      geoCode: this.config.geo.code,
      locale: locale,
      // keywords: keywords,
      theme: this.config.theme || "modern",
    };
  }

  /**
   * Генерация SEO через AI (заглушка для интеграции)
   */
  // async generateSEO(pageKey, context) {
  //   const cacheKey = this.getCacheKey("seo", pageKey, context);
  //   const cached = this.getFromCache(cacheKey);
  //   if (cached) return cached;

  //   // TODO: Здесь будет вызов GPT API
  //   // Пока возвращаем структуру-заглушку
  //   const result = {
  //     title: `[AI] ${context.brandName} - ${pageKey}`,
  //     description: `[AI] Best ${pageKey} in ${context.geo}`,
  //     keywords: context.keywords || [],
  //   };

  //   this.saveToCache(cacheKey, result);
  //   return result;
  // }

  async generateSEO(pageKey, context) {
    const cacheKey = this.getCacheKey("seo", pageKey, context);
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const prompt = `
    You are a professional SEO copywriter for modern digital products and services.
    Your task is to generate SEO metadata for a page.

    **Context:**
    - Brand: ${context.brandName}
    - GEO: ${context.geo}
    - Page: ${pageKey}
    - Keywords: ${context.keywords.join(", ")}

    **Task:**
    Generate a JSON object with title, description, and keywords.
    - title: 50-60 characters, engaging and relevant.
    - description: 150-160 characters, compelling and clear.
    - keywords: a string of 10-15 relevant keywords, comma-separated.
    
    **IMPORTANT: Make the content UNIQUE and DIVERSE:**
    - DO NOT use generic templates or repetitive phrases across different pages
    - Each page should have its own distinct voice and angle
    - Vary your language, sentence structure, and approach
    - Focus on what makes THIS specific page unique (${pageKey})
    - Avoid starting multiple titles/descriptions with the same words

    **Output format (JSON only):**
    {
      "title": "...",
      "description": "...",
      "keywords": "..."
    }
  `;

    const response = await getOpenAI().chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: parseFloat(process.env.OPENAI_TEMPERATURE) || 0.9,
    });

    const result = JSON.parse(response.choices[0].message.content);
    this.saveToCache(cacheKey, result);
    return result;
  }
  /**
   * Генерация Hero через AI (заглушка для интеграции)
   */
  // async generateHero(pageKey, context) {
  //   const cacheKey = this.getCacheKey("hero", pageKey, context);
  //   const cached = this.getFromCache(cacheKey);
  //   if (cached) return cached;

  //   // TODO: Здесь будет вызов GPT API
  //   const result = {
  //     badge: `[AI] ${context.brandName}`,
  //     title: `[AI] Welcome to ${context.brandName}`,
  //     subtitle: `[AI] Best ${pageKey} experience in ${context.geo}`,
  //     primaryCta: "Join Now",
  //     secondaryCta: "Learn More",
  //   };

  //   this.saveToCache(cacheKey, result);
  //   return result;
  // }
  async generateHero(pageKey, context) {
    const cacheKey = this.getCacheKey("hero", pageKey, context);
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const prompt = `
    You are a creative copywriter for a premium brand.
    Your task is to generate content for a Hero section.

    **Context:**
    - Brand: ${context.brandName}
    - GEO: ${context.geo}
    - Page: ${pageKey}

    **Task:**
    Generate a JSON object with badge, title, subtitle, and two CTA button texts.
    - badge: short, catchy phrase (e.g., "Hot Offer", "New Games").
    - title: powerful and engaging headline.
    - subtitle: clear and persuasive sub-headline.
    - primaryCta: main call-to-action (e.g., "Play Now", "Register").
    - secondaryCta: alternative action (e.g., "Learn More", "View Games").
    
    **IMPORTANT: Make the content UNIQUE and CREATIVE:**
    - DO NOT reuse the same hero titles/subtitles across different pages
    - Each page (${pageKey}) should have a distinct, memorable hook
    - Vary your creative approach - use different angles, emotions, benefits
    - Avoid generic phrases like "Join now" or "Best platform" in every title
    - Think about what makes THIS page special and reflect that in the copy

    **Output format (JSON only):**
    {
      "badge": "...",
      "title": "...",
      "subtitle": "...",
      "primaryCta": "...",
      "secondaryCta": "..."
    }
  `;

    const response = await getOpenAI().chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: parseFloat(process.env.OPENAI_TEMPERATURE) || 0.9,
    });

    const result = JSON.parse(response.choices[0].message.content);
    this.saveToCache(cacheKey, result);
    return result;
  }
  /**
   * Генерация секции через AI (заглушка для интеграции)
   */
  // async generateSection(pageKey, sectionKey, context) {
  //   const cacheKey = this.getCacheKey(
  //     "section",
  //     `${pageKey}_${sectionKey}`,
  //     context,
  //   );
  //   const cached = this.getFromCache(cacheKey);
  //   if (cached) return cached;

  //   // TODO: Здесь будет вызов GPT API с учётом структуры секции
  //   const result = this.getDefaultSectionStructure(
  //     sectionKey,
  //     pageKey,
  //     context,
  //   );

  //   this.saveToCache(cacheKey, result);
  //   return result;
  // }

  async generateSection(pageKey, sectionKey, context, targetWords = 300) {
    const cacheKey = this.getCacheKey(
      "section",
      `${pageKey}_${sectionKey}_${targetWords}`,
      context,
    );
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const placeholder = this.getDefaultSectionStructure(
      sectionKey,
      pageKey,
      context,
    );

    const lengthGuidelines = this.getLengthGuidelines(sectionKey, targetWords);

    const prompt = `
    You are a professional content writer for a premium digital brand.
    Your task is to generate content for a specific section of a webpage.

    **Context:**
    - Brand: ${context.brandName}
    - GEO: ${context.geo}
    - Page: ${pageKey}
    - Section: ${sectionKey}
    - Target word count: ~${targetWords} words total for this section

    **Length Guidelines:**
    ${lengthGuidelines}

    **Task:**
    Generate a JSON object with content for the section. The structure must match the placeholder exactly.
    - Adhere to the tone and style of a premium modern brand.
    - Content should be engaging, clear, and persuasive.
    - Follow the word count guidelines to create rich, informative content.
    - Focus on providing value and detailed information, not just short phrases.
    
    **IMPORTANT: Make the content UNIQUE and VARIED:**
    - DO NOT generate identical or very similar content for different pages
    - Each page (${pageKey}) and section (${sectionKey}) combination should be distinct
    - Vary your examples, descriptions, and explanations
    - Use different sentence structures and vocabulary
    - Think about the specific context of THIS page - what angle or focus makes sense?
    - If this is "home" - focus on welcoming and overview
    - If this is "products" - focus on product variety and key features
    - If this is "services" - focus on service benefits and what makes them unique
    - If this is "offers" - focus on promotional offers and special deals
    - Adapt your content to match the page purpose

    **Placeholder Structure (for your reference):**
    ${JSON.stringify(placeholder, null, 2)}

    **Output format (JSON only, matching the placeholder structure):**
  `;

    const response = await getOpenAI().chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: parseFloat(process.env.OPENAI_TEMPERATURE) || 0.9,
    });

    const result = JSON.parse(response.choices[0].message.content);
    this.saveToCache(cacheKey, result);
    return result;
  }

  /**
   * Перевод структуры через AI (заглушка для интеграции)
   * Кэш зависит от ХЭША sourceData — если EN меняется, перевод пересобирается
   */
  // async translateStructure(sourceData, sourceLocale, targetLocale) {
  //   const sourceHash = hashObject(sourceData);

  //   const cacheKey = this.getCacheKey("translate", targetLocale, {
  //     sourceLocale,
  //     sourceHash,
  //   });

  //   const cached = this.getFromCache(cacheKey);
  //   if (cached) return cached;

  //   // TODO: здесь будет реальный вызов GPT (перевод EN → targetLocale)
  //   // Сейчас stub: глубокая копия sourceData
  //   const result = JSON.parse(JSON.stringify(sourceData));

  //   this.saveToCache(cacheKey, result);
  //   return result;
  // }
  async translateStructure(sourceData, sourceLocale, targetLocale) {
    const sourceHash = hashObject(sourceData);
    const cacheKey = this.getCacheKey("translate", targetLocale, {
      sourceLocale,
      sourceHash,
    });
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    console.log(`  📊 Разбиваем на части для надежного перевода...`);

    try {
      const translated = {};

      // Переводим каждую секцию отдельно
      for (const [key, value] of Object.entries(sourceData)) {
        console.log(`    • Перевод ${key}...`);
        translated[key] = await this.translateChunk(value, sourceLocale, targetLocale, key);
      }

      // Сохраняем в кэш
      this.saveToCache(cacheKey, translated);
      return translated;
    } catch (error) {
      console.log(`  ❌ Перевод не удался: ${error.message}`);
      console.log(`  🔄 Используется копия EN.`);
      return JSON.parse(JSON.stringify(sourceData));
    }
  }

  /**
   * Переводит один чанк (seo, hero, sections)
   */
  async translateChunk(chunk, sourceLocale, targetLocale, chunkName) {
    const maxRetries = 3;
    let lastError = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const prompt = `
You are an expert translator specializing in digital product content.
Your task is to translate a JSON chunk from ${sourceLocale} to ${targetLocale}.

**Rules:**
1. Translate all string values.
2. Do NOT translate keys, URLs, or placeholders like [AI] or [PLACEHOLDER].
3. Preserve the original JSON structure perfectly.
4. Escape special characters properly (quotes, newlines).
5. Return ONLY valid JSON, no extra text.

**JSON chunk to translate (${chunkName}):**
${JSON.stringify(chunk, null, 2)}

**Output format (JSON only, translated to ${targetLocale}):**
      `;

        const model = process.env.OPENAI_TRANSLATION_MODEL || "gpt-4o-mini";
        
        const requestParams = {
          model: model,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.2,
        };
        
        // Добавляем response_format только для моделей которые его поддерживают
        if (model.includes('gpt-4o') || model.includes('gpt-4-turbo') || model.includes('gpt-3.5-turbo-1106')) {
          requestParams.response_format = { type: "json_object" };
        }
        
        const response = await getOpenAI().chat.completions.create(requestParams);

        let content = response.choices[0].message.content.trim();

        // Убираем markdown блоки если есть (```json ... ```)
        if (content.startsWith('```')) {
          content = content.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
        }

        // Попытка распарсить JSON
        const result = JSON.parse(content);
        return result;
      } catch (error) {
        lastError = error;
        if (attempt < maxRetries) {
          console.log(`      ⚠️  Попытка ${attempt}/${maxRetries} не удалась, повтор...`);
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }
    }

    // Если все попытки провалились - возвращаем копию
    console.log(`      ❌ ${chunkName} не удалось перевести, используется копия EN`);
    return JSON.parse(JSON.stringify(chunk));
  }

  /**
   * Получение дефолтной структуры секции
   */
  getDefaultSectionStructure(sectionKey, pageKey, context) {
    switch (sectionKey) {
      case "homeArticle":
        return {
          title: `[AI] Article title for ${pageKey}`,
          subtitle: `[AI] Article subtitle for ${pageKey}`,
          p1: `[AI] Paragraph 1 for ${pageKey}`,
          p2: `[AI] Paragraph 2 for ${pageKey}`,
          list: [
            "[AI] Point 1",
            "[AI] Point 2",
            "[AI] Point 3",
            "[AI] Point 4",
          ],
          p3: `[AI] Paragraph 3 for ${pageKey}`,
        };

      case "featureGrid":
        return {
          title: `[AI] Why choose ${context.brandName || "us"}`,
          items: [
            {
              title: "[AI] Feature 1",
              text: "[AI] Short benefit description.",
            },
            {
              title: "[AI] Feature 2",
              text: "[AI] Short benefit description.",
            },
            {
              title: "[AI] Feature 3",
              text: "[AI] Short benefit description.",
            },
            {
              title: "[AI] Feature 4",
              text: "[AI] Short benefit description.",
            },
          ],
        };

      case "faqBlock":
        return {
          title: `[AI] FAQ for ${pageKey}`,
          items: [
            { q: "[AI] Question 1?", a: "[AI] Answer 1." },
            { q: "[AI] Question 2?", a: "[AI] Answer 2." },
            { q: "[AI] Question 3?", a: "[AI] Answer 3." },
            { q: "[AI] Question 4?", a: "[AI] Answer 4." },
            { q: "[AI] Question 5?", a: "[AI] Answer 5." },
            { q: "[AI] Question 6?", a: "[AI] Answer 6." },
          ],
        };

      case "ctaBlock":
        return {
          title: `[AI] Ready to get started with ${context.brandName || "our platform"}?`,
          text: "[AI] Create an account and access all features in a few clicks.",
          buttonText: "Get Started",
        };

      case "offerSection":
        return {
          title: `[AI] Exclusive Offers`,
          subtitle: `[AI] Boost your experience with special promotions`,
          items: [
            {
              badge: "[AI] New",
              title: "[AI] Premium Welcome Package",
              description:
                "[AI] Get started with our premium service package today!",
              buttonText: "[AI] Claim Offer",
              termsText: "[AI] *T&C Apply. New users only.",
            },
            {
              badge: "[AI] Featured",
              title: "[AI] Loyalty Rewards Program",
              description:
                "[AI] Earn exclusive rewards and benefits every time you use our platform.",
              buttonText: "[AI] Learn More",
              termsText: "[AI] *Available to registered users.",
            },
          ],
        };

      case "paymentMethods":
        return {
          title: `[AI] Secure Payments`,
          subtitle: `[AI] We support popular and secure payment methods`,
          items: [
            { name: "[AI] Visa", icon: "💳", type: "[AI] Card" },
            { name: "[AI] MasterCard", icon: "💳", type: "[AI] Card" },
            { name: "[AI] Bitcoin", icon: "₿", type: "[AI] Crypto" },
            { name: "[AI] Ethereum", icon: "Ξ", type: "[AI] Crypto" },
            { name: "[AI] Skrill", icon: "💰", type: "[AI] E-Wallet" },
          ],
        };

      case "howToPlay":
        return {
          title: `[AI] How To Play`,
          subtitle: `[AI] Follow these simple steps to get started`,
          steps: [
            {
              step: "1",
              title: "[AI] Create Account",
              description: "[AI] Sign up in seconds with your email or phone.",
            },
            {
              step: "2",
              title: "[AI] Make a Deposit",
              description:
                "[AI] Choose your preferred payment method and fund your account.",
            },
            {
              step: "3",
              title: "[AI] Choose Your Game",
              description: "[AI] Browse our selection and pick your favorite.",
            },
            {
              step: "4",
              title: "[AI] Start Winning",
              description: "[AI] Place your bets and enjoy the thrill!",
            },
          ],
          buttonText: "[AI] Get Started Now",
        };

      case "itemsList":
        return {
          title: `[AI] Featured Products`,
          subtitle: `[AI] Explore our top-rated products and services`,
          items: [
            {
              icon: "⭐",
              title: "[AI] Premium Service",
              category: "[AI] Featured",
              description: "[AI] Our flagship service offering exceptional quality and results.",
              badge: "[AI] Popular",
            },
            {
              icon: "🚀",
              title: "[AI] Advanced Solution",
              category: "[AI] Products",
              description: "[AI] A powerful solution designed to help you achieve more.",
            },
            {
              icon: "💡",
              title: "[AI] Smart Tools",
              category: "[AI] Tools",
              description: "[AI] Intelligent tools that streamline your workflow.",
            },
            {
              icon: "🎯",
              title: "[AI] Targeted Plans",
              category: "[AI] Plans",
              description: "[AI] Flexible plans tailored to your specific requirements.",
              badge: "[AI] New",
            },
            {
              icon: "🏆",
              title: "[AI] Expert Support",
              category: "[AI] Support",
              description: "[AI] World-class support team available to help you succeed.",
              badge: "[AI] Hot",
            },
            {
              icon: "🔧",
              title: "[AI] Custom Solutions",
              category: "[AI] Custom",
              description:
                "[AI] Bespoke solutions crafted to meet your unique business needs.",
            },
          ],
          buttonText: "[AI] View All Products",
        };

      case "contentShowcase":
        return {
          title: `[AI] Why Choose ${context.brandName || "Us"}`,
          lead: `[AI] Discover what makes our platform the preferred choice for customers worldwide.`,
          highlights: [
            { label: "[AI] Products", value: "[AI] 2,000+ Premium Options" },
            { label: "[AI] Payout Speed", value: "[AI] Under 24 Hours" },
            { label: "[AI] Support", value: "[AI] 24/7 Live Chat" },
            { label: "[AI] Security", value: "[AI] SSL Encrypted" },
          ],
          blocks: [
            {
              title: "[AI] Unrivaled Product Selection",
              text: "[AI] Our platform features an extensive catalog from the world's leading providers.",
              highlight:
                "[AI] We partner with over 50 top-tier providers.",
            },
            {
              title: "[AI] Safe and Secure Platform",
              text: "[AI] Your security is our top priority with industry-standard encryption.",
              highlight:
                "[AI] Fully compliant with 256-bit SSL encryption.",
            },
            {
              title: "[AI] Rewarding Loyalty Program",
              text: "[AI] The more you engage, the more you earn with exclusive offers and VIP perks.",
            },
          ],
          closingTitle: `[AI] Ready to Experience the Difference?`,
          closingText: `[AI] Join thousands of satisfied customers and start your journey with us today.`,
          buttonText: "[AI] Join Now",
        };

      default:
        console.log(
          `⚠️ Unknown sectionKey: ${sectionKey}. Returning empty object.`,
        );
        return {};
    }
  }

  /**
   * Генерация ключа кэша
   */

  getCacheKey(type, identifier, context) {
    const data = `${type}_${identifier}_${JSON.stringify(context)}`;
    return crypto.createHash("md5").update(data).digest("hex");
  }

  /**
   * Получение из кэша
   */
  getFromCache(key) {
    const cachePath = path.join(this.cacheDir, `${key}.json`);
    if (fs.existsSync(cachePath)) {
      try {
        return JSON.parse(fs.readFileSync(cachePath, "utf-8"));
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  /**
   * Сохранение в кэш
   */
  saveToCache(key, data) {
    const cachePath = path.join(this.cacheDir, `${key}.json`);
    fs.writeFileSync(cachePath, JSON.stringify(data, null, 2), "utf-8");
  }

  /**
   * Получает целевое количество слов для страницы в зависимости от типа
   * @param {string} pageKey - Ключ страницы (home, products, services, etc.)
   * @returns {number} - Целевое количество слов
   */
  getTargetWordsForPage(pageKey) {
    const pageTargets = {
      home: 2500,        // Главная - самая информативная
      products: 2200,    // Продукты - много описаний
      services: 2000,    // Услуги - средний объем
      events: 2000,      // События - средний объем
      offers: 1800,      // Предложения - меньше текста, больше списков
      login: 800,        // Логин - минимальная страница
      register: 1200,    // Регистрация - немного больше
      app: 1500,         // Приложение - средне-минимальная
      link: 1000,        // Альтернативная ссылка - минимальная
    };

    return pageTargets[pageKey] || 2000; // По умолчанию 2000
  }

  /**
   * Рассчитывает распределение слов по секциям
   * @param {string[]} sections - Список секций на странице
   * @param {string} pageKey - Ключ страницы для определения целевого количества
   * @returns {object} - Объект { sectionKey: targetWords }
   */
  calculateWordDistribution(sections, pageKey = 'home') {
    const TARGET_TOTAL = this.getTargetWordsForPage(pageKey);

    // Веса для разных типов секций (чем больше вес, тем больше слов)
    const sectionWeights = {
      homeArticle: 10,        // Самая большая секция - детальные параграфы
      contentShowcase: 8,     // Большие контентные блоки
      faqBlock: 6,            // Развернутые ответы на вопросы
      featureGrid: 4,         // Описания преимуществ
      itemsList: 3,           // Описания продуктов
      howToPlay: 3,           // Инструкции
      offerSection: 2,        // Описания предложений
      paymentMethods: 1,      // Методы оплаты
      ctaBlock: 0.5,          // Призывы к действию (минимум текста)
    };

    // Считаем общий вес
    const totalWeight = sections.reduce(
      (sum, sectionKey) => sum + (sectionWeights[sectionKey] || 3),
      0,
    );

    // Распределяем слова пропорционально весам
    const distribution = {};
    sections.forEach((sectionKey) => {
      const weight = sectionWeights[sectionKey] || 3;
      distribution[sectionKey] = Math.round((weight / totalWeight) * TARGET_TOTAL);
    });

    return distribution;
  }

  /**
   * Получение рекомендаций по длине текста для разных типов секций
   */
  getLengthGuidelines(sectionKey, targetWords) {
    switch (sectionKey) {
      case "homeArticle":
        return `
- Each paragraph (p1, p2, p3): 200-300 words each
- List items: 10-15 words each
- Total: ~${targetWords} words
- Focus: Detailed, informative paragraphs with rich content
        `.trim();

      case "contentShowcase":
        return `
- Each content block: 150-200 words
- Total: ~${targetWords} words
- Focus: Substantial text blocks with detailed information
        `.trim();

      case "faqBlock":
        return `
- Each answer: 80-120 words
- Questions: 10-15 words
- Total: ~${targetWords} words
- Focus: Comprehensive, helpful answers
        `.trim();

      case "featureGrid":
        return `
- Each feature description: 50-80 words
- Feature titles: 3-5 words
- Total: ~${targetWords} words
- Focus: Clear, detailed feature explanations
        `.trim();

      case "itemsList":
        return `
- Each item description: 30-50 words
- Item names: 2-4 words
- Total: ~${targetWords} words
- Focus: Engaging product/service descriptions
        `.trim();

      case "howToPlay":
        return `
- Each step description: 30-40 words
- Step titles: 3-5 words
- Total: ~${targetWords} words
- Focus: Clear, actionable instructions
        `.trim();

      case "offerSection":
        return `
- Each offer description: 40-60 words
- Offer titles: 3-5 words
- Total: ~${targetWords} words
- Focus: Attractive, detailed offer descriptions
        `.trim();

      case "paymentMethods":
        return `
- Each method description: 15-25 words
- Method names: 1-2 words
- Total: ~${targetWords} words
- Focus: Brief, clear payment method info
        `.trim();

      case "ctaBlock":
        return `
- Main text: 20-30 words
- Button text: 2-4 words
- Total: ~${targetWords} words
- Focus: Concise, compelling call-to-action
        `.trim();

      default:
        return `
- Aim for ~${targetWords} words total
- Distribute evenly across all text fields
- Focus on quality and engagement
        `.trim();
    }
  }
}

module.exports = ContentGenerator;
