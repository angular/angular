# Lazy loading services

IMPORTANT: For lazy loading to work, the service you load must be auto-provided. Decorate it with either `@Injectable({providedIn: 'root'})` or [`@Service()`](guide/di/creating-and-using-services#using-the-service-decorator). Without auto-provisioning, Angular has no way to construct the service after it loads.

Angular's `injectAsync` function lets you load a service on demand, only when it's actually needed. This is useful when a service depends on a large library or rarely used feature, and you don't want to pay for it on the initial page load.

When you use `injectAsync`, the service's code is split out by your bundler into a separate JavaScript chunk and downloaded the first time you ask for the instance. Once loaded, Angular resolves the service through the regular DI system, so it can still depend on other injectables and behaves like any other singleton.

## Lazily injecting a service

Imagine a `ReportExporter` that depends on a heavy spreadsheet library. Most users open the report; only a few click **Export**. Load the exporter on demand:

```angular-ts
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

The first call to `this.exporter()` triggers the dynamic import and resolves the service from DI. Subsequent calls reuse the same promise, so the chunk is only fetched once.

If the lazy-loaded service is the [default export](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/export#using_the_default_export), pass the dynamic import directly, Angular unwraps the `default` for you:

```ts {header: report-exporter.ts}
@Service()
export default class ReportExporter {
  /* … */
}
```

```ts {header: report.ts}
private exporter = injectAsync(() => import('./report-exporter'));
```

## Prefetching the dependency

By default, the lazy chunk is only fetched when you invoke the returned function. You can start the download earlier by passing a `prefetch` trigger in the options. A trigger is any function that returns a `Promise`, when it resolves, Angular kicks off the loader.

Angular ships with `onIdle`, a built-in trigger that waits until the browser becomes idle:

```ts
import {Component, injectAsync, onIdle} from '@angular/core';

@Component({
  /* … */
})
export class Report {
  private exporter = injectAsync(() => import('./report-exporter').then((m) => m.ReportExporter), {
    prefetch: onIdle,
  });
}
```

You can also configure `onIdle` with a maximum wait time so the prefetch always happens within a known window, even on busy pages:

```ts
injectAsync(loader, {prefetch: () => onIdle({timeout: 1_000})});
```

NOTE: Prefetching is opportunistic. If the user invokes the feature before the prefetch fires, Angular still loads the dependency immediately and resolves your `await` as soon as it's ready.

## Provide a custom prefetch trigger

A `PrefetchTrigger` is just a function that returns a promise, the loader runs as soon as the promise resolves. Use this to align prefetching with your own signals, such as a hover or a scheduler tick:

```ts
import {PrefetchTrigger} from '@angular/core';

export function onHover(target: HTMLElement): PrefetchTrigger {
  return () =>
    new Promise<void>((resolve) => {
      target.addEventListener('pointerenter', () => resolve(), {once: true});
    });
}
```
