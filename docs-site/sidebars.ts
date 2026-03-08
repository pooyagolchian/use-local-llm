import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebars: SidebarsConfig = {
  docsSidebar: [
    "introduction",
    "getting-started",
    "installation",
    {
      type: "category",
      label: "API Reference",
      collapsed: false,
      items: [
        "api/use-ollama",
        "api/use-local-llm",
        "api/use-stream-completion",
        "api/use-model-list",
      ],
    },
    {
      type: "category",
      label: "Guides",
      items: [
        "guides/cors-setup",
        "guides/backends",
        "guides/examples",
        "guides/advanced-usage",
      ],
    },
    {
      type: "category",
      label: "Internals",
      collapsed: true,
      items: [
        "internals/architecture",
        "internals/stream-parser",
        "internals/endpoints",
        "internals/typescript-reference",
      ],
    },
  ],
};

export default sidebars;
