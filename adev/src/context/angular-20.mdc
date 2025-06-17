---
description: This rule provides comprehensive best practices and coding standards for Angular development, focusing on modern TypeScript, standalone components, signals, and performance optimizations.
globs: ["**/*.{ts,html,scss,css}"]
---

# Angular Best Practices

This project adheres to modern Angular best practices, emphasizing maintainability, performance, accessibility, and scalability.

## TypeScript Best Practices

* **Strict Type Checking:** Always enable and adhere to strict type checking. This helps catch errors early and improves code quality.
* **Prefer Type Inference:** Allow TypeScript to infer types when they are obvious from the context. This reduces verbosity while maintaining type safety.
    * **Bad:**
        ```typescript
        let name: string = 'Angular';
        ```
    * **Good:**
        ```typescript
        let name = 'Angular';
        ```
* **Avoid `any`:** Do not use the `any` type unless absolutely necessary as it bypasses type checking. Prefer `unknown` when a type is uncertain and you need to handle it safely.

## Angular Best Practices

* **Standalone Components:** Always use standalone components, directives, and pipes. Avoid using `NgModules` for new features or refactoring existing ones.
* **Implicit Standalone:** When creating standalone components, you do not need to explicitly set `standalone: true` as it is implied by default when generating a standalone component.
    * **Bad:**
        ```typescript
        @Component({
          standalone: true,
          // ...
        })
        export class MyComponent {}
        ```
    * **Good:**
        ```typescript
        @Component({
          // `standalone: true` is implied
          // ...
        })
        export class MyComponent {}
        ```
* **Signals for State Management:** Utilize Angular Signals for reactive state management within components and services.
* **Lazy Loading:** Implement lazy loading for feature routes to improve initial load times of your application.
* **NgOptimizedImage:** Use `NgOptimizedImage` for all static images to automatically optimize image loading and performance.

## Components

* **Single Responsibility:** Keep components small, focused, and responsible for a single piece of functionality.
* **`input()` and `output()` Functions:** Prefer `input()` and `output()` functions over the `@Input()` and `@Output()` decorators for defining component inputs and outputs.
    * **Old Decorator Syntax:**
        ```typescript
        @Input() userId!: string;
        @Output() userSelected = new EventEmitter<string>();
        ```
    * **New Function Syntax:**
        ```typescript
        import { input, output } from '@angular/core';

        // ...
        userId = input<string>('');
        userSelected = output<string>();
        ```
* **`computed()` for Derived State:** Use the `computed()` function from `@angular/core` for derived state based on signals.
* **`ChangeDetectionStrategy.OnPush`:** Always set `changeDetection: ChangeDetectionStrategy.OnPush` in the `@Component` decorator for performance benefits by reducing unnecessary change detection cycles.
* **Inline Templates:** Prefer inline templates (template: `...`) for small components to keep related code together. For larger templates, use external HTML files.
* **Reactive Forms:** Prefer Reactive forms over Template-driven forms for complex forms, validation, and dynamic controls due to their explicit, immutable, and synchronous nature.
* **No `ngClass` / `NgClass`:** Do not use the `ngClass` directive. Instead, use native `class` bindings for conditional styling.
    * **Bad:**
        ```html
        <section [ngClass]="{'active': isActive}"></section>
        ```
    * **Good:**
        ```html
        <section [class.active]="isActive"></section>
        <section [class]="{'active': isActive}"></section>
        <section [class]="myClasses"></section>
        ```
* **No `ngStyle` / `NgStyle`:** Do not use the `ngStyle` directive. Instead, use native `style` bindings for conditional inline styles.
    * **Bad:**
        ```html
        <section [ngStyle]="{'font-size': fontSize + 'px'}"></section>
        ```
    * **Good:**
        ```html
        <section [style.font-size.px]="fontSize"></section>
        <section [style]="myStyles"></section>
        ```

## State Management

* **Signals for Local State:** Use signals for managing local component state.
* **`computed()` for Derived State:** Leverage `computed()` for any state that can be derived from other signals.
* **Pure and Predictable Transformations:** Ensure state transformations are pure functions (no side effects) and predictable.

## Templates

* **Simple Templates:** Keep templates as simple as possible, avoiding complex logic directly in the template. Delegate complex logic to the component's TypeScript code.
* **Native Control Flow:** Use the new built-in control flow syntax (`@if`, `@for`, `@switch`) instead of the older structural directives (`*ngIf`, `*ngFor`, `*ngSwitch`).
    * **Old Syntax:**
        ```html
        <section *ngIf="isVisible">Content</section>
        <section *ngFor="let item of items">{{ item }}</section>
        ```
    * **New Syntax:**
        ```html
        @if (isVisible) {
          <section>Content</section>
        }
        @for (item of items; track item.id) {
          <section>{{ item }}</section>
        }
        ```
* **Async Pipe:** Use the `async` pipe to handle observables in templates. This automatically subscribes and unsubscribes, preventing memory leaks.

## Services

* **Single Responsibility:** Design services around a single, well-defined responsibility.
* **`providedIn: 'root'`:** Use the `providedIn: 'root'` option when declaring injectable services to ensure they are singletons and tree-shakable.
* **`inject()` Function:** Prefer the `inject()` function over constructor injection when injecting dependencies, especially within `provide` functions, `computed` properties, or outside of constructor context.
    * **Old Constructor Injection:**
        ```typescript
        constructor(private myService: MyService) {}
        ```
    * **New `inject()` Function:**
        ```typescript
        import { inject } from '@angular/core';

        export class MyComponent {
          private myService = inject(MyService);
          // ...
        }
        ```