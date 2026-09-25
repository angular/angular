# Core Web Vitals

Core Web Vitals (CWV) are Google's user-experience metrics used for Search ranking. Angular rendering choices have a direct effect on all three.

| Metric | Measures | Target |
|---|---|---|
| **LCP** — Largest Contentful Paint | How fast the main content appears | < 2.5 s |
| **INP** — Interaction to Next Paint | How fast the page responds to input | < 200 ms |
| **CLS** — Cumulative Layout Shift | How stable the layout is during load | < 0.1 |

---

## LCP — Largest Contentful Paint

The LCP element is the largest image or text block visible in the viewport on load — typically a hero image or an `<h1>`.

### What affects LCP in Angular

**Rendering strategy** is the biggest factor:

- **CSR**: The browser downloads the JS bundle, executes it, and then renders. LCP is delayed by bundle download + parse + execute time. Poor for content-heavy pages.
- **SSG**: HTML is pre-rendered and served from a CDN. The LCP element is in the first HTML response. Best LCP.
- **SSR**: HTML is rendered per-request on the server. Faster than CSR, comparable to SSG when cached.

**Image loading**:

- `NgOptimizedImage` with `priority` adds `fetchpriority="high"` and a `<link rel="preload">` — directly improves LCP for image candidates.
- A hero image without `priority` competes with other resources and loads late.

**`@defer` on the LCP element** is the most common Angular-specific LCP regression. A deferred block is not rendered until the trigger fires, which means the LCP candidate is invisible until the chunk downloads.

### LCP checklist

- [ ] Use SSG or SSR for content-visible pages
- [ ] Add `priority` to the hero image with `NgOptimizedImage`
- [ ] Never wrap the LCP element in `@defer`
- [ ] Add `<link rel="preconnect">` to image CDN origins

---

## INP — Interaction to Next Paint

INP measures the time from a user interaction (click, keypress, tap) to the next frame painted. It replaced FID as a Core Web Vital in 2024.

### What affects INP in Angular

**Change detection cost**: In Angular v22+, `OnPush` is the default strategy — only components with changed inputs or updated signals are checked. In earlier versions, the default strategy checks the entire component tree on every event, which can block the main thread for tens or hundreds of milliseconds in large apps.

**Zone.js overhead**: In Angular v21+, apps are zoneless by default — zone.js is no longer included. In older or zone-based apps, zone.js intercepts every event and triggers change detection after it completes. Third-party libraries that fire many events (maps, charts) compound this.

**Long event handlers**: Synchronous work in a click handler — API calls, complex calculations, DOM measurements — blocks the main thread and delays the next paint.

### INP improvements

```ts
// 1. OnPush on every component (default from v22; opt-in for v21 and earlier)
@Component({ changeDetection: ChangeDetectionStrategy.OnPush })

// 2. Zone-based apps only: move expensive work outside Angular's zone
// Not needed in zoneless apps (default from v21)
this.ngZone.runOutsideAngular(() => {
  chart.on('mousemove', handler);
});

// 3. Yield to the scheduler for long tasks
async handleClick() {
  processFirstChunk();
  await scheduler.yield(); // yield to browser between chunks
  processSecondChunk();
}
```

### INP checklist

- [ ] `OnPush` on every component (automatic from v22)
- [ ] Zone-based apps: third-party event-heavy libraries use `runOutsideAngular()`
- [ ] Long event handlers yield with `scheduler.yield()` or `setTimeout(0)`
- [ ] New projects use zoneless Angular (default from v21)

---

## CLS — Cumulative Layout Shift

CLS measures unexpected layout movement. Every time an element shifts position during load, CLS increases.

### Common Angular CLS sources

**Images without dimensions**: The browser reserves no space before the image loads. When it arrives, content below shifts down.

```html
<!-- WRONG: causes layout shift -->
<img src="product.jpg" />

<!-- CORRECT: space reserved, no shift -->
<img ngSrc="product.jpg" width="400" height="300" />
```

**`@defer` without `@placeholder`**: Without a placeholder, the layout collapses where the deferred content will appear, then shifts when the content loads.

```html
<!-- WRONG -->
@defer (on viewport) { <heavy-section /> }

<!-- CORRECT -->
@defer (on viewport) {
  <heavy-section />
} @placeholder {
  <div style="height: 400px"></div>
}
```

**Web fonts causing FOUT/FOIT**: Text reflows when a web font replaces the fallback font.

```css
@font-face {
  font-family: 'MyFont';
  src: url('/fonts/my-font.woff2') format('woff2');
  font-display: swap; /* prevents invisible text; may cause FOUT */
}
```

Pair `font-display: swap` with a `<link rel="preload">` for the critical font to minimize the swap.

### CLS checklist

- [ ] All images use `NgOptimizedImage` with explicit `width` and `height`
- [ ] Every `@defer` block has a same-size `@placeholder`
- [ ] Web fonts have `font-display: swap` and critical fonts are preloaded
- [ ] No dynamic content inserted above existing content after load

---

## Measurement

### Lab measurement (development)

```bash
# Lighthouse via Chrome DevTools (Audits tab)
# or via Angular DevTools MCP:
lighthouse_audit({ url: 'http://localhost:4200', categories: ['performance'] })
```

### Field measurement (production)

Install the `web-vitals` package:

```bash
npm install web-vitals
```

Report metrics from the app entry point:

```ts
// main.ts
import { onLCP, onINP, onCLS } from 'web-vitals';

onLCP(console.log);
onINP(console.log);
onCLS(console.log);
```

Replace `console.log` with your analytics endpoint.

### Bundle analysis

```bash
ng build --stats-json
npx source-map-explorer dist/my-app/browser/*.js
```

Identifies large dependencies and verifies code-splitting boundaries for lazy routes.

### Change detection profiling with Angular DevTools

Install the **Angular DevTools** browser extension from the Chrome Web Store, then open Chrome DevTools → **Angular** tab.

**Profiler** — records which components were checked and how long each check took:

1. Open the **Profiler** tab
2. Click **Record**
3. Interact with the page (click a button, type in a field)
4. Click **Stop**
5. Inspect the flame chart: components in red take the most time; components that shouldn't be checking (missing `OnPush`) appear unexpectedly

See: [Debug change detection and OnPush components](https://next.angular.dev/tools/devtools/profiler#debug-change-detection-and-onpush-components)

### Rendering timestamps with Chrome DevTools

Chrome DevTools **Performance** panel records per-component and per-directive rendering timestamps via Angular's built-in performance marks:

1. Open Chrome DevTools → **Performance** tab
2. Click **Record**
3. Interact with the page
4. Stop and inspect the **Timings** row — Angular emits marks for each component template execution and change detection cycle

This reveals which specific templates are slow during a real interaction, complementing the Angular DevTools profiler.

See: [Recording a profile](https://next.angular.dev/best-practices/profiling-with-chrome-devtools#recording-a-profile)
