/**
 * Template Engine
 * Handles variable substitution in templates
 */

class TemplateEngine {
  constructor(config) {
    this.config = config;
    this.variables = this.buildVariables();
  }

  /**
   * Build all available variables for substitution
   */
  buildVariables() {
    const currentYear = new Date().getFullYear();

    return {
      // Project variables
      projectName: this.config.project.name,
      baseUrl: this.config.project.baseUrl,
      brandName: this.config.project.brandName,
      keywords: this.config.project.keywords,

      // GEO variables
      geoCountry: this.config.geo.name || "",
      geoCode: this.config.geo.code || "",
      geoRegion: this.config.geo.code || "",
      latitude: this.config.geo.coordinates?.latitude || "",
      longitude: this.config.geo.coordinates?.longitude || "",
      currency: this.config.geo.currency || "",
      timezone: this.config.geo.timezone || "",

      // Time variables
      year: currentYear,
      nextYear: currentYear + 1,

      // Locale variables (will be set per-locale)
      locale: "",
      localeName: "",
      ogLocale: "",
    };
  }

  /**
   * Apply template substitution
   * @param {string} template - Template string with {variable} placeholders
   * @param {object} additionalVars - Additional variables to merge
   * @returns {string} - Processed string
   */
  apply(template, additionalVars = {}) {
    const vars = { ...this.variables, ...additionalVars };

    let result = template;

    // Replace all {variable} patterns
    for (const [key, value] of Object.entries(vars)) {
      const regex = new RegExp(`\\{${key}\\}`, "g");
      result = result.replace(regex, value);
    }

    return result;
  }

  /**
   * Apply template with locale-specific variables
   * @param {string} template - Template string
   * @param {string} locale - Locale code
   * @param {object} additionalVars - Additional variables
   * @returns {string} - Processed string
   */
  applyWithLocale(template, locale, additionalVars = {}) {
    const localeVars = {
      locale: locale,
      localeName: this.config.geo.localeNames[locale] || locale,
      ogLocale:
        this.config.geo.ogLocales[locale] ||
        `${locale}_${this.config.geo.code}`,
    };

    return this.apply(template, { ...localeVars, ...additionalVars });
  }

  /**
   * Process content object with templates
   * @param {object} content - Content object with potential templates
   * @param {string} locale - Locale code
   * @returns {object} - Processed content object
   */
  processContent(content, locale) {
    const processed = {};

    for (const [key, value] of Object.entries(content)) {
      if (typeof value === "string") {
        processed[key] = this.applyWithLocale(value, locale);
      } else if (typeof value === "object" && value !== null) {
        processed[key] = this.processContent(value, locale);
      } else {
        processed[key] = value;
      }
    }

    return processed;
  }

  /**
   * Generate SEO meta tags with template support
   * @param {string} pageKey - Page key
   * @param {string} locale - Locale code
   * @returns {object} - SEO meta object
   */
  generateSeoMeta(pageKey, locale) {
    const content = this.config.content[pageKey][locale];

    if (!content || !content.seo) {
      return {
        title: `${this.config.project.brandName}`,
        description: `Welcome to ${this.config.project.brandName}`,
        keywords: this.config.project.keywords,
      };
    }

    return this.processContent(content.seo, locale);
  }

  /**
   * Generate hero content with template support
   * @param {string} pageKey - Page key
   * @param {string} locale - Locale code
   * @returns {object} - Hero content object
   */
  generateHeroContent(pageKey, locale) {
    const content = this.config.content[pageKey][locale];

    if (!content || !content.hero) {
      return {
        title: `Welcome to ${this.config.project.brandName}`,
        subtitle: `Discover the best gaming experience in ${this.config.geo.name}`,
      };
    }

    return this.processContent(content.hero, locale);
  }

  /**
   * Build complete locale JSON structure
   * @param {string} locale - Locale code
   * @returns {object} - Complete locale JSON
   */
  buildLocaleJson(locale) {
    const json = {
      seo: {},
      hero: {},
    };

    // Process all pages
    for (const page of this.config.pages) {
      json.seo[page.key] = this.generateSeoMeta(page.key, locale);
      json.hero[page.key] = this.generateHeroContent(page.key, locale);
    }

    return json;
  }
}

module.exports = TemplateEngine;
