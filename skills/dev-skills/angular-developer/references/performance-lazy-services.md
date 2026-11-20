# Lazy Loading Services

`injectAsync` (Angular v22+) loads a service on demand. The bundler splits the service and its dependencies into a separate chunk that downloads the first time the instance is requested. It is the dependency injection counterpart of `@defer`: `@defer` lazy loads template sections, `injectAsync` lazy loads services.

Use it for services backed by large libraries or rarely used features (export to spreadsheet, PDF generation, rich text editors, analytics SDKs). Keeping them out of the initial bundle reduces download, parse, and execute time, which improves LCP in client-rendered apps and frees the main thread for interactions.

## Requirement: the service must be auto-provided

The lazy loaded service must be decorated with `@Injectable({providedIn: 'root'})` or `@Service()`. Without auto-provisioning, Angular cannot construct the service after its chunk loads.

## Basic usage

`injectAsync` must be called in an injection context (field initializer, constructor, or factory). It returns a function; calling that function returns a promise that resolves to the service instance.

```ts
import {Component, injectAsync} from '@angular/core';

@Component({
  selector: 'app-report',
  template: `<button (click)="export()">Export</button>`,
})
export class Report {
  private exporter = injectAsync(() => import('./report-exporter').then((m) => m.ReportExporter));

  async export() {
    const exporter = await this.exporter();
    exporter.export();
  }
}
```

- The first call triggers the dynamic import and resolves the service through the regular DI system, so it can still inject other services.
- Later calls reuse the same promise, so the chunk is fetched only once.
- If the service is the default export of its module, pass the import directly and Angular unwraps `default`: `injectAsync(() => import('./report-exporter'))`.

## Prefetching

By default the chunk downloads only when the returned function is first called, which adds network latency to that interaction. Pass a `prefetch` trigger to start the download earlier.

`onIdle` is the built-in trigger. It waits until the browser is idle:

```ts
import {injectAsync, onIdle} from '@angular/core';

private exporter = injectAsync(
  () => import('./report-exporter').then((m) => m.ReportExporter),
  {prefetch: onIdle},
);

// Cap the wait so the prefetch always happens within a known window
private editor = injectAsync(() => import('./rich-editor'), {
  prefetch: () => onIdle({timeout: 1_000}),
});
```

A `PrefetchTrigger` is any function that returns a `Promise<void>`; the loader runs when it resolves. Use a custom trigger to align prefetching with user intent, such as hovering over the button that needs the service.

Prefetching is opportunistic. If the user calls the function before the trigger fires, the dependency loads immediately.

## When to use `injectAsync`

| Situation                                                          | Recommendation                                                                                    |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| Service needed on initial render                                   | Inject eagerly with `inject()`                                                                    |
| Service used only after a user action (click, submit, open dialog) | `injectAsync`, with `prefetch: onIdle` if the action is likely                                    |
| Service used only inside a deferred template section               | Inject it with `inject()` from a component inside the `@defer` block; the block already splits it |
| Service used only by a lazy route                                  | Inject it with `inject()` from that route's components; the route chunk already splits it         |

## Verifying the split

Run `ng build` and confirm the service's library appears in a lazy chunk, not in `main`. Any eager code that uses the service class as a value (for example, `inject(ReportExporter)` in another component) pulls it back into the main bundle. For type-only references, use `import type`.

See the [Lazy loading services guide](https://angular.dev/guide/di/lazy-loading-services) for more detail.
