/**
 * Color Themes System
 * Provides different color schemes for generated sites
 *
 * ВАЖНО: Структура colors должна соответствовать типам в styled.d.ts
 */

const colorThemes = {
  // 1. Темная тема - темный фон, белый текст, яркие акценты
  dark: {
    name: "Темная (Dark Casino)",
    description: "Темный фон, белый текст и яркие золотые акценты",
    colors: {
      // Основные цвета (обязательные для типов)
      primary: "#E59B4E",
      primaryDark: "#C47E3A",
      primaryLight: "#F5B76A",
      secondary: "#9f1fc9",

      // Фоны
      background: "#0f0e0f",
      backgroundLight: "#6A1540",
      backgroundDark: "#2A061A",

      // Текст
      text: "#FFFFFF",
      textMuted: "#F1C6D8",
      textLight: "#FFFFFF",

      // Границы
      border: "#7A1C49",

      // Статусы
      success: "#20C997",
      warning: "#E59B4E",
      error: "#FF3B3B",
      info: "#4DA3FF",

      // Базовые
      white: "#FFFFFF",
      black: "#2A061A",
    },
    gradients: {
      primary:
        "linear-gradient(180deg, #FFD36A 0%, #F3A53B 38%, #E07A22 70%, #B94A10 100%)",
      dark: "linear-gradient(180deg, #6A1540 0%, #2A061A 100%)",
      light: "linear-gradient(180deg, #FFFFFF 0%, #F7EAF0 100%)",
      gradientPrimary:
        "linear-gradient(135deg, #F6C85F 0%, #D99A2B 50%, #F1D27A 100%)",
    },
  },

  // 2. Светлая тема - белый фон, черный текст, зелено-голубые акценты
  light: {
    name: "Светлая (Light Fresh)",
    description: "Белый фон, черный текст и яркие зелено-голубые оттенки",
    colors: {
      // Основные цвета
      primary: "#00C9A7",
      primaryDark: "#00A896",
      primaryLight: "#00F5A0",
      secondary: "#0077B6",

      // Фоны
      background: "#FFFFFF",
      backgroundLight: "#F8F9FA",
      backgroundDark: "#DEE2E6",

      // Текст
      text: "#212529",
      textMuted: "#6C757D",
      textLight: "#495057",

      // Границы
      border: "#DEE2E6",

      // Статусы
      success: "#20C997",
      warning: "#FFC107",
      error: "#DC3545",
      info: "#0DCAF0",

      // Базовые
      white: "#FFFFFF",
      black: "#212529",
    },
    gradients: {
      primary: "linear-gradient(180deg, #00F5A0 0%, #00C9A7 50%, #00A896 100%)",
      dark: "linear-gradient(180deg, #212529 0%, #343A40 100%)",
      light: "linear-gradient(180deg, #FFFFFF 0%, #F8F9FA 100%)",
      gradientPrimary:
        "linear-gradient(135deg, #00C2FF 0%, #00D6A3 55%, #7CFFB2 100%)",
    },
  },

  // 3. Спортивная тема - яркая, энергичная, оранжево-синяя
  sport: {
    name: "Спортивная (Sport Energy)",
    description: "Яркая энергичная тема с оранжево-синими акцентами",
    colors: {
      // Основные цвета
      primary: "#FF6B35",
      primaryDark: "#E55A2B",
      primaryLight: "#FF8C5A",
      secondary: "#004E89",

      // Фоны
      background: "#1A1A2E",
      backgroundLight: "#16213E",
      backgroundDark: "#0F0F1E",

      // Текст
      text: "#FFFFFF",
      textMuted: "#E0E0E0",
      textLight: "#CCCCCC",

      // Границы
      border: "#2E3A59",

      // Статусы
      success: "#06FFA5",
      warning: "#FFD23F",
      error: "#FF006E",
      info: "#00B4D8",

      // Базовые
      white: "#FFFFFF",
      black: "#0F0F1E",
    },
    gradients: {
      primary: "linear-gradient(180deg, #FFD23F 0%, #FF6B35 50%, #FF4500 100%)",
      dark: "linear-gradient(180deg, #0F0F1E 0%, #1A1A2E 100%)",
      light: "linear-gradient(180deg, #FFFFFF 0%, #F0F0F0 100%)",
      gradientPrimary:
        "linear-gradient(135deg, #FF7A00 0%, #FF3D3D 40%, #2A6BFF 100%)",
    },
  },

  // 4. Зеленая тема - природная, свежая, зелено-изумрудная
  green: {
    name: "Зеленая (Green Nature)",
    description: "Природная свежая тема с зелено-изумрудными оттенками",
    colors: {
      // Основные цвета
      primary: "#10B981",
      primaryDark: "#059669",
      primaryLight: "#34D399",
      secondary: "#14B8A6",

      // Фоны
      background: "#064E3B",
      backgroundLight: "#065F46",
      backgroundDark: "#022C22",

      // Текст
      text: "#FFFFFF",
      textMuted: "#D1FAE5",
      textLight: "#F0FDF4",

      // Границы
      border: "#047857",

      // Статусы
      success: "#10B981",
      warning: "#F59E0B",
      error: "#EF4444",
      info: "#3B82F6",

      // Базовые
      white: "#FFFFFF",
      black: "#022C22",
    },
    gradients: {
      primary: "linear-gradient(180deg, #34D399 0%, #10B981 50%, #059669 100%)",
      dark: "linear-gradient(180deg, #022C22 0%, #064E3B 100%)",
      light: "linear-gradient(180deg, #FFFFFF 0%, #F0FDF4 100%)",
      gradientPrimary:
        "linear-gradient(135deg, #6EE7B7 0%, #10B981 55%, #059669 100%)",
    },
  },

  // 5. Красно-бордовая тема - роскошная, премиум, винно-красная
  burgundy: {
    name: "Красно-бордовая (Burgundy Luxury)",
    description: "Роскошная премиум тема с винно-красными оттенками",
    colors: {
      // Основные цвета
      primary: "#DC2626",
      primaryDark: "#991B1B",
      primaryLight: "#f8b117",
      secondary: "#ed7809",

      // Фоны
      background: "#450A0A",
      backgroundLight: "#7F1D1D",
      backgroundDark: "#1C0A0A",

      // Текст
      text: "#FFFFFF",
      textMuted: "#FEE2E2",
      textLight: "#FEF2F2",

      // Границы
      border: "#991B1B",

      // Статусы
      success: "#10B981",
      warning: "#F59E0B",
      error: "#DC2626",
      info: "#3B82F6",

      // Базовые
      white: "#FFFFFF",
      black: "#1C0A0A",
    },
    gradients: {
      primary: "linear-gradient(180deg, #EF4444 0%, #DC2626 50%, #991B1B 100%)",
      dark: "linear-gradient(180deg, #1C0A0A 0%, #450A0A 100%)",
      light: "linear-gradient(180deg, #FFFFFF 0%, #FEF2F2 100%)",
      gradientPrimary:
        "linear-gradient(135deg, #F87171 0%, #DC2626 55%, #991B1B 100%)",
    },
  },
};

/**
 * Get theme by key
 */
function getTheme(themeKey) {
  return colorThemes[themeKey] || colorThemes.dark;
}

/**
 * Get all available themes
 */
function getAllThemes() {
  return Object.keys(colorThemes).map((key) => ({
    key,
    ...colorThemes[key],
  }));
}

module.exports = {
  colorThemes,
  getTheme,
  getAllThemes,
};
