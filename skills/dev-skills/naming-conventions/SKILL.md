---
name: Naming Conventions
description: Guidelines for naming components, directives, services, including class and file names based on Angular v20 style guide changes.
---

# Naming Conventions (Angular v20+ Style Guide)

This skill enforces Angular naming conventions for components, services, directives, pipes, and models following the **"Intent over Role"** philosophy introduced in Angular v20. It relies on a combination of purpose-driven naming and modern directory structures.

---

## Core Principles

1. **Remove Role Suffixes**: Filenames no longer include functional extensions like `.component.ts`, `.service.ts`, or `.directive.ts`. Corresponding TypeScript classes drop suffixes like `Component`, `Service`, or `Directive`.
2. **Intent/Purpose-Based Naming**: Name files and classes based on their specific domain, responsibility, or business purpose (e.g., `-data`, `-store`, `-api`, or `-formatter`).
3. **Folder Location as Context**: Lean on folder hierarchy (`core/`, `features/`, `shared/`) and IDE capabilities to identify the technical role of files, rather than encoding that context within the file name.
4. **Interface/Model Exception**: Interfaces and data models still retain the `.model.ts` suffix to clearly declare type contracts.

---

## Recommended Project Structure & Naming Rules

### 1. File/Identifier Matching & Consistency
* **Hyphens in Filenames**: Continue using kebab-case (hyphens) to separate words in filenames (e.g., `product-list.ts`).
* **Identifier Matching**: Filenames must align directly with the primary TypeScript class/identifier (e.g., `product-list.ts` contains `class ProductList`).
* **Unified Filenames**: If using split template or style files, keep names identical to the main TypeScript file:
  * `product-list.ts`
  * `product-list.html`
  * `product-list.css`
* **Test Files**: Continue to use the same base name with the `.spec.ts` suffix (e.g., `product-list.spec.ts` for `product-list.ts`).

### 2. Core Directory (Application Foundation)
Houses singleton services, global state, and system-wide models.
* **Services (Logic/State)**: Use descriptive domain-purpose suffixes like `[domain]-data.ts`, `[domain]-store.ts`, or `[domain]-data-client.ts`.
  * *Old*: `auth.service.ts` (Class: `AuthService`)
  * *New*: `auth-data.ts` (Class: `AuthData`)
  * *New (API clients)*: `user-data-client.ts` (Class: `UserDataClient`)
* **Models**: Retain the `.model.ts` suffix for data shapes.
  * *Example*: `user.model.ts` (Interface: `User`)

### 3. Features Directory (Domain Business Logic)
Organized into feature-specific modules containing components and local services.
* **Main Feature Component**: Name after the route/feature itself.
  * *Example*: `features/profile/profile.ts` (Class: `Profile`)
* **Feature Sub-Components**: Name based on their display/functional role.
  * *Example*: `features/profile/components/profile-header.ts` (Class: `ProfileHeader`)
  * *Example*: `features/projects/components/project-card.ts` (Class: `ProjectCard`)
* **Feature Services**: Name based on feature data/state needs.
  * *Example*: `features/projects/projects-data.ts` (Class: `ProjectsData`)

### 4. Shared Directory (Reusable UI Toolkit)
Contains pure, presentational elements and helpers with zero business logic.
* **Shared Components**:
  * *Example*: `shared/components/button/button.ts` (Class: `Button`)
  * *Example*: `shared/components/spinner/spinner.ts` (Class: `Spinner`)
* **Shared Pipes**:
  * *Example*: `shared/pipes/format-date.ts` (Class: `FormatDate`)
* **Shared Directives**: Name according to the behavior they attach to elements.
  * *Old*: `highlight.directive.ts` (Class: `HighlightDirective`)
  * *New*: `highlight.ts` (Class: `Highlight`)

---

## Best Practices & Coexistence Rules

* **Avoid Namespace Collisions**: Without role suffixes, files like `user.ts` (component) and `user.model.ts` (model) must be placed in distinct subfolders (e.g. `features/users/` vs `core/models/`), or use distinct suffixes like `user-data.ts`.
* **Consistency Check**: Do not mix old suffix styles and new suffixless styles in the same feature folder or module. Keep existing legacy code as-is unless migrating the entire module to the modern structure.
* **Lean on the IDE**: Rely on modern IDE code navigation (e.g., "Go to Definition" or fuzzy searches for class names like `AuthData` or `ProfileHeader`) and file type icons rather than visual scan of suffix strings.
