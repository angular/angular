# Performance Anti-Patterns

A consolidated reference of Angular performance anti-patterns. Each entry covers what it is, why it hurts, and the fix.

---

## Images

### `<img src>` without NgOptimizedImage for above-the-fold images

**Impact**: LCP, CLS  
**Why**: No `fetchpriority`, no automatic preload, no dimension enforcement.  
**Fix**: Use `ngSrc` with `width`, `height`, and `priority` on the LCP image.

```html
<!-- WRONG -->
<img src="hero.webp" />

<!-- CORRECT -->
<img ngSrc="hero.webp" width="1200" height="600" priority />
```

### `priority` on every image

**Impact**: Competing preloads hurt LCP instead of helping it  
**Why**: The browser fetches all preloaded resources simultaneously. Multiple `priority` images reduce the effective bandwidth available to the actual LCP candidate.  
**Fix**: Add `priority` only to the single LCP candidate per page.

---

## Defer Blocks

### `@defer` on above-the-fold content

**Impact**: LCP regression  
**Why**: The browser cannot render deferred content until the chunk downloads and executes. Above-fold content should be in the initial bundle.  
**Fix**: Never wrap the LCP element or other above-fold content in `@defer`.

### `@defer` without `@placeholder`

**Impact**: CLS  
**Why**: Without a placeholder, the layout collapses to zero height in that area, then shifts when the content loads.  
**Fix**: Always include a `@placeholder` with the same height as the expected content.

```html
@defer (on viewport) {
  <analytics-chart />
} @placeholder {
  <div class="chart-skeleton" style="height: 300px"></div>
}
```

---

## Change Detection

### Default change detection strategy in signal-based components

**Impact**: Unnecessary CPU work on every event, hurts INP  
**Why**: The default strategy runs a full tree check on every browser event. Signals already schedule targeted updates — `OnPush` is needed for Angular to skip unconcerned branches.  
**Fix**: Set `changeDetection: ChangeDetectionStrategy.OnPush` on every component.

### Calling `markForCheck()` in signal components

**Impact**: Redundant CD cycles, masks signal tracking issues  
**Why**: Signals schedule re-renders automatically when their value changes in a template. Calling `markForCheck()` manually is a sign that a signal read is happening outside the reactive context.  
**Fix**: Move signal reads into the template or a `computed()`. Remove the manual `markForCheck()`.

### Running third-party animation or event loops inside Angular's zone

**Impact**: Change detection triggered at animation frame rate (60fps), high INP  
**Why**: zone.js patches `requestAnimationFrame` and `addEventListener`. Any callback fires Angular's change detection.  
**Fix**: In zone-based apps (v20 and earlier), wrap third-party code in `NgZone.runOutsideAngular()`. In zoneless apps (default from v21), zone.js is absent and this anti-pattern does not apply.

```ts
// Zone-based apps only (v20 and earlier)
this.ngZone.runOutsideAngular(() => {
  requestAnimationFrame(this.animationLoop.bind(this));
});
```

---

## Signals and Reactivity

### Using `effect()` to propagate state between signals

**Impact**: Infinite update loops, stale reads, hard-to-trace bugs  
**Why**: `effect()` is for side effects (DOM mutation, logging, storage). Using it to derive or copy signal state creates unpredictable execution order.  
**Fix**: Use `computed()` for derived read-only state, `linkedSignal()` for writable derived state.

```ts
// WRONG
effect(() => { this.fullName.set(`${this.first()} ${this.last()}`); });

// CORRECT
fullName = computed(() => `${this.first()} ${this.last()}`);
```

### Reading signals after `await` in reactive contexts

**Impact**: Stale data, missed updates — the reactive context is lost after an async boundary  
**Why**: Angular's reactive context (template, `computed`, `effect`) tracks signal reads synchronously. Any signal read after the first `await` happens outside this context and is not tracked.  
**Fix**: Read all signals before the first `await`, or use `resource()` to keep async data loading reactive.

```ts
@Component({ template: `<p>{{ user().name }}</p>` })
class UserComponent {
  userId = input.required<string>();

  // WRONG: userId() read after await — not tracked, changes ignored
  async loadUser() {
    const data = await fetch('/api/user');
    const id = this.userId();
    return data;
  }

  // CORRECT: read all signals before any await
  async loadUser() {
    const id = this.userId(); // tracked — read before await
    const data = await fetch(`/api/user/${id}`);
    return data;
  }

  // PREFERRED: use resource() — stays reactive to signal changes
  user = resource({
    request: () => this.userId(),
    loader: ({ request: id }) => fetch(`/api/user/${id}`).then(r => r.json()),
  });
}
```

See: [Reactive context and async operations](https://angular.dev/guide/signals#reactive-context-and-async-operations)

---

## RxJS

### Subscriptions without `takeUntilDestroyed`

**Impact**: Memory leaks, stale event handlers, incorrect behavior after component destruction  
**Why**: Subscriptions continue emitting after a component is destroyed unless explicitly unsubscribed.  
**Fix**: Use `takeUntilDestroyed()` from `@angular/core/rxjs-interop`.

```ts
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export class MyComponent {
  private destroyRef = inject(DestroyRef);

  ngOnInit() {
    this.someService.data$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(data => this.data.set(data));
  }
}
```

---

## Routing

### Lazy loading the landing page route

**Impact**: LCP regression — the primary route chunk must download before content renders  
**Why**: The point of lazy loading is to defer routes the user may never visit. The first route the user always visits should be eager.  
**Fix**: Eager load the primary route. Lazy load all others.

```ts
// WRONG
{ path: '', loadComponent: () => import('./home/home.component') }

// CORRECT
{ path: '', component: HomeComponent }
```

### `import()` inside template expressions

**Impact**: A new dynamic import fires on every render cycle  
**Why**: Template expressions re-evaluate during change detection. Each evaluation triggers a new `import()` call.  
**Fix**: Move dynamic imports to route loader functions or component class initialization.

---

## Styling

### `::ng-deep` for component style overrides

**Impact**: CSS bleed across component boundaries, defeats encapsulation  
**Why**: `::ng-deep` removes Angular's view encapsulation attribute selectors, making styles global.  
**Fix**: Use the component's public API, CSS custom properties, or `ViewEncapsulation.None` deliberately.

---

## Templates

### `@for` without `track`

**Impact**: Full DOM re-creation on list updates, poor INP for interactive lists  
**Why**: Without `track`, Angular cannot identify which items changed and recreates all DOM nodes on every update.  
**Fix**: Always track by a stable identity.

```html
<!-- WRONG -->
@for (item of items) { <li>{{ item.name }}</li> }

<!-- CORRECT -->
@for (item of items; track item.id) { <li>{{ item.name }}</li> }
```
