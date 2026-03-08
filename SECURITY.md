# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in `use-local-llm`, please report it responsibly.

**Do not open a public GitHub issue for security vulnerabilities.**

Instead, please email: [Open a private security advisory on GitHub](https://github.com/pooyagolchian/use-local-llm/security/advisories/new)

## Scope

This package is designed for **local-only** communication between a browser and a localhost LLM server. It does not:

- Send data to external servers
- Store credentials or tokens
- Execute user-provided code

## CORS Warning

When using this library in a browser, users must configure CORS on their local LLM server. The library itself does not modify CORS headers. See the [README](README.md#cors-configuration) for backend-specific instructions.
