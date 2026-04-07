# Lazy Loading

## Route-Based Lazy Loading

Lazy load feature modules by route:

```typescript
// app.routes.ts
export const routes: Routes = [
  { path: '', component: HomeComponent },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.DashboardComponent)
  },
  {
    path: 'admin',
    loadChildren: () => import('./pages/admin/admin.routes').then(m => m.ADMIN_ROUTES),
    canActivate: [authGuard]
  }
];
```

## Deferrable Views (@defer)

Lazy load parts of a template:

```typescript
@Component({
  template: `
    <h1>Dashboard</h1>

    <!-- Load when visible in viewport -->
    @defer (on viewport) {
      <app-heavy-chart [data]="chartData()" />
    } @placeholder {
      <div class="skeleton-chart"></div>
    } @loading (minimum 200ms) {
      <app-spinner />
    }

    <!-- Load on interaction -->
    @defer (on interaction) {
      <app-comments [postId]="postId()" />
    } @placeholder {
      <button>Load Comments</button>
    }

    <!-- Load when condition is true -->
    @defer (when showAdvanced()) {
      <app-advanced-settings />
    }

    <!-- Load after idle + timer -->
    @defer (on idle; prefetch on timer(2s)) {
      <app-recommendations />
    }
  `
})
export class DashboardComponent {
  chartData = input.required<ChartData>();
  postId = input.required<string>();
  showAdvanced = signal(false);
}
```

### @defer Triggers

| Trigger | When it loads |
|---------|---------------|
| `on idle` | Browser is idle |
| `on viewport` | Element enters viewport |
| `on interaction` | User clicks/focuses placeholder |
| `on hover` | User hovers over placeholder |
| `on immediate` | After other content renders |
| `on timer(Xms)` | After X milliseconds |
| `when condition` | When expression is truthy |

### Prefetch Strategies

```html
<!-- Prefetch while idle, load on viewport -->
@defer (on viewport; prefetch on idle) {
  <app-widget />
}

<!-- Prefetch on hover, load on click -->
@defer (on interaction; prefetch on hover) {
  <app-modal />
}
```

## Component-Level Lazy Loading

Dynamically load components:

```typescript
@Component({
  template: `
    <ng-container #outlet />
    <button (click)="loadEditor()">Open Editor</button>
  `
})
export class PageComponent {
  #vcr = inject(ViewContainerRef);

  async loadEditor() {
    const { EditorComponent } = await import('./editor/editor');
    this.#vcr.createComponent(EditorComponent);
  }
}
```
