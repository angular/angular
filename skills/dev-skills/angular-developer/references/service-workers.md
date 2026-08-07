# Angular Service Workers

Angular service workers enable Progressive Web App features such as offline support, precaching, runtime caching, and update handling.

## When to Use Service Workers

Use service workers when you want to:

- make an application available offline after first load,
- precache the app shell and core assets,
- cache API responses or static assets for faster repeat visits,
- provide update prompts so users can refresh to the latest build.

## Setup

Prefer Angular's built-in service worker support over a custom implementation.

1. Add the package with `ng add @angular/pwa` when needed.
2. Register the service worker with `provideServiceWorker` in the app configuration.
3. Review or create an `ngsw-config.json` file for asset and data groups.
4. Build and deploy the app in production mode to test the worker behavior.

A typical app configuration looks like this:

```ts
import {ApplicationConfig, provideZoneChangeDetection, isDevMode} from '@angular/core';
import {provideRouter} from '@angular/router';
import {provideServiceWorker} from '@angular/service-worker';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({eventCoalescing: true}),
    provideRouter([]),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
    }),
  ],
};
```

A minimal `ngsw-config.json` can look like this:

```json
{
  "index": "/index.html",
  "assetGroups": [
    {
      "name": "app-shell",
      "installMode": "prefetch",
      "resources": {
        "files": ["/favicon.ico", "/index.html", "/*.css", "/*.js"]
      }
    }
  ],
  "dataGroups": [
    {
      "name": "api",
      "urls": ["/api/**"],
      "cacheConfig": {
        "strategy": "freshness",
        "maxSize": 100,
        "maxAge": "1d"
      }
    }
  ]
}
```

## Recommended Patterns

- Use `assetGroups` for the app shell and static files such as JS, CSS, images, and fonts.
- Use `dataGroups` for API requests that can be served from cache when the network is unavailable, especially for read-only endpoints.
- Prefer `freshness` (network-first) for data that changes often, and `performance` (cache-first/stale-while-revalidate) for assets that change infrequently.
- Use `SwUpdate` to detect new versions and invite the user to refresh to a newer build.
- Configure the registration strategy carefully. In zoneless applications, the default `registerWhenStable:30000` strategy can behave differently depending on task scheduling. Consider using `'registerImmediately'` or a custom strategy if registration timing is critical.

## Update Handling with SwUpdate

Use `SwUpdate` to react to available versions and activate updates with a modern Angular pattern:

```ts
import {Component, inject} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {SwUpdate, VersionReadyEvent} from '@angular/service-worker';
import {filter, map} from 'rxjs/operators';

@Component({
  selector: 'app-root',
  template: `
    @if (updatesAvailable()) {
      <button type="button" (click)="reload()">Update available</button>
    }
  `,
})
export class AppComponent {
  private readonly updates = inject(SwUpdate);

  readonly updatesAvailable = toSignal(
    this.updates.versionUpdates.pipe(
      filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'),
      map(() => true),
    ),
    {initialValue: false}
  );

  reload(): void {
    this.updates.activateUpdate().then(() => window.location.reload());
  }
}
```

## When Not to Use Service Workers

Service workers are useful, but they are not a generic replacement for application caching.

- Avoid caching sensitive or user-specific data unless that behavior is explicitly required.
- Do not use service workers as the primary solution for dynamic data that changes frequently; prefer server-side caching or an application-level state strategy.
- Do not rely on them in development as your main testing path; test with a production build and a local server that supports HTTPS or localhost.
- Keep in mind that service workers require a secure context, so `https://` or `localhost` is typically required for reliable testing.
- Keep caching policies narrow and versioned to avoid stale content and confusing offline behavior.

## Avoid Common Pitfalls

- Avoid overly broad cache rules that can hide bugs or serve outdated content for too long.
- Make sure the update flow is user-friendly and does not silently refresh the app without consent.
- Verify the behavior in a production-like environment before shipping.

## Reference

For full details, see the official Angular documentation:

- https://angular.dev/ecosystem/service-workers
