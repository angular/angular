# Bundle Optimization

## Analyzing Bundle Size

Use Angular's built-in bundle analyzer:

```bash
ng build --stats-json
npx webpack-bundle-analyzer dist/app/stats.json
```

Or use source-map-explorer:

```bash
ng build --source-map
npx source-map-explorer dist/app/browser/*.js
```

## Tree Shaking Best Practices

### Use providedIn for services

```typescript
// ✅ Tree-shakeable - removed if never injected
@Injectable({ providedIn: 'root' })
export class AnalyticsService {}

// ❌ Not tree-shakeable - always included
// providers: [AnalyticsService] in module/component
```

### Import only what you need

```typescript
// ❌ Bad - imports entire library
import * as _ from 'lodash';

// ✅ Good - imports only used function
import debounce from 'lodash-es/debounce';

// ✅ Better - use native or smaller alternatives
const debounce = (fn: Function, ms: number) => {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), ms);
  };
};
```

### Use ES modules

```typescript
// ❌ CommonJS - not tree-shakeable
const moment = require('moment');

// ✅ ES modules - tree-shakeable
import { format } from 'date-fns';
```

## Code Splitting

### Route-based splitting (automatic)

```typescript
// Each lazy route creates a separate chunk
{
  path: 'reports',
  loadComponent: () => import('./reports/reports')
}
```

### Manual chunk optimization

```typescript
// angular.json
{
  "optimization": {
    "scripts": true,
    "styles": {
      "minify": true,
      "inlineCritical": true
    }
  },
  "budgets": [
    {
      "type": "initial",
      "maximumWarning": "500kb",
      "maximumError": "1mb"
    },
    {
      "type": "anyComponentStyle",
      "maximumWarning": "4kb",
      "maximumError": "8kb"
    }
  ]
}
```

## Image Optimization

Use NgOptimizedImage:

```typescript
import { NgOptimizedImage } from '@angular/common';

@Component({
  imports: [NgOptimizedImage],
  template: `
    <!-- LCP image - priority loading -->
    <img ngSrc="/hero.jpg" width="1200" height="600" priority />

    <!-- Below fold - lazy loaded -->
    <img ngSrc="/product.jpg" width="400" height="300" />

    <!-- Responsive image -->
    <img
      ngSrc="/banner.jpg"
      width="800"
      height="400"
      sizes="(max-width: 768px) 100vw, 50vw"
    />
  `
})
export class PageComponent {}
```

Configure image loader for CDN:

```typescript
// app.config.ts
import { provideImgixLoader } from '@angular/common';

export const appConfig: ApplicationConfig = {
  providers: [
    provideImgixLoader('https://my-cdn.imgix.net/')
  ]
};
```

## Build Optimization Flags

```bash
# Production build with all optimizations
ng build --configuration=production

# Additional flags for analysis
ng build --named-chunks --stats-json
```
