# Angular Naming Conventions (Angular v20+ Style Guide)

This skill enforces Angular naming conventions for components, services, directives, pipes, and models. While it promotes the modern **"Intent over Role"** philosophy introduced in Angular v20, **it must respect existing project configurations first**.

---

## Core Principles

1. **Prioritize Existing Conventions**: Before generating or refactoring files, check the existing project files, `angular.json` configuration, and ESLint rules. **Do not force suffixless naming on projects that rely on standard suffixes.**
2. **Remove Role Suffixes (Modern Projects Only)**: In projects configured for "Intent over Role" or newly bootstrapped v20+ projects, filenames no longer include functional extensions like `.component.ts`, `.service.ts`, or `.directive.ts`. Corresponding TypeScript classes drop suffixes like `Component`, `Service`, or `Directive`.
3. **Intent/Purpose-Based Naming**: When suffixless naming is active, name files and classes based on their specific domain, responsibility, or business purpose (e.g., `-data`, `-store`, `-api`, or `-formatter`).
4. **Folder Location as Context**: Lean on folder hierarchy (`core/`, `features/`, `shared/`) and IDE capabilities to identify the technical role of files, rather than encoding that context within the file name.
5. **Interface/Model Exception**: Interfaces and data models still retain the `.model.ts` suffix to clearly declare type contracts.

---

## Recommended Project Structure & Naming Rules

### 1. File/Identifier Matching & Consistency

- **Hyphens in Filenames**: Continue using kebab-case (hyphens) to separate words in filenames (e.g., `product-list.ts`).
- **Identifier Matching**: Filenames must align directly with the primary TypeScript class/identifier (e.g., `product-list.ts` contains `class ProductList`).
- **Unified Filenames**: If using split template or style files, keep names identical to the main TypeScript file:
  - `product-list.ts`
  - `product-list.html`
  - `product-list.css`
- **Test Files**: Continue to use the same base name with the `.spec.ts` suffix (e.g., `product-list.spec.ts` for `product-list.ts`).

### 2. Core Directory (Application Foundation)

Houses singleton services, global state, and system-wide models.

- **Services (Logic/State)**:
  - _Old_: `auth.service.ts` (Class: `AuthService`)
  - _New_: `auth.ts` (Class: `AuthService`)
  - _Alternative (Intent-specific)_: Use descriptive domain-purpose suffixes like `[domain]-data.ts`, `[domain]-store.ts`, or `[domain]-data-client.ts` (e.g., `auth-data.ts` / `AuthData`, `user-data-client.ts` / `UserDataClient`).
- **Models**: Retain the `.model.ts` suffix for data shapes.
  - _Example_: `user.model.ts` (Interface: `User`)

### 3. Features Directory (Domain Business Logic)

Organize files into feature-specific folders containing components, local services, and routes related to that domain.

- **Main Feature Component**: Name the main feature component after the route or feature itself.
  - _Example_: `features/profile/profile.ts` (Class: `Profile`)
- **Feature Sub-Components**: Name sub-components based on their display or functional role.
  - _Example_: `features/profile/components/profile-header.ts` (Class: `ProfileHeader`)
  - _Example_: `features/projects/components/project-card.ts` (Class: `ProjectCard`)
- **Feature Services**: Name feature services based on feature-specific data or state needs.
  - _Example_: `features/projects/projects-data.ts` (Class: `ProjectsData`)

### 4. Shared Directory (Reusable UI Toolkit)

Store pure, presentational elements and helpers with zero business logic in a shared folder.

- **Shared Components**: Name shared components based on their reusable UI role.
  - _Example_: `shared/components/button/button.ts` (Class: `Button`)
  - _Example_: `shared/components/spinner/spinner.ts` (Class: `Spinner`)
- **Shared Pipes**: Name shared pipes according to their formatting purpose.
  - _Example_: `shared/pipes/format-date.ts` (Class: `FormatDate`)
- **Shared Directives**: Name directives according to the behavior they attach to elements.
  - _Old_: `highlight.directive.ts` (Class: `HighlightDirective`)
  - _New_: `highlight.ts` (Class: `Highlight`)

---

## Best Practices & Coexistence Rules

- **How to Determine the Style in Use**:
  1.  Inspect adjacent files in the target directory (do they end in `.component.ts` or `.ts`?).
  2.  Check `angular.json` for custom schematics options that might configure suffix behaviors.
  3.  If unsure, use the traditional role suffix style (`.component.ts`, `.service.ts`) as it is the safest default in the Angular ecosystem.
- **Avoid Namespace Collisions**: Without role suffixes, files like `user.ts` (component) and `user.model.ts` (model) can collide if they both declare a class/interface named `User`.
  - To prevent this use more specific, intent-based names for components (e.g. `class UserProfile` in `user-profile.ts` or `class UserDetail` in `user-detail.ts`) while keeping the simple domain name for the interface (`interface User` in `user.model.ts`).
- **Consistency Check**: Do not mix old suffix styles and new suffixless styles in the same feature folder or module. Keep existing legacy code as-is unless migrating the entire module to the modern structure.
- **Lean on the IDE**: Rely on modern IDE code navigation (e.g., "Go to Definition" or fuzzy searches for class names like `AuthData` or `ProfileHeader`) and file type icons rather than visual scan of suffix strings.
