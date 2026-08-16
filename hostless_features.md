# Hostless Components Feature Support

Hostless components (`@Component({ hostless: true, ... })`) behave **identically to regular components** in almost every way. They have a full component `LView`, dependency injection, inputs/outputs, change detection, queries, content projection, and hydration.

The only differences and restrictions stem directly from the **absence of a physical host DOM element** (the component is backed by an `ElementContainer` / comment anchor node instead of an `Element`).

---

## 1. Identical Behavior to Regular Components

Hostless components support standard component capabilities without deviation:

### Component Lifecycle & Dependency Injection

- **Lifecycle Hooks**: Full support for all lifecycle hooks (`ngOnInit`, `ngAfterViewInit`, `ngOnDestroy`, `afterRender`, `afterNextRender`, etc.).
- **Dependency Injection**: Full injector hierarchy with `providers`, `viewProviders`, and hierarchical DI.
- **Inputs & Outputs**: Signal inputs (`input()`, `input.required()`), classic `@Input()`, outputs (`output()`, `@Output()`), and two-way models (`model()`).

### Change Detection & Reactivity

- **Change Detection Strategies**: `ChangeDetectionStrategy.OnPush` and `Default`.
- **Reactivity**: Full support for Signals, `computed()`, `effect()`, `ChangeDetectorRef.markForCheck()`, and zoneless scheduling.

### Templates, Projection & Queries

- **Content Projection**: Single-slot and multi-slot content projection (`<ng-content select="...">`).
- **View & Content Queries**: `viewChild()`, `viewChildren()`, `@ViewChild`, `@ViewChildren`, `contentChild()`, `contentChildren()`, `@ContentChild`, `@ContentChildren`.
- **Template Features**: Control flow (`@if`, `@for`, `@switch`), `@let` declarations, deferred views (`@defer`), pipes, and nested child components.

### Directives & Dynamic Instantiation

- **Directives & Host Directives**: Directives applied to the hostless component selector and `hostDirectives: [...]` work normally.
- **Dynamic Creation**: Seamlessly works with `ViewContainerRef.createComponent()`, `*ngComponentOutlet`, and `RouterOutlet`.

### SSR, Hydration & Testing

- **SSR & Full Hydration**: Server-side rendering and client rehydration correctly resolve the comment anchor and claim children.
- **Skip Hydration**: `ngSkipHydration` works as expected on the component selector.
- **Angular DevTools**: Supported out of the box (displayed as container nodes).
- **TestBed**: Testing hostless components with `TestBed.createComponent()` works out of the box (with `fixture.nativeElement` wrapping the projected content in the virtual root).

---

## 2. Exceptions & Restrictions (Absence of Host Element)

Because no physical host element exists in the DOM, the following features are restricted or behave differently:

### 1. No Host Bindings or Listeners (`NG2029`)

- **Restriction**: Cannot declare `@HostBinding()`, `@HostListener()`, or `host: { ... }` in component metadata.
- **Reason**: There is no host DOM element to attach classes, styles, attributes, or event listeners to.
- **Compiler Error**: `ErrorCode.HOSTLESS_COMPONENT_WITH_HOST_BINDINGS = 2029`.

### 2. No DOM Bindings on Component Usage (`NG8030`)

- **Restriction**: Templates consuming a hostless component cannot bind DOM properties, attributes, classes, styles, or native events (e.g. `<my-hostless [class.active]="..." [id]="..." (click)="...">`).
- **Reason**: There is no DOM element to receive these bindings.
- **Compiler Error**: `ErrorCode.HOSTLESS_COMPONENT_UNSUPPORTED_BINDING = 8030`.
- _Note_: Bindings matching an `@Input()`, `@Output()`, or a directive applied to the hostless tag are fully supported.

### 3. No Shadow DOM Encapsulation (`NG2030`)

- **Restriction**: Cannot use `ViewEncapsulation.ShadowDom` or `ViewEncapsulation.ExperimentalIsolatedShadowDom`.
- **Reason**: Attaching a shadow root (`attachShadow()`) requires a physical DOM `Element`.
- **Compiler Error**: `ErrorCode.HOSTLESS_COMPONENT_SHADOW_DOM = 2030`.

### 4. No Component Animations (`NG2031`)

- **Restriction**: Cannot declare `@Component({ animations: [...] })`.
- **Reason**: Angular animations require a host element target.
- **Compiler Error**: `ErrorCode.HOSTLESS_COMPONENT_ANIMATIONS = 2031`.

### 5. `ElementRef` References the Comment Anchor

- **Behavior**: Injecting `ElementRef` or accessing `ComponentRef.location.nativeElement` returns the underlying `Comment` node rather than an `HTMLElement`.

### 6. Root Application Bootstrapping

- **Behavior**: A hostless component cannot serve as the root component passed to `bootstrapApplication(MyHostless)` without a host element, because root application mounting requires an existing physical DOM element in `index.html`.
