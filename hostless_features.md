# Hostless Components Feature Support

This document tracks the current support matrix for Angular hostless components.

## Supported Features

### Core Architecture

- [x] Hostless component configuration (`hostless: true` in `@Component` decorator).
- [x] Compilation support (compiler propagates `hostless: true` to `ComponentDef`).
- [x] Removal of the host element from the DOM (rendered as an `ElementContainer` / comment node instead).
- [x] Support by Angular DevTools (Supported out of the box! Rendered as `ElementContainer` nodes just like `<ng-container>`).

### Styling & Encapsulation

- [x] children hostless components do not inherit from their parent, same as regular components

### Component Features & APIs

- [x] Content projection (`<ng-content>`) inside hostless components.
- [x] View queries (`@ViewChild`, `@ViewChildren`) querying the hostless component itself (`ElementRef` maps to the Comment node).
- [x] Dependency Injection for `ElementRef` (Injecting `ElementRef` returns a reference to the Comment node).
- [x] Directives applied to the hostless component (Instances created; dev-mode runtime warnings emitted if they attempt to apply host bindings to the underlying Comment node).
- [x] Host Directives (`hostDirectives: [MyDir]`) (Instances created; dev-mode warnings emitted if they attempt to apply host bindings).
- [x] Change Detection (`ChangeDetectionStrategy.OnPush`, `ChangeDetectorRef.markForCheck()`, Signals) (Logical `LView` tree remains exactly the same as a normal component).
- [x] Dynamic instantiation via `ViewContainerRef.createComponent()` (seamlessly appends internal views rather than a host wrapper).
- [x] Native support in `RouterOutlet` (navigating to a hostless component successfully renders its internal views without a host wrapper).
- [x] Support for `*ngComponentOutlet` (since it relies on `ViewContainerRef.createComponent()`).

### Error Handling & Restrictions

- [x] Throw compiler error for host bindings and listeners (`@HostBinding`, `@HostListener`, `host: { ... }`).
- [x] Throw error on styles set from the parent component.
- [x] Throw error on regular event listeners set from the parent component (listening to outputs is still allowed).
- [x] Throw error if legacy animations are used.
- [x] Throw error if `ShadowDom` encapsulation is used.
- [x] Throw error if `:host` or `:host-context` selectors are used in the component's styles.
- [x] Animations tied to the host element throw an `NG0303` unknown property runtime error in dev-mode, since there's no DOM element to animate.

### Server-Side Rendering & Hydration

- [x] Works with SSR & Hydration (Rehydrates safely by properly resolving the anchor comment node and correctly claiming child nodes).
- [x] `ngSkipHydration` support (Safely skips hydration boundaries rooted at hostless components, clearing server DOM and falling back to client-side rendering).

### Testing Utilities

- [x] Behavior of `fixture.nativeElement` and `fixture.debugElement` when testing a hostless component directly (`fixture.nativeElement` maps to the virtual `root` wrapper created by `TestBed`, allowing easy querying of child elements).

## Unsupported / Pending Features

- Bootstrapping a hostless component directly as the root of the application (e.g. `bootstrapApplication(MyHostless)`). The component will currently attach to the root element in the `index.html` (ignoring `hostless: true`) because the root view requires a physical DOM anchor.
- Re-ordering or querying the `ComponentRef.location.nativeElement` for dynamically created hostless components. It currently returns the underlying `Comment` node anchor, not the component's internal DOM nodes.
