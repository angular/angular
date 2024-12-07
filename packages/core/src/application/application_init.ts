/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Observable} from 'rxjs';

import {
  EnvironmentProviders,
  inject,
  Injectable,
  InjectionToken,
  Injector,
  makeEnvironmentProviders,
  runInInjectionContext,
} from '../di';
import {RuntimeError, RuntimeErrorCode} from '../errors';
import {isPromise, isSubscribable} from '../util/lang';

/**
 * A DI token that you can use to provide
 * one or more initialization functions.
 *
 * The provided functions are injected at application startup and executed during
 * app initialization. If any of these functions returns a Promise or an Observable, initialization
 * does not complete until the Promise is resolved or the Observable is completed.
 *
 * You can, for example, create a factory function that loads language data
 * or an external configuration, and provide that function to the `APP_INITIALIZER` token.
 * The function is executed during the application bootstrap process,
 * and the needed data is available on startup.
 *
 * Note that the provided initializer is run in the injection context.
 *
 * @deprecated from v19.0.0, use provideAppInitializer instead
 *
 * @see {@link ApplicationInitStatus}
 * @see {@link provideAppInitializer}
 *
 * @usageNotes
 *
 * The following example illustrates how to configure a multi-provider using `APP_INITIALIZER` token
 * and a function returning a promise.
 * ### Example with NgModule-based application
 * ```ts
 *  function initializeApp(): Promise<any> {
 *    const http = inject(HttpClient);
 *    return firstValueFrom(
 *      http
 *        .get("https://someUrl.com/api/user")
 *        .pipe(tap(user => { ... }))
 *    );
 *  }
 *
 *  @NgModule({
 *   imports: [BrowserModule],
 *   declarations: [AppComponent],
 *   bootstrap: [AppComponent],
 *   providers: [{
 *     provide: APP_INITIALIZER,
 *     useValue: initializeApp,
 *     multi: true,
 *    }]
 *   })
 *  export class AppModule {}
 * ```
 *
 * ### Example with standalone application
 * ```ts
 * function initializeApp() {
 *   const http = inject(HttpClient);
 *   return firstValueFrom(
 *     http
 *       .get("https://someUrl.com/api/user")
 *       .pipe(tap(user => { ... }))
 *   );
 * }
 *
 * bootstrapApplication(App, {
 *   providers: [
 *     provideHttpClient(),
 *     {
 *       provide: APP_INITIALIZER,
 *       useValue: initializeApp,
 *       multi: true,
 *     },
 *   ],
 * });

 * ```
 *
 *
 * It's also possible to configure a multi-provider using `APP_INITIALIZER` token and a function
 * returning an observable, see an example below. Note: the `HttpClient` in this example is used for
 * demo purposes to illustrate how the factory function can work with other providers available
 * through DI.
 *
 * ### Example with NgModule-based application
 * ```ts
 * function initializeApp() {
 *   const http = inject(HttpClient);
 *   return firstValueFrom(
 *     http
 *       .get("https://someUrl.com/api/user")
 *       .pipe(tap(user => { ... }))
 *   );
 * }
 *
 * @NgModule({
 *   imports: [BrowserModule, HttpClientModule],
 *   declarations: [AppComponent],
 *   bootstrap: [AppComponent],
 *   providers: [{
 *     provide: APP_INITIALIZER,
 *     useValue: initializeApp,
 *     multi: true,
 *   }]
 * })
 * export class AppModule {}
 * ```
 *
 * ### Example with standalone application
 * ```ts
 * function initializeApp() {
 *   const http = inject(HttpClient);
 *   return firstValueFrom(
 *     http
 *       .get("https://someUrl.com/api/user")
 *       .pipe(tap(user => { ... }))
 *   );
 * }
 *
 * bootstrapApplication(App, {
 *   providers: [
 *     provideHttpClient(),
 *     {
 *       provide: APP_INITIALIZER,
 *       useValue: initializeApp,
 *       multi: true,
 *     },
 *   ],
 * });
 * ```
 *
 * @publicApi
 */
export const APP_INITIALIZER = new InjectionToken<
  ReadonlyArray<() => Observable<unknown> | Promise<unknown> | void>
>(ngDevMode ? 'Application Initializer' : '');

/**
 * @description
 * The provided function is injected at application startup and executed during
 * app initialization. If the function returns a Promise or an Observable, initialization
 * does not complete until the Promise is resolved or the Observable is completed.
 *
 * You can, for example, create a function that loads language data
 * or an external configuration, and provide that function using `provideAppInitializer()`.
 * The function is executed during the application bootstrap process,
 * and the needed data is available on startup.
 *
 * Note that the provided initializer is run in the injection context.
 *
 * Previously, this was achieved using the `APP_INITIALIZER` token which is now deprecated.
 *
 * @see {@link APP_INITIALIZER}
 *
 * @usageNotes
 * The following example illustrates how to configure an initialization function using
 * `provideAppInitializer()`
 * ```ts
 * bootstrapApplication(App, {
 *   providers: [
 *     provideAppInitializer(() => {
 *       const http = inject(HttpClient);
 *       return firstValueFrom(
 *         http
 *           .get("https://someUrl.com/api/user")
 *           .pipe(tap(user => { ... }))
 *       );
 *     }),
 *     provideHttpClient(),
 *   ],
 * });
 * ```
 *
 * @publicApi
 */
export function provideAppInitializer(
  initializerFn: () => Observable<unknown> | Promise<unknown> | void,
): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: APP_INITIALIZER,
      multi: true,
      useValue: initializerFn,
    },
  ]);
}

/**
 * A class that reflects the state of running {@link APP_INITIALIZER} functions.
 *
 * @publicApi
 */
@Injectable({providedIn: 'root'})
export class ApplicationInitStatus {
  // Using non null assertion, these fields are defined below
  // within the `new Promise` callback (synchronously).
  private resolve!: (...args: any[]) => void;
  private reject!: (...args: any[]) => void;

  private initialized = false;
  public readonly done = false;
  public readonly donePromise: Promise<any> = new Promise((res, rej) => {
    this.resolve = res;
    this.reject = rej;
  });

  private readonly appInits = inject(APP_INITIALIZER, {optional: true}) ?? [];
  private readonly injector = inject(Injector);

  constructor() {
    if ((typeof ngDevMode === 'undefined' || ngDevMode) && !Array.isArray(this.appInits)) {
      throw new RuntimeError(
        RuntimeErrorCode.INVALID_MULTI_PROVIDER,
        'Unexpected type of the `APP_INITIALIZER` token value ' +
          `(expected an array, but got ${typeof this.appInits}). ` +
          'Please check that the `APP_INITIALIZER` token is configured as a ' +
          '`multi: true` provider.',
      );
    }
  }

  /** @internal */
  runInitializers() {
    if (this.initialized) {
      return;
    }

    const asyncInitPromises = [];
    for (const appInits of this.appInits) {
      const initResult = runInInjectionContext(this.injector, appInits);
      if (isPromise(initResult)) {
        asyncInitPromises.push(initResult);
      } else if (isSubscribable(initResult)) {
        const observableAsPromise = new Promise<void>((resolve, reject) => {
          initResult.subscribe({complete: resolve, error: reject});
        });
        asyncInitPromises.push(observableAsPromise);
      }
    }

    const complete = () => {
      // @ts-expect-error overwriting a readonly
      this.done = true;
      this.resolve();
    };

    Promise.all(asyncInitPromises)
      .then(() => {
        complete();
      })
      .catch((e) => {
        this.reject(e);
      });

    if (asyncInitPromises.length === 0) {
      complete();
    }
    this.initialized = true;
  }
}
