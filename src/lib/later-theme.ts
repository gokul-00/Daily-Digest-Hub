import type { Theme } from "theme-ui";

/** Theme UI theme aligned with Later.'s paper + ink palette. */
export const laterTheme: Theme = {
  config: {
    useRootStyles: false,
    useBorderBox: true,
  },
  fonts: {
    body: '"Inter", ui-sans-serif, system-ui, sans-serif',
    heading: '"Fraunces", ui-serif, Georgia, serif',
    monospace: '"JetBrains Mono", ui-monospace, monospace',
  },
  colors: {
    text: "#3a342c",
    background: "#f2ebe0",
    primary: "#b84a3a",
    secondary: "#8a6f55",
    muted: "#6b6358",
    accent: "#b84a3a",
    card: "#faf6ef",
    border: "#d9cfc0",
    blockHover: "rgba(184, 74, 58, 0.07)",
    callout: "#f7f2ea",
    calloutBorder: "#b84a3a",
    ideaBorder: "#8a6f55",
    page: "#faf6ef",
    gutter: "#c4b8a8",
  },
  space: [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 96],
  fontSizes: [11, 12, 13, 14, 16, 18, 20, 24, 28, 36, 48],
  fontWeights: {
    body: 400,
    heading: 500,
    bold: 600,
  },
  lineHeights: {
    body: 1.65,
    heading: 1.25,
    tight: 1.35,
  },
  radii: {
    default: 6,
    card: 10,
    pill: 9999,
  },
  shadows: {
    page: "0 1px 0 rgba(58, 52, 44, 0.05), 0 20px 50px -24px rgba(58, 52, 44, 0.28)",
    block: "0 0 0 1px rgba(217, 207, 192, 0.8)",
  },
  sizes: {
    container: "720px",
    gutter: "28px",
  },
  text: {
    heading: {
      fontFamily: "heading",
      fontWeight: "heading",
      lineHeight: "heading",
      color: "text",
    },
  },
  styles: {
    root: {
      fontFamily: "body",
      fontSize: 2,
      lineHeight: "body",
      color: "text",
    },
  },
};
