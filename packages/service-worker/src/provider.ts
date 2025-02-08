/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  APP_INITIALIZER,
  ApplicationRef,
  EnvironmentProviders,
  InjectionToken,
  Injector,
  makeEnvironmentProviders,
  NgZone,
} from '@angular/core';
import {merge, from, Observable, of} from 'rxjs';
import {delay, take} from 'rxjs/operators';

import {NgswCommChannel} from './low_level';
import {SwPush} from './push';
import {SwUpdate} from './update';

export const SCRIPT = new InjectionToken<string>(ngDevMode ? 'NGSW_REGISTER_SCRIPT' : '');

export function ngswAppInitializer(
  injector: Injector,
  script: string,
  options: SwRegistrationOptions,
): Function {
  return () => {
    if (typeof ngServerMode !== 'undefined' && ngServerMode) {
      return;
    }

    if (!('serviceWorker' in navigator && options.enabled !== false)) {
      return;
    }

    const ngZone = injector.get(NgZone);
    const appRef = injector.get(ApplicationRef);

    // Set up the `controllerchange` event listener outside of
    // the Angular zone to avoid unnecessary change detections,
    // as this event has no impact on view updates.
    ngZone.runOutsideAngular(() => {
      // Wait for service worker controller changes, and fire an INITIALIZE action when a new SW
      // becomes active. This allows the SW to initialize itself even if there is no application
      // traffic.
      const sw = navigator.serviceWorker;
      const onControllerChange = () => sw.controller?.postMessage({action: 'INITIALIZE'});

      sw.addEventListener('controllerchange', onControllerChange);

      appRef.onDestroy(() => {
        sw.removeEventListener('controllerchange', onControllerChange);
      });
    });

    let readyToRegister$: Observable<unknown>;

    if (typeof options.registrationStrategy === 'function') {
      readyToRegister$ = options.registrationStrategy();
    } else {
      const [strategy, ...args] = (
        options.registrationStrategy || 'registerWhenStable:30000'
      ).split(':');

      switch (strategy) {
        case 'registerImmediately':
          readyToRegister$ = of(null);
          break;
        case 'registerWithDelay':
          readyToRegister$ = delayWithTimeout(+args[0] || 0);
          break;
        case 'registerWhenStable':
          const whenStable$ = from(injector.get(ApplicationRef).whenStable());
          readyToRegister$ = !args[0]
            ? whenStable$
            : merge(whenStable$, delayWithTimeout(+args[0]));
          break;
        default:
          // Unknown strategy.
          throw new Error(
            `Unknown ServiceWorker registration strategy: ${options.registrationStrategy}`,
          );
      }
    }

    // Don't return anything to avoid blocking the application until the SW is registered.
    // Also, run outside the Angular zone to avoid preventing the app from stabilizing (especially
    // given that some registration strategies wait for the app to stabilize).
    // Catch and log the error if SW registration fails to avoid uncaught rejection warning.
    ngZone.runOutsideAngular(() =>
      readyToRegister$
        .pipe(take(1))
        .subscribe(() =>
          navigator.serviceWorker
            .register(script, {scope: options.scope})
            .catch((err) => console.error('Service worker registration failed with:', err)),
        ),
    );
  };
}

function delayWithTimeout(timeout: number): Observable<unknown> {
  return of(null).pipe(delay(timeout));
}

export function ngswCommChannelFactory(opts: SwRegistrationOptions): NgswCommChannel {
  const isBrowser = !(typeof ngServerMode !== 'undefined' && ngServerMode);

  return new NgswCommChannel(
    isBrowser && opts.enabled !== false ? navigator.serviceWorker : undefined,
  );
}

/**
 * Token that can be used to provide options for `ServiceWorkerModule` outside of
 * `ServiceWorkerModule.register()`.
 *
 * You can use this token to define a provider that generates the registration options at runtime,
 * for example via a function call:
 *
 * {@example service-worker/registration-options/module.ts region="registration-options"
 *     header="app.module.ts"}
 *
 * @publicApi
 */
export abstract class SwRegistrationOptions {
  /**
   * Whether the ServiceWorker will be registered and the related services (such as `SwPush` and
   * `SwUpdate`) will attempt to communicate and interact with it.
   *
   * Default: true
   */
  enabled?: boolean;

  /**
   * A URL that defines the ServiceWorker's registration scope; that is, what range of URLs it can
   * control. It will be used when calling
   * [ServiceWorkerContainer#register()](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/register).
   */
  scope?: string;

  /**
   * Defines the ServiceWorker registration strategy, which determines when it will be registered
   * with the browser.
   *
   * The default behavior of registering once the application stabilizes (i.e. as soon as there are
   * no pending micro- and macro-tasks) is designed to register the ServiceWorker as soon as
   * possible but without affecting the application's first time load.
   *
   * Still, there might be cases where you want more control over when the ServiceWorker is
   * registered (for example, there might be a long-running timeout or polling interval, preventing
   * the app from stabilizing). The available option are:
   *
   * - `registerWhenStable:<timeout>`: Register as soon as the application stabilizes (no pending
   *     micro-/macro-tasks) but no later than `<timeout>` milliseconds. If the app hasn't
   *     stabilized after `<timeout>` milliseconds (for example, due to a recurrent asynchronous
   *     task), the ServiceWorker will be registered anyway.
   *     If `<timeout>` is omitted, the ServiceWorker will only be registered once the app
   *     stabilizes.
   * - `registerImmediately`: Register immediately.
   * - `registerWithDelay:<timeout>`: Register with a delay of `<timeout>` milliseconds. For
   *     example, use `registerWithDelay:5000` to register the ServiceWorker after 5 seconds. If
   *     `<timeout>` is omitted, is defaults to `0`, which will register the ServiceWorker as soon
   *     as possible but still asynchronously, once all pending micro-tasks are completed.
   * - An Observable factory function: A function that returns an `Observable`.
   *     The function will be used at runtime to obtain and subscribe to the `Observable` and the
   *     ServiceWorker will be registered as soon as the first value is emitted.
   *
   * Default: 'registerWhenStable:30000'
   */
  registrationStrategy?: string | (() => Observable<unknown>);
}

/**
 * @publicApi
 *
 * Sets up providers to register the given Angular Service Worker script.
 *
 * If `enabled` is set to `false` in the given options, the module will behave as if service
 * workers are not supported by the browser, and the service worker will not be registered.
 *
 * Example usage:
 * ```ts
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     provideServiceWorker('ngsw-worker.js')
 *   ],
 * });
 * ```
 */
export function provideServiceWorker(
  script: string,
  options: SwRegistrationOptions = {},
): EnvironmentProviders {
  return makeEnvironmentProviders([
    SwPush,
    SwUpdate,
    {provide: SCRIPT, useValue: script},
    {provide: SwRegistrationOptions, useValue: options},
    {
      provide: NgswCommChannel,
      useFactory: ngswCommChannelFactory,
      deps: [SwRegistrationOptions],
    },
    {
      provide: APP_INITIALIZER,
      useFactory: ngswAppInitializer,
      deps: [Injector, SCRIPT, SwRegistrationOptions],
      multi: true,
    },
  ]);
}
