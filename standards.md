# Angular compiler & compiler-cli coding standards

This document captures project-specific conventions for work in:

- `packages/compiler`
- `packages/compiler-cli`

It complements the repository-wide guidance in contributing-docs/coding-standards.md.

## Core principles

- **Ivy locality / purity**: treat compilation of a decorated class as a mostly local transformation. When possible, keep “compiler” units pure functions of their explicit inputs.
- **Correctness over cleverness**: compiler output and diagnostics must remain stable and correct across incremental builds, watch mode, and different host environments.
- **Incremental performance is a feature**: avoid changes that turn an incremental workflow into effectively full recompilation.
- **Cross-platform determinism**: avoid OS-specific path and filesystem assumptions; use the ngtsc virtual filesystem layer.

## Architecture boundaries (compiler vs compiler-cli)

### `packages/compiler`

- Prefer **declarative, side-effect-free helpers** for AST / metadata transformations.
- When introducing new transformations, keep them **local** to the declaration being compiled unless a global phase is strictly required.
- Prefer using established utility helpers (e.g. internal error helpers) rather than inventing ad-hoc patterns for similar failures.

### `packages/compiler-cli` (ngtsc)

- Keep clear separation between:
  - **Analysis** (extracting metadata from TS)
  - **Resolve / linking** (connecting symbols / scopes)
  - **Emit** (producing JS / d.ts and type-check artifacts)
- Don’t introduce hidden dependencies that incremental reconciliation can’t see. If analysis needs values from other files, ensure it flows through the existing partial evaluation and dependency tracking.

## TypeScript compiler API usage

- Prefer **immutable AST creation** via `ts.factory` rather than mutating nodes.
- Avoid holding on to `ts.Node` objects longer than needed in long-lived caches unless the code already does so intentionally.
- When a helper doesn’t need the full TS API surface, accept narrower types (e.g. `ts.Node` vs `ts.Declaration`, or a small interface) to make constraints explicit.

## Template type-checking (TCBs)

- Treat TCB code as **type-level semantics only**: runtime behavior is irrelevant.
- Keep generated TCBs minimal and stable to preserve TypeScript incremental performance.
- When emitting source-location breadcrumbs for diagnostics:
  - Use the existing span/comment mechanisms (`addParseSpanInfo`, `addTypeCheckId`, and related helpers).
  - Only wrap expressions in parentheses when needed for correct diagnostic attachment (`wrapForDiagnostics`, `wrapForTypeChecker`).
- When filtering diagnostics produced from TCBs, follow the existing suppression rules rather than adding broad “catch-all” filters.

## Incremental compilation & performance

- Preserve the “tick-tock” model of user program vs type-check program creation:
  - Any new flow that changes how `ts.Program`s are created must keep **incremental creation** as a hard requirement.
- Be careful with changes that alter:
  - how semantic dependencies are recorded
  - what constitutes a “logically changed” file
  - the criteria for skipping emit
- If you add new semantic inputs that influence emit (selectors, type-check shapes, etc.), ensure they are represented in the appropriate incremental structures (dependency graph / semantic symbols).

## Virtual filesystem & path handling (compiler-cli)

- Avoid direct use of Node `fs`/`path` in ngtsc implementation code.
- Prefer the ngtsc filesystem abstractions:
  - depend on the narrowest interface you need (`PathManipulation`, `ReadonlyFileSystem`, `FileSystem`)
  - prefer passing filesystem objects explicitly instead of relying on the global current filesystem
- If you must use the global filesystem helpers, ensure initialization happens reliably in all call paths.

### Testing filesystem-dependent code

- Tests that touch filesystem/path semantics should run under all supported mock filesystems.
- Use the provided helpers:
  - `runInEachFileSystem(...)`
  - `initMockFileSystem(os)`
  - `loadTestFiles(...)`, `loadStandardTestFiles(...)`

## Diagnostics & error reporting

- Prefer existing diagnostic constructors and helpers rather than creating bespoke `ts.Diagnostic` objects.
- Diagnostics should:
  - point at the most precise span possible
  - include actionable messages
  - use related information for context and traces (especially for partial evaluation failures)
- For template diagnostics:
  - construct via the existing template diagnostic builders
  - include component/template context as related information when mapping is indirect/external

## Asynchronous compilation inputs

- When compilation depends on asynchronously produced inputs (e.g. external resources), follow the established pattern:
  - create the compiler
  - call `analyzeAsync` and await it
  - only then proceed with synchronous compiler APIs

## Review checklist (use for PRs/commits)

- Does the change preserve Ivy locality and keep compilers as pure as feasible?
- Does it keep incremental builds fast (no unnecessary full-program work)?
- Are filesystem/path operations using the ngtsc abstractions and covered by multi-OS tests when relevant?
- Are diagnostics precise, actionable, and using established helpers?
- Are new caches/incremental state invalidated correctly and deterministically?
