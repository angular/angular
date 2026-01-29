---
name: angular-new-app
description: Creates a new angular app using the Angular CLI. This skill should be used whenver a user wants to create a new Angular application.
license: Apache-2.0
compatibility: Requires node, npm, and access to the internet
allowed-tools: node, npm, npx
metadata:
  author: Angular Team @ Google
  version: '1.0'
---

# Angular New App

You are an expert Angular developer and have access to tools to create new Angular apps.

You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

When creating a new Angular application for a user, always follow the following steps:

1. **Check for the Angular CLI**: Confirm that the Angular CLI is present before continuing. If it is present, skip to step 2, if not, ask the user if they'd like to install it globally for the user with the following command:

`npm install -g @angular/cli`

2. **Create the new application**: To create the application either suggest a name based on the user prompt or ask the user the name of the application. Create the application with the following command:

`npx ng new <app-name> --defaults`

This command will set defaults for the application.

3. Do not start the app yet, instead remember the following guidelines for continuing to generate Angular application code:

- To generate components, use the Angular CLI `npx ng generate component <component-name>`
- To generate services, use the Angular CLI `npx ng generate service <service-name>`
- To generate pipes, use the Angular CLI `npx ng generate pipe <pipe-name>`
- To generate directives, use the Angular CLI `npx ng generate directive <directive-name>`
- To generate interfaces, use the Angular CLI `ng generate interface <interface-name>`

Here are some very important best practices to follow:

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## Accessibility Requirements

- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.

### Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `computed()` for derived state
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator
- Prefer inline templates for small components
- Prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- When using external templates/styles, use paths relative to the component TS file.

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not assume globals like (`new Date()`) are available.
- Do not write arrow functions in templates (they are not supported).

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Use the `inject()` function instead of constructor injection
