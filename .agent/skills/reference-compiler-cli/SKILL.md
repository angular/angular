---
name: reference-compiler-cli
description: Explains the mental model and architecture of the code under `packages/compiler-cli`. You MUST use this skill any time you plan to work with code in `packages/compiler-cli`
---

# Angular Compiler CLI (`ngtsc`) Architecture

## Overview

The `packages/compiler-cli` package contains the Angular Compiler (Ivy), often referred to as `ngtsc`. It is a wrapper around the TypeScript compiler (`tsc`) that extends it with Angular-specific capabilities.

The core goal of `ngtsc` is to compile Angular decorators (like `@Component`, `@Directive`, `@Pipe`) into static properties on the class (Ivy instructions, e.g., `static ɵcmp = ...`). It also performs template type checking and ahead-of-time (AOT) compilation.

## Mental Model

The compiler is designed as a **lazy, incremental, and partial** compilation pipeline.

1.  **Wrapper Pattern**: `NgtscProgram` wraps the standard `ts.Program`. It intercepts calls to act as a drop-in replacement for standard tooling.
2.  **Traits System**: Every class with an Angular decorator is considered a "Trait". The compiler manages the state of these traits through a state machine:
    - **Pending**: Detected but not processed.
    - **Analyzed**: Metadata extracted, template parsed (but dependencies not yet linked).
    - **Resolved**: Dependencies (directives/pipes in template) resolved, import cycles handled.
    - **Skipped**: Not an Angular class.
3.  **Lazy Analysis**: Analysis only happens when necessary (e.g., when diagnostics are requested or emit is prepared).
4.  **Output AST**: The compiler generates an intermediate "Output AST" (`o.Expression`) for the generated code, which is then translated into TypeScript AST nodes during the emit phase.

## Key Subsystems

### 1. Core Orchestration (`ngtsc/core`)

- **`NgtscProgram`**: The public API implementing `api.Program`. It manages the `ts.Program` and the `NgCompiler`.
- **`NgCompiler`**: The brain of the compiler. It orchestrates the compilation phases (Analysis, Resolution, Type Checking, Emit). It holds the `TraitCompiler`.

### 2. Trait Compilation (`ngtsc/transform`)

- **`TraitCompiler`**: Manages the lifecycle of "Traits". It iterates over source files, identifies decorated classes, and delegates to the appropriate `DecoratorHandler`.
- **`Trait`**: A state container for a class, holding its handler, analysis results, and resolution results.

### 3. Decorator Handlers (`ngtsc/annotations`)

- **`DecoratorHandler`**: An interface for handling specific decorators.
- **`ComponentDecoratorHandler`**: The most complex handler. It:
  - Extracts metadata (selector, inputs, outputs).
  - Parses the template.
  - Resolves used directives and pipes (`R3TargetBinder`).
  - Generates the `ɵcmp` instruction.
- **`DirectiveDecoratorHandler`**, **`PipeDecoratorHandler`**, **`NgModuleDecoratorHandler`**: Handle their respective decorators.

### 4. Template Type Checking (`ngtsc/typecheck`)

- **`TemplateTypeChecker`**: Generates "Type Check Blocks" (TCBs). A TCB is a block of TypeScript code that represents the template's logic in a way `tsc` can understand and check for errors.
- **`TypeCheckBlock`**: The actual generated code that validates bindings, events, and structural directives.

### 5. Metadata & Scope (`ngtsc/metadata`, `ngtsc/scope`)

- **`MetadataReader`**: Reads Angular metadata from source files (using `LocalMetadataRegistry`) and `.d.ts` files (using `DtsMetadataReader`).
- **`ScopeRegistry`**: Determines the "compilation scope" of a component (which directives/pipes are available to it), handling `NgModule` transitive exports and Standalone Component imports.

### 6. Emit & Transformation (`ngtsc/transform`)

- **`ivyTransformFactory`**: A TypeScript transformer factory.
- **`IvyCompilationVisitor`**: Visits classes, triggers compilation via `TraitCompiler`, and collects the Output AST.
- **`IvyTransformationVisitor`**: Translates the Output AST into TypeScript AST, injects the `static ɵ...` fields, and removes the original decorators.

## Compilation Phases

1.  **Construction**: `NgtscProgram` creates `NgCompiler`, which sets up all registries and the `TraitCompiler`.
2.  **Analysis** (`analyzeSync`):
    - The `TraitCompiler` scans files.
    - `DecoratorHandler`s extract metadata and parse templates.
    - No cross-file resolution happens here (allowing for parallelism and caching).
3.  **Resolution** (`resolve`):
    - `TraitCompiler` resolves traits.
    - Components link their templates to specific Directives and Pipes (found via `ScopeRegistry`).
    - Import cycles are detected and handled (e.g., via "remote scoping").
4.  **Type Checking**:
    - `TemplateTypeChecker` creates TCBs for all components.
    - TypeScript diagnostics are retrieved for these TCBs.
5.  **Emit** (`prepareEmit`):
    - `ivyTransformFactory` is created.
    - TS `emit` is called.
    - The transformers run, injecting the compiled Ivy instructions into the JS/DTS output.

## Important File Locations

- `packages/compiler-cli/src/ngtsc/program.ts`: Entry point (`NgtscProgram`).
- `packages/compiler-cli/src/ngtsc/core/src/compiler.ts`: Core logic (`NgCompiler`).
- `packages/compiler-cli/src/ngtsc/transform/src/trait.ts`: Trait state machine.
- `packages/compiler-cli/src/ngtsc/annotations/component/src/handler.ts`: Component compilation logic.
- `packages/compiler-cli/src/ngtsc/typecheck/src/template_type_checker.ts`: Type checking logic.
- `packages/compiler-cli/src/ngtsc/transform/src/transform.ts`: AST transformation logic.
