# Contributing to use-local-llm

Thank you for considering contributing! This project welcomes contributions of all kinds.

## Development Setup

```bash
git clone https://github.com/pooyagolchian/use-local-llm.git
cd use-local-llm
pnpm install
```

## Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Watch mode (rebuilds on changes) |
| `pnpm build` | Production build |
| `pnpm test` | Run unit tests |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm test:live` | Run live integration test against Ollama |
| `pnpm typecheck` | TypeScript type checking |
| `pnpm check` | Biome lint + format (auto-fix) |
| `pnpm lint` | Biome lint only |
| `pnpm format` | Biome format only |

## Making Changes

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Run checks: `pnpm check && pnpm typecheck && pnpm test`
5. Commit with a descriptive message
6. Push and open a pull request

## Code Style

This project uses [Biome](https://biomejs.dev/) for formatting and linting. Run `pnpm check` before committing. Configuration is in `biome.json`.

## Testing

- Unit tests: `src/__tests__/` — run with `pnpm test`
- Live tests: `scripts/test-live.ts` — requires a running Ollama instance

## Adding a New Backend

1. Add the backend type to `Backend` in `src/types/index.ts`
2. Add endpoint config in `src/utils/endpoints.ts`
3. If the response format differs from Ollama/OpenAI, add parsing logic in `src/utils/streamParser.ts`
4. Add tests

## Reporting Issues

- Use the [GitHub Issues](https://github.com/pooyagolchian/use-local-llm/issues) page
- Include your Node.js version, React version, and which LLM backend you're using
- Include reproduction steps

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
