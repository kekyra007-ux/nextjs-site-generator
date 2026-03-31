/**
 * Config Validator
 * Проверяет корректность конфигурации перед генерацией
 */

class ConfigValidator {
  constructor(config) {
    this.config = config;
    this.errors = [];
    this.warnings = [];
  }

  /**
   * Запуск полной валидации
   */
  validate() {
    console.log('\n' + '='.repeat(60));
    console.log('🔍 ВАЛИДАЦИЯ КОНФИГУРАЦИИ');
    console.log('='.repeat(60) + '\n');

    this.validateProject();
    this.validateGeo();
    this.validatePages();
    this.validatePageSections();
    this.validatePageKeywords();

    this.displayResults();

    return {
      isValid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings
    };
  }

  /**
   * Валидация project
   */
  validateProject() {
    const { project } = this.config;

    if (!project) {
      this.errors.push('❌ Отсутствует секция "project"');
      return;
    }

    if (!project.name || project.name.trim() === '') {
      this.errors.push('❌ project.name не может быть пустым');
    }

    if (!project.baseUrl || project.baseUrl.trim() === '') {
      this.errors.push('❌ project.baseUrl не может быть пустым');
    } else if (!project.baseUrl.startsWith('http')) {
      this.errors.push('❌ project.baseUrl должен начинаться с http:// или https://');
    }

    if (!project.brandName || project.brandName.trim() === '') {
      this.errors.push('❌ project.brandName не может быть пустым');
    }

    if (!project.referralLink || project.referralLink.trim() === '') {
      this.warnings.push('⚠️  project.referralLink не указан (опционально)');
    }
  }

  /**
   * Валидация geo
   */
  validateGeo() {
    const { geo } = this.config;

    if (!geo) {
      this.errors.push('❌ Отсутствует секция "geo"');
      return;
    }

    if (!geo.locales || !Array.isArray(geo.locales) || geo.locales.length === 0) {
      this.errors.push('❌ geo.locales должен быть непустым массивом');
    }

    if (!geo.defaultLocale || geo.defaultLocale.trim() === '') {
      this.errors.push('❌ geo.defaultLocale не может быть пустым');
    } else if (geo.locales && !geo.locales.includes(geo.defaultLocale)) {
      this.errors.push('❌ geo.defaultLocale должен быть в списке geo.locales');
    }
  }

  /**
   * Валидация pages
   */
  validatePages() {
    const { pages } = this.config;

    if (!pages || !Array.isArray(pages) || pages.length === 0) {
      this.errors.push('❌ pages должен быть непустым массивом');
      return;
    }

    pages.forEach((page, index) => {
      if (!page.key) {
        this.errors.push(`❌ pages[${index}] не имеет ключа "key"`);
      }
    });
  }

  /**
   * Валидация pageSections
   */
  validatePageSections() {
    const { pages, pageSections } = this.config;

    if (!pageSections) {
      this.errors.push('❌ Отсутствует секция "pageSections"');
      return;
    }

    if (!pages) return;

    pages.forEach(page => {
      if (!pageSections[page.key]) {
        this.errors.push(`❌ Отсутствуют секции для страницы "${page.key}"`);
      } else if (!Array.isArray(pageSections[page.key])) {
        this.errors.push(`❌ pageSections["${page.key}"] должен быть массивом`);
      } else if (pageSections[page.key].length === 0) {
        this.warnings.push(`⚠️  Нет секций для страницы "${page.key}"`);
      }
    });
  }

  /**
   * Валидация pageKeywords
   */
  validatePageKeywords() {
    const { pages, geo, pageKeywords } = this.config;

    if (!pageKeywords) {
      this.errors.push('❌ Отсутствует секция "pageKeywords"');
      return;
    }

    if (!pages || !geo) return;

    const locales = geo.locales || [];

    pages.forEach(page => {
      if (!pageKeywords[page.key]) {
        this.errors.push(`❌ Отсутствуют keywords для страницы "${page.key}"`);
        return;
      }

      locales.forEach(locale => {
        if (!pageKeywords[page.key][locale]) {
          this.warnings.push(`⚠️  Отсутствуют keywords для "${page.key}" / "${locale}"`);
        } else if (!Array.isArray(pageKeywords[page.key][locale])) {
          this.errors.push(`❌ pageKeywords["${page.key}"]["${locale}"] должен быть массивом`);
        } else if (pageKeywords[page.key][locale].length === 0) {
          this.warnings.push(`⚠️  Пустой массив keywords для "${page.key}" / "${locale}"`);
        }
      });
    });
  }

  /**
   * Отображение результатов валидации
   */
  displayResults() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 РЕЗУЛЬТАТЫ ВАЛИДАЦИИ');
    console.log('='.repeat(60) + '\n');

    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('✅ Конфигурация валидна! Нет ошибок и предупреждений.\n');
      return;
    }

    if (this.errors.length > 0) {
      console.log('🚨 ОШИБКИ:\n');
      this.errors.forEach(error => console.log(`  ${error}`));
      console.log('');
    }

    if (this.warnings.length > 0) {
      console.log('⚠️  ПРЕДУПРЕЖДЕНИЯ:\n');
      this.warnings.forEach(warning => console.log(`  ${warning}`));
      console.log('');
    }

    if (this.errors.length > 0) {
      console.log('❌ Конфигурация содержит ошибки. Исправьте их перед генерацией.\n');
    } else {
      console.log('✅ Конфигурация валидна, но есть предупреждения.\n');
    }
  }
}

module.exports = ConfigValidator;
