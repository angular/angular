---
name: angular-component
description: Create modern Angular standalone components following v20+ best practices. Use for building UI components with signal-based inputs/outputs, OnPush change detection, host bindings, content projection, and lifecycle hooks. Triggers on component creation, refactoring class-based inputs to signals, adding host bindings, or implementing accessible interactive components. Do not use for routing, form logic, or service architecture.
license: MIT
metadata:
  author: Copyright 2026 Google LLC
  version: '1.0'
---

# Angular Component

Create standalone components for Angular v20+. Components are standalone by default

**CRITICAL** : Do NOT set `standalone: true`

## Component Structure
- Always Make the Component uses onPush Change Detection Strategy
- Use **template** (inline): Small (<15 lines), simple templates. 
- Use **templateUrl** (external): Large/complex templates. Use relative paths. 
- Keep components small and focused on a single responsibility.

### Dependency Injection

Use `inject()` function instead of constructor injection:

```typescript
@Component({...})
export class MyComponent {
  // CORRECT - use inject()
  #userService = inject(UserService);
  #http = inject(HttpClient);

  // WRONG - constructor injection is discouraged
  // constructor(private userService: UserService) {}
}
```

### Basic Example

```typescript
import {Component, ChangeDetectionStrategy, input, output, computed} from '@angular/core';

@Component({
    selector: 'app-user-card',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'class': 'user-card',
        '[class.active]': 'isActive()',
        '(click)': 'handleClick()',
    },
    template: `
    <img [src]="avatarUrl()" [alt]="name() + ' avatar'" />
    <h2>{{ name() }}</h2>
    @if (showEmail()) {
      <p>{{ email() }}</p>
    }
  `,
    styles: `
    :host { display: block; }
    :host.active { border: 2px solid blue; }
  `,
})
export class UserCard {
    // Required input
    name = input.required<string>();

    // Optional input with default
    email = input<string>('');
    showEmail = input(false);

    // Input with transform
    isActive = input(false, {transform: booleanAttribute});

    // Computed from inputs
    avatarUrl = computed(() => `https://api.example.com/avatar/${this.name()}`);

    // Output
    selected = output<string>();

    handleClick() {
        this.selected.emit(this.name());
    }
}
```

## Signal Inputs

```typescript
// Required - must be provided by parent
name = input.required<string>();

// Optional with default value
count = input(0);

// Optional without default (undefined allowed)
label = input<string>();

// With alias for template binding
size = input('medium', {alias: 'buttonSize'});

// With transform function
disabled = input(false, {transform: booleanAttribute});
value = input(0, {transform: numberAttribute});
// with transform custom function
interface Item {
    key: string;
    value: string;
}

items = input<Item[], Item[]>([], {
    transform: (value: Item[]) => [{key: 'default', value: 'Default'}, ...value]
});

```

## Signal Outputs

```typescript
import {output, outputFromObservable} from '@angular/core';

// Basic output
clicked = output<void>();
selected = output<Item>();

// With alias
valueChange = output<number>({alias: 'change'});

// From Observable (for RxJS interop)
scroll$ = new Subject<number>();
scrolled = outputFromObservable(this.scroll$);

// Emit values
this.clicked.emit();
this.selected.emit(item);

// **CAUTION**: For the subject, don't forget to complete it to avoid memory leaks!
ngOnDestroy()
{
    this.scroll$.complete();
}
```

## Host Bindings

- **CRITICAL*** Do NOT use `@HostBinding` or `@HostListener` decorators, instead use the `host` object in `@Component`. 

```typescript

@Component({
    selector: 'app-button',
    host: {
        // Static attributes
        'role': 'button', // instead of @Attribute('role')

        // Dynamic class bindings
        '[class.primary]': 'variant() === "primary"', // instead of @HostBinding('.primary')
        '[class.disabled]': 'disabled()', // instead of @HostBinding('.disabled')

        // Dynamic style bindings
        '[style.--btn-color]': 'color()', // instead of :host(.primary) [style.--btn-color]

        // Attribute bindings
        '[attr.aria-disabled]': 'disabled()', // instead of @Attribute('aria-disabled')
        '[attr.tabindex]': 'disabled() ? -1 : 0', // instead of @Attribute('tabindex')

        '[class.active]': 'isActive()',  // Instead of @HostBinding
        
        // Event listeners
        '(click)': 'onClick($event)',   // Instead of @HostListener
        '(keydown.enter)': 'onClick($event)', // Instead of @HostListener
        '(keydown.space)': 'onClick($event)', // Instead of @HostListener
    },
    template: `<ng-content />`,
})
export class Button {
    variant = input<'primary' | 'secondary'>('primary');
    disabled = input(false, {transform: booleanAttribute});
    color = input('#007bff');

    clicked = output<void>();

    onClick(event: Event) {
        if (!this.disabled()) {
            this.clicked.emit();
        }
    }
}
```

## Content Projection

```typescript

@Component({
    selector: 'app-card',
    template: `
    <header>
      <ng-content select="[card-header]" />
    </header>
    <main>
      <ng-content />
    </main>
    <footer>
      <ng-content select="[card-footer]" />
    </footer>
  `,
})
export class Card {
}

// Usage:
// <app-card>
//   <h2 card-header>Title</h2>
//   <p>Main content</p>
//   <button card-footer>Action</button>
// </app-card>
```

## Lifecycle Hooks

```typescript
import {OnInit, OnDestroy, effect, afterNextRender, afterEveryRender, afterRenderEffect} from '@angular/core';

export class MyComponent implements OnInit, OnDestroy {
    constructor() {
        // Use effect() for non-DOM reactive logic
        effect(() => {
            // Reactive to signals, runs before DOM is ready
            // Use for state synchronization and derived computations
            const value = this.someSignal();
            console.log('Signal changed:', value);
        });

        // Use afterNextRender() for one-time DOM initialization (SSR-safe)
        afterNextRender(() => {
            // Runs once after first render
            // Perfect for third-party library initialization
            // Browser-only APIs (ResizeObserver, IntersectionObserver)
            // Not reactive to signals
            this.initThirdPartyLib();
        });

        // Use afterEveryRender() for non-reactive DOM sync on every render
        afterEveryRender(() => {
            // Runs after every render cycle (application-level)
            // Not reactive to signals
            // Use for DOM synchronization that must happen every render
            // Rarely needed - prefer afterRenderEffect() for reactive DOM
            this.syncDOMState();
        });

        // Use afterRenderEffect() for reactive DOM operations
        afterRenderEffect((onCleanup) => {
            // Reactive to signals, runs after DOM updates
            // Use when you need to read/write DOM based on signal changes
            // Specify phase for performance (read, write, earlyRead)
            const element = document.querySelector('.my-element');
            element?.setAttribute('data-value', this.dynamicValue());

            // Always cleanup resources
            onCleanup(() => {
                element?.removeAttribute('data-value');
            });
        });
    }

    // Example with phases
    constructor() {
        afterRenderEffect({
            earlyRead: () => this.checkValueEarly(),
            write: (value, cleanup) => {
                const element = document.querySelector('.my-element');
                element?.setAttribute('data-value', value);
                cleanup(() => element?.removeAttribute('data-value'));
            },
            mixedReadWrite: () => {
                // Handle mixed read/write operations
                // **CRITICAL**: Avoid  this phase as much as possible
            },
            read: () => this.checkValue(),
        })
    }
 
    ngOnInit() {
        // Component initialized, inputs are set
        // Use for initialization logic that doesn't require DOM
    }

    ngOnDestroy() {
        // Cleanup subscriptions and resources
        // effect() and afterRenderEffect() auto-cleanup
    }
}
```
- **We can define it outside the constructor**
```typescript
export class MyComponent {
    // Example without constructor
    // Need to call it in an injection context 
    // Declare a variable to call it 
    getUserLocation = afterNextRender(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                console.log('User location:', position.coords);
            });
        }
    });
    // it works on all of them effect, afterNextRender, afterEveryRender, afterRenderEffect 
}
```

**Best Practices:**

- **Prefer `effect()`** for most reactive needs (state sync, derived computations)
- **Use native browser APIs** (ResizeObserver, MutationObserver, IntersectionObserver) over render hooks when possible
- **Use `afterNextRender()`** for one-time DOM setup (library initialization, focus management)
- **Use `afterRenderEffect()`** for reactive DOM operations (most common for signal-based DOM updates)
- **Use `afterEveryRender()`** sparingly - only when DOM sync must happen every render regardless of signal changes
    - **Specify phases** in `afterRenderEffect()` , `afterNextRender()` `afterEveryRender()`
        - earlyRead Use this phase to read from the DOM before a subsequent write callback, for example to perform
          custom layout that the browser doesn't natively support. Prefer the read phase if reading can wait until after
          the write phase. Never write to the DOM in this phase.
        - write Use this phase to write to the DOM. Never read from the DOM in this phase.
        - mixedReadWrite Use this phase to read from and write to the DOM simultaneously. Never use this phase if it is
          possible to divide the work among the other phases instead.
        - read Use this phase to read from the DOM. Never write to the DOM in this phase.
          You should prefer using the read and write phases over the earlyRead and
- **Always use `onCleanup()`** for resource disposal (timers, listeners, animations)
- **Avoid `mixedReadWrite` phase** as it may cause DOM reflows

## Accessibility Requirements

Components MUST:

- Pass AXE accessibility checks
- Meet WCAG AA standards
- Include proper ARIA attributes for interactive elements
- Support keyboard navigation
- Maintain visible focus indicators

```typescript

@Component({
    selector: 'app-toggle',
    host: {
        'role': 'switch',
        '[attr.aria-checked]': 'checked()',
        '[attr.aria-label]': 'label()',
        'tabindex': '0',
        '(click)': 'toggle()',
        '(keydown.enter)': 'toggle()',
        '(keydown.space)': 'toggle(); $event.preventDefault()',
    },
    template: `<span class="toggle-track"><span class="toggle-thumb"></span></span>`,
})
export class Toggle {
    label = input.required<string>();
    checked = input(false, {transform: booleanAttribute});
    checkedChange = output<boolean>();

    toggle() {
        this.checkedChange.emit(!this.checked());
    }
}
```

## Template Syntax

Use native control flow `@for`, `@if`, and `@switch` directives

**CRITICAL**: Do NOT use `*ngIf`, `*ngFor`, `*ngSwitch`.

```html
<!-- Conditionals -->
@if (isLoading()) {
<app-spinner/>
} @else if (error()) {
<app-error [message]="error()"/>
} @else {
<app-content [data]="data()"/>
}

<!-- Loops -->
@for (item of items(); track item.id) {
<app-item [item]="item"/>
} @empty {
<p>No items found</p>
}

<!-- Switch -->
@switch (status()) {
@case ('pending') { <span>Pending</span> }
@case ('active') { <span>Active</span> }
@default { <span>Unknown</span> }
}
```

### Template Best Practices

**CRITICAL**: Do NOT write arrow functions in templates (they are not supported):

```html
<!-- WRONG - arrow functions not supported -->
<button (click)="() => doSomething()">Click</button>

<!-- CORRECT -->
<button (click)="doSomething()">Click</button>
```

**CRITICAL**: Do not assume globals like `new Date()` or `window` are available in templates:

```html
<!-- WRONG -->
<p>{{ new Date().toLocaleDateString() }}</p>

<!-- CORRECT - use computed signal -->
<p>{{ formattedDate() }}</p>
```

```typescript
formattedDate = computed(() => new Date().toLocaleDateString());
```

### Async Pipe for Observables

Use the async pipe to handle observables in templates:

```typescript
@Component({
  template: `
    @if (users$ | async; as users) {
      @for (user of users; track user.id) {
        <app-user-card [user]="user" />
      }
    } @else {
      <p>Loading...</p>
    }
  `,
})
export class UserList {
  #userService = inject(UserService);
  users$ = this.userService.getUsers();
}
```
## Class and Style Bindings

Do NOT use `ngClass` or `ngStyle`. Use direct bindings:

```html
<!-- Class bindings -->
<div [class.active]="isActive()">Single class</div>
<div [class]="classString()">Class string</div>
<div [class]="{class1: item.key === 'hello' , class2: item.key === 'Ahmed' }"></div>
<!--class1 and class2 will be added conditionally-->
<!-- Style bindings -->
<div [style.color]="textColor()">Styled text</div>
<div [style.width.px]="width()">With unit</div>
```

## Images

Use `NgOptimizedImage` for static images:
- **CRITICAL** Don't use it with icons, NgOptimizedImage adds overhead for tiny icons/images
```typescript
import {NgOptimizedImage} from '@angular/common';

@Component({
    imports: [NgOptimizedImage],
    template: `
    <img ngSrc="/assets/hero.jpg" width="800" height="600" priority />
    <img [ngSrc]="imageUrl()" width="200" height="200" />
  `,
})
export class Hero {
    imageUrl = input.required<string>();
}
```

## Animations

For animating component elements entering/leaving the DOM, use native CSS with `animate.enter` and `animate.leave` (Angular v20.2+). For older projects, use the legacy `@angular/animations` DSL.

See `references/angular-animations.md` for enter/leave animations, CSS transitions, staggering, and legacy DSL patterns.

## Component Styling

Angular components support scoped styles via view encapsulation. Use `:host` to style the host element, and avoid `::ng-deep` (deprecated).

See `references/component-styling.md` for view encapsulation modes, special selectors, and style scoping best practices.

See `references/component-patterns.md` for detailed component patterns and advanced examples.
