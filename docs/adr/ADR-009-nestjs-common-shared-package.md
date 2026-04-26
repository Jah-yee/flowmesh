# ADR-009: Shared NestJS Infrastructure as a Compiled Package

**Date:** 2026-04-26
**Status:** Accepted
**Deciders:** Arif Iqbal

## Context

Every NestJS service in the monorepo needs the same three infrastructure components:

- `HttpExceptionFilter` — catches all exceptions, returns a consistent JSON error envelope, logs 5xx at error level and 4xx at warn level with `correlationId`, `url`, and `method` context
- `CorrelationIdMiddleware` — reads or generates `x-correlation-id` on every request, echoes it on the response header
- `HealthController` / `HealthModule` — `GET /health` returning `{ status: 'ok' }`

When config-service was scaffolded, these files were copied directly from ingestion. This created three identical copies of the same code across services. Any change to logging format, error envelope shape, or correlation ID behavior requires touching every service. As more services are added, this diverges — services end up on different versions of the filter with different error shapes.

Three approaches were considered:

1. **Copy per service** — each service owns its own copy. No shared dependency, but divergence is guaranteed.
2. **Path alias to source** — services import directly from `packages/nestjs-common/src` via `tsconfig.paths`. Avoids duplication but violates TypeScript's `rootDir` constraint — `rootDir` is set to `src/` in each service tsconfig, and files outside that directory cannot be compiled.
3. **Compiled shared package** — `packages/nestjs-common` is built to `dist/`, published as a workspace package, and services import from it via `node_modules`. TypeScript resolves to `dist/index.d.ts`. No `rootDir` violation.

## Decision

Extract the shared infrastructure into `packages/nestjs-common` as a compiled pnpm workspace package. Services add `"@flowmesh/nestjs-common": "workspace:*"` to their `package.json` and import from it like any external package.

The package is built with `pnpm --filter @flowmesh/nestjs-common build` before dependent services run. No tsconfig path aliases are needed in service tsconfigs.

**Critical implementation detail — Logger injection in shared packages:**

`@InjectPinoLogger` cannot be used inside `nestjs-common`. The decorator relies on `LoggerModule` registering a named provider for each decorated class. `LoggerModule` only scans the host service's module graph — external compiled packages are outside that graph, so the named provider is never registered and NestJS throws a DI resolution error at startup.

The correct pattern for shared packages is `private readonly logger = new Logger(ClassName.name)`. NestJS `Logger` is a static singleton that automatically delegates to pino once the host service calls `app.useLogger(app.get(Logger))` in `main.ts`. The structured JSON output is identical.

## Consequences

### Positive
- One copy of each infrastructure component — changes to error envelope shape, logging format, or correlation ID behavior propagate to all services on next rebuild
- All services produce identical error responses — consistent API contract across the platform
- Adding a new service takes minutes: add the dependency, import, done
- The package has its own `vitest.config.ts` and tests — infrastructure components are tested independently of any service

### Negative
- Services must rebuild `nestjs-common` before picking up changes: `pnpm --filter @flowmesh/nestjs-common build`. Forgetting this causes services to run against stale compiled output with no error — the bug is silent.
- Compiled package means no hot-reload of shared infrastructure during `dev` — change to `nestjs-common` requires stopping the service, rebuilding, restarting
- DI injection patterns available in service code (like `@InjectPinoLogger`) are not available in package code — contributors must understand this constraint
