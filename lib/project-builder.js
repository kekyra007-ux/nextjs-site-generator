/**
 * Project Builder
 * Generates complete Next.js project structure
 */

const fs = require('fs');
const path = require('path');
const TemplateEngine = require('./template-engine');

class ProjectBuilder {
  constructor(config, outputDir) {
    this.config = config;
    this.outputDir = outputDir;
    this.templateEngine = new TemplateEngine(config);
    this.projectPath = path.join(outputDir, config.project.name);
  }

  /**
   * Create directory structure
   */
  createDirectoryStructure() {
    const dirs = [
      this.projectPath,
      path.join(this.projectPath, 'src'),
      path.join(this.projectPath, 'src', 'components'),
      path.join(this.projectPath, 'src', 'pages'),
      path.join(this.projectPath, 'src', 'pages', '[locale]'),
      path.join(this.projectPath, 'src', 'styles'),
      path.join(this.projectPath, 'lib'),
      path.join(this.projectPath, 'public'),
      path.join(this.projectPath, 'public', 'locales'),
      path.join(this.projectPath, 'scripts')
    ];

    // Create locale directories
    for (const locale of this.config.geo.locales) {
      dirs.push(path.join(this.projectPath, 'public', 'locales', locale));
    }

    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });

    console.log('✅ Структура папок создана');
  }

  /**
   * Generate package.json
   */
  generatePackageJson() {
    const packageJson = {
      name: this.config.project.name,
      version: "0.1.0",
      private: true,
      scripts: {
        dev: "next dev",
        build: "next build && node scripts/inject-seo.js",
        start: "next start",
        lint: "eslint"
      },
      dependencies: {
        "i18next": "^23.11.5",
        "next": "14.1.0",
        "next-i18next": "^15.3.0",
        "next-language-detector": "^1.1.1",
        "react": "18.2.0",
        "react-dom": "18.2.0",
        "react-i18next": "^14.1.2",
        "styled-components": "^6.1.11"
      },
      devDependencies: {
        "@types/node": "^20",
        "@types/react": "^18.2.0",
        "@types/react-dom": "^18.2.0",
        "@types/styled-components": "^5.1.34",
        "babel-plugin-styled-components": "^2.1.4",
        "eslint": "8",
        "eslint-config-next": "14.1.0",
        "typescript": "^5"
      }
    };

    const filePath = path.join(this.projectPath, 'package.json');
    fs.writeFileSync(filePath, JSON.stringify(packageJson, null, 2));
    console.log('✅ package.json создан');
  }

  /**
   * Generate next.config.js
   */
  generateNextConfig() {
    const content = `/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactStrictMode: true,
  compiler: {
    styledComponents: true,
  },
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
`;

    const filePath = path.join(this.projectPath, 'next.config.js');
    fs.writeFileSync(filePath, content);
    console.log('✅ next.config.js создан');
  }

  /**
   * Generate next-i18next.config.js
   */
  generateI18nConfig() {
    const content = `const path = require("path");

module.exports = {
  i18n: {
    defaultLocale: "${this.config.geo.defaultLocale}",
    locales: ${JSON.stringify(this.config.geo.locales)},
  },
  localePath: path.resolve("./public/locales"),
  reloadOnPrerender: process.env.NODE_ENV === "development",
  react: {
    useSuspense: false,
  },
};
`;

    const filePath = path.join(this.projectPath, 'next-i18next.config.js');
    fs.writeFileSync(filePath, content);
    console.log('✅ next-i18next.config.js создан');
  }

  /**
   * Generate tsconfig.json
   */
  generateTsConfig() {
    const tsconfig = {
      compilerOptions: {
        baseUrl: ".",
        target: "ES2017",
        lib: ["dom", "dom.iterable", "esnext"],
        allowJs: true,
        skipLibCheck: true,
        strict: true,
        noEmit: true,
        esModuleInterop: true,
        module: "esnext",
        moduleResolution: "bundler",
        resolveJsonModule: true,
        isolatedModules: true,
        jsx: "preserve",
        incremental: true,
        plugins: [
          {
            name: "next"
          }
        ],
        paths: {
          "@/*": ["./src/*"]
        }
      },
      include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts", ".next/dev/types/**/*.ts", "**/*.mts"],
      exclude: ["node_modules"]
    };

    const filePath = path.join(this.projectPath, 'tsconfig.json');
    fs.writeFileSync(filePath, JSON.stringify(tsconfig, null, 2));
    console.log('✅ tsconfig.json создан');
  }

  /**
   * Generate redirect.js helper
   */
  generateRedirectHelper() {
    const redirectTemplate = fs.readFileSync(
      path.join(__dirname, '..', 'templates', 'lib', 'redirect.js.template'),
      'utf8'
    );
    const filePath = path.join(this.projectPath, 'lib', 'redirect.js');
    fs.writeFileSync(filePath, redirectTemplate);
    console.log('✅ lib/redirect.js создан');
  }

  /**
   * Generate languageDetector.js helper
   */
  generateLanguageDetectorHelper() {
    const detectorTemplate = fs.readFileSync(
      path.join(__dirname, '..', 'templates', 'lib', 'languageDetector.js.template'),
      'utf8'
    );
    const filePath = path.join(this.projectPath, 'lib', 'languageDetector.js');
    fs.writeFileSync(filePath, detectorTemplate);
    console.log('✅ lib/languageDetector.js создан');
  }

  /**
   * Generate root index.tsx with redirect
   */
  generateRootIndex() {
    const indexTemplate = fs.readFileSync(
      path.join(__dirname, '..', 'templates', 'pages', 'index.tsx.template'),
      'utf8'
    );
    const filePath = path.join(this.projectPath, 'src', 'pages', 'index.tsx');
    fs.writeFileSync(filePath, indexTemplate);
    console.log('✅ src/pages/index.tsx создан (корневой редирект)');
  }

  /**
   * Generate getStatic.js helper
   */
  generateGetStaticHelper() {
    const content = `const { serverSideTranslations } = require("next-i18next/serverSideTranslations");
const i18nextConfig = require("../next-i18next.config");

const getI18nPaths = () =>
  i18nextConfig.i18n.locales.map((lng) => ({
    params: {
      locale: lng,
    },
  }));

const getStaticPaths = () => ({
  fallback: false,
  paths: getI18nPaths(),
});

const makeStaticProps =
  (ns = []) =>
  async (ctx) => ({
    props: await serverSideTranslations(ctx?.params?.locale, ns, i18nextConfig),
  });

module.exports = { getStaticPaths, makeStaticProps };
`;

    const filePath = path.join(this.projectPath, 'lib', 'getStatic.js');
    fs.writeFileSync(filePath, content);
    console.log('✅ lib/getStatic.js создан');
  }

  /**
   * Generate locale JSON files
   * NOTE: В v2.8 генерация locale файлов перенесена в PlaceholderGenerator
   */
  generateLocaleFiles() {
    // Создаем только директории для locales
    for (const locale of this.config.geo.locales) {
      const localePath = path.join(
        this.projectPath,
        'public',
        'locales',
        locale
      );
      
      if (!fs.existsSync(localePath)) {
        fs.mkdirSync(localePath, { recursive: true });
      }
      console.log(`✅ Locale директория создана: ${locale}/`);
    }
  }

  /**
   * Build complete project
   */
  async build() {
    console.log('\n🔨 Начинаем генерацию проекта...\n');

    this.createDirectoryStructure();
    this.generatePackageJson();
    this.generateNextConfig();
    this.generateI18nConfig();
    this.generateTsConfig();
    this.generateGetStaticHelper();
    this.generateRedirectHelper();
    this.generateLanguageDetectorHelper();
    this.generateRootIndex();
    this.generateLocaleFiles();

    console.log('\n✅ Базовая структура проекта создана!');
    console.log(`📁 Путь: ${this.projectPath}\n`);

    return this.projectPath;
  }
}

module.exports = ProjectBuilder;
