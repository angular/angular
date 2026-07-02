---
name: reference-core
description: Explains the mental model and architecture of the code under `packages/core`. You MUST use this skill any time you plan to work with code in `packages/core`
---

# Angular Core (`packages/core`) Mental Model

This document outlines the architecture and mental model for `packages/core`, the heart of the Angular framework.

## 1. High-Level Architecture

`packages/core` contains the runtime logic for Angular. Its primary responsibilities are:

1.  **Rendering (Ivy/Render3)**: Transforming templates into DOM updates.
2.  **Dependency Injection (DI)**: Managing object creation and lifetime.
3.  **Change Detection**: Synchronizing the model with the view.
4.  **Reactivity**: Signals and Zone.js integration.

## 2. Rendering Engine (Ivy / Render3)

The rendering engine (located in `packages/core/src/render3`) uses an **instruction-based** approach.

### Key Concepts

- **Instructions**: The Angular compiler transforms templates into a sequence of instruction calls (e.g., `ɵɵelementStart`, `ɵɵtext`, `ɵɵproperty`). These instructions are executed at runtime to create and update the view.
  - _Location_: `packages/core/src/render3/instructions`

- **LView (Logical View)**: An array containing the _state_ of a specific view instance. It holds:
  - DOM nodes (`RElement`, `RText`).
  - Binding values (for change detection).
  - Directive/Component instances.
  - _Context_: `packages/core/src/render3/interfaces/view.ts`

- **TView (Template View)**: An array containing the _static structure_ of a view. It is shared across all instances (`LView`s) of the same component/template. It holds:
  - Property names for bindings.
  - Node relationship information.
  - Compiled directive definitions.
  - _Context_: `packages/core/src/render3/interfaces/view.ts`

- **Memory Layout**: `LView` and `TView` are parallel arrays. Index `i` in `LView` corresponds to metadata at index `i` in `TView`.
  - `HEADER`: Fixed size, contains context (Parent, Host, etc.).
  - `DECLS`: Static nodes (elements, text, pipes).
  - `VARS`: Binding values.
  - `EXPANDO`: Dynamic data (host bindings, injectors).

### The Render Cycle

1.  **Creation Mode**: Instructions create DOM nodes and store them in `LView`.
2.  **Update Mode**: Instructions check current values against previous values stored in `LView`. If changed, they update the DOM.

## 3. Dependency Injection (DI)

DI in Angular is hierarchical and split into two systems that interact:

### Module Injector (`R3Injector`)

- Configured via `@NgModule.providers` or `providedIn: 'root'`.
- Stored in a hierarchy of `R3Injector` instances.
- _Location_: `packages/core/src/di/r3_injector.ts`

### Node Injector

- Configured via `@Component.providers` or `@Directive.providers`.
- **Not a class**, but a data structure embedded in the `LView` ("Expando" section).
- Uses **Bloom Filters** (`TView.data`) to quickly check if a token is present at a specific node index before traversing up the tree.
- Resolves tokens starting from the current node, walking up the view tree (Element Injector hierarchy), and falling back to the Module Injector if not found.

## 4. Change Detection

- **Dirty Checking**: Angular checks if values bound in templates have changed.
- **Strategies**:
  - `Default`: Checks everything.
  - `OnPush`: Checks only if inputs change, events fire, or signals update.
- **Signals**: The new reactivity primitive. Signals notify the scheduler when they change, potentially allowing for fine-grained updates (Zoneless).

## 5. Key Directories to Know

- `src/render3`: The Ivy rendering engine.
  - `instructions`: The runtime instructions called by compiled code.
  - `interfaces`: `LView`, `TView`, `TNode` definitions.
- `src/di`: Dependency injection system.
- `src/change_detection`: Change detection logic.
- `src/zone`: Zone.js integration.
- `src/signal`: Signals implementation (if present in this version, otherwise likely in `primitives`).

## 6. Conventions & Gotchas

- **Prefixes**: Private/Internal exports often start with `ɵ`.
- **Global State**: Ivy relies heavily on global state (e.g., `getLView()`) during instruction execution to avoid passing context arguments everywhere. This is for performance and code size.
- **Performance**: The code is highly optimized for performance and memory. You will see arrays used instead of objects, bitmasks, and manual memory management patterns. **Respect these patterns.**

## 7. How to Modify Core

1.  **Understand the Instruction**: If modifying runtime behavior, find the corresponding instruction in `src/render3/instructions`.
2.  **Check `LView`/`TView` Impact**: If adding state, understand where it fits in the `LView` array.
3.  **Tests**: Core has extensive tests. Run them using Bazel.
