import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

const config: Config = {
  title: "use-local-llm",
  tagline: "React hooks for streaming local LLM responses",
  favicon: "img/favicon.ico",
  url: "https://pooyagolchian.github.io",
  baseUrl: "/use-local-llm/",
  organizationName: "pooyagolchian",
  projectName: "use-local-llm",
  trailingSlash: false,
  onBrokenLinks: "throw",

  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
          editUrl:
            "https://github.com/pooyagolchian/use-local-llm/tree/main/docs-site/",
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: "img/social-card.png",
    navbar: {
      title: "use-local-llm",
      items: [
        {
          type: "docSidebar",
          sidebarId: "docsSidebar",
          position: "left",
          label: "Docs",
        },
        {
          href: "https://pooyagolchian.github.io/use-local-llm/demo/",
          label: "Live Demo",
          position: "left",
        },
        {
          href: "https://www.npmjs.com/package/use-local-llm",
          label: "npm",
          position: "right",
        },
        {
          href: "https://github.com/pooyagolchian/use-local-llm",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Docs",
          items: [
            { label: "Getting Started", to: "/docs/getting-started" },
            { label: "API Reference", to: "/docs/api/use-ollama" },
          ],
        },
        {
          title: "Links",
          items: [
            {
              label: "npm",
              href: "https://www.npmjs.com/package/use-local-llm",
            },
            {
              label: "GitHub",
              href: "https://github.com/pooyagolchian/use-local-llm",
            },
          ],
        },
        {
          title: "Backends",
          items: [
            { label: "Ollama", href: "https://ollama.com" },
            { label: "LM Studio", href: "https://lmstudio.ai" },
            { label: "llama.cpp", href: "https://github.com/ggml-org/llama.cpp" },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Pooya Golchian. MIT License.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ["bash", "json"],
    },
    colorMode: {
      defaultMode: "dark",
      respectPrefersColorScheme: true,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
