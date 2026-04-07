---
name: angular-performance
description: Optimize Angular application performance with OnPush change detection, signals, lazy loading, bundle optimization, and runtime techniques. Use when asked to improve performance, reduce bundle size, optimize change detection, implement lazy loading, add virtual scrolling, or troubleshoot slow Angular apps. Do not use for initial project setup or feature implementation.
license: MIT
metadata:
  author: Copyright 2026 Google LLC
  version: '1.0'
---

# Angular Performance


## Quick Diagnosis

When optimizing an Angular app, check these areas in order:

1. **Change Detection** - Is OnPush used everywhere? Are there function calls in templates?
2. **Bundle Size** - Run `ng build --stats-json` and analyze with webpack-bundle-analyzer
3. **Lazy Loading** - Are routes and heavy components deferred?
4. **Runtime** - Are large lists virtualized? Is trackBy used with @for?

## Core Patterns

### Always Use OnPush + Signals

```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1>{{ title() }}</h1>
    <p>Items: {{ itemCount() }}</p>
  `
})
export class MyComponent {
  items = input.required<Item[]>();
  title = input('Default');

  // Derived state - automatically cached
  itemCount = computed(() => this.items().length);
}
```

### Lazy Load Routes

```typescript
export const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard').then(m => m.DashboardComponent)
  }
];
```

### Defer Heavy Content

```html
@defer (on viewport) {
  <app-heavy-chart [data]="data()" />
} @placeholder {
  <div class="skeleton"></div>
}
```

### Virtualize Large Lists

```html
<cdk-virtual-scroll-viewport itemSize="50">
  <div *cdkVirtualFor="let item of items(); trackBy: trackById">
    {{ item.name }}
  </div>
</cdk-virtual-scroll-viewport>
```

## Reference Guides

Detailed patterns and examples for each optimization area:

- Refer to `references/change-detection.md` for OnPush, signals, zone-less Angular, and common pitfalls
- Refer to `references/lazy-loading.md` for route splitting, @defer triggers, and dynamic components
- Refer to `references/bundle-optimization.md` for tree shaking, code splitting, and image optimization
- Refer to `references/runtime-performance.md` for virtual scrolling, memoization, debouncing, and web workers
