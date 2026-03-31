#!/usr/bin/env node

/**
 * Site Generator Orchestrator v2.10
 * Управляет полным процессом генерации сайта
 */

const path = require('path');
const ConfigValidator = require('./lib/config-validator');
const PlaceholderGenerator = require('./lib/placeholder-generator');
const ContentGenerator = require('./lib/content-generator');
const SEOGenerator = require('./lib/seo-generator');
require('dotenv').config();

async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('🚀  UNIVERSAL SITE GENERATOR v2.10 - AI-Ready Content Generation');
  console.log('='.repeat(60) + '\n');

  try {
    // Phase 1: Сбор конфигурации
    console.log('📋 PHASE 1: Сбор конфигурации\n');
    const SiteGenerator = require('./generator');
    const generator = new SiteGenerator();
    
    await generator.run();
    const config = generator.config;

    // Phase 2: Валидация конфигурации
    console.log('\n📋 PHASE 2: Валидация конфигурации\n');
    const validator = new ConfigValidator(config);
    const validationResult = validator.validate();

    if (!validationResult.isValid) {
      console.log('❌ Генерация прервана из-за ошибок в конфигурации.\n');
      process.exit(1);
    }

    // Phase 3: Генерация структуры проекта
    console.log('\n📋 PHASE 3: Генерация структуры проекта\n');
    const ProjectBuilder = require('./lib/project-builder');
    const outputDir = path.join(__dirname, 'output');
    const projectBuilder = new ProjectBuilder(config, outputDir);
    const projectPath = await projectBuilder.build();

    // Phase 4: Генерация плейсхолдеров common.json
    console.log('\n📋 PHASE 4: Генерация плейсхолдеров\n');
    const placeholderGenerator = new PlaceholderGenerator(config, projectPath);
    placeholderGenerator.generateAll();

    // Phase 5: Генерация файлов из шаблонов
    console.log('\n📋 PHASE 5: Генерация файлов из шаблонов\n');
    const FileGenerator = require('./lib/file-generator');
    const templatesDir = path.join(__dirname, 'templates');
    const fileGenerator = new FileGenerator(config, projectPath, templatesDir);
    await fileGenerator.generateAll();

    // Phase 5.5: Генерация контента (stub/ai)
    console.log('\n📋 PHASE 5.5: Генерация контента\n');
    const contentMode = process.env.CONTENT_MODE || 'stub';
    const contentGenerator = new ContentGenerator(config, projectPath, contentMode);
    await contentGenerator.generateContent();

    // Phase 6: Генерация SEO файлов (robots.txt, sitemap.xml)
    console.log('\n📋 PHASE 6: Генерация SEO файлов\n');
    const seoGenerator = new SEOGenerator(config, projectPath);
    seoGenerator.generate();

    // Финальное сообщение
    console.log('\n' + '='.repeat(60));
    console.log('✅ ГЕНЕРАЦИЯ ЗАВЕРШЕНА УСПЕШНО!');
    console.log('='.repeat(60) + '\n');
    
    console.log('📁 Проект создан: ' + projectPath);
    console.log('\n📝 Следующие шаги:\n');
    console.log('1. Проверьте структуру проекта');
    console.log('2. Настройте .env (скопируйте .env.example)');
    console.log('3. Запустите с AI: CONTENT_MODE=ai node orchestrator.js');
    console.log('4. Соберите сайт: cd ' + path.basename(projectPath) + ' && npm install && npm run build');
    console.log('5. Запустите dev сервер: npm run dev\n');

  } catch (error) {
    console.error('\n❌ Ошибка:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
