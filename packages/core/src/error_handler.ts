/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ENVIRONMENT_INITIALIZER} from './di/initializer_token';
import {InjectionToken} from './di/injection_token';
import {inject} from './di/injector_compatibility';
import type {EnvironmentProviders} from './di/interface/provider';
import {makeEnvironmentProviders, provideEnvironmentInitializer} from './di/provider_collection';
import {EnvironmentInjector} from './di/r3_injector';
import {DOCUMENT} from './document';
import {DestroyRef} from './linker/destroy_ref';

/**
 * Provides a hook for centralized exception handling.
 *
 * The default implementation of `ErrorHandler` prints error messages to the `console`. To
 * intercept error handling, write a custom exception handler that replaces this default as
 * appropriate for your app.
 *
 * @usageNotes
 * ### Example
 *
 * ```ts
 * class MyErrorHandler implements ErrorHandler {
 *   handleError(error) {
 *     // do something with the exception
 *   }
 * }
 *
 * // Provide in standalone apps
 * bootstrapApplication(AppComponent, {
 *   providers: [{provide: ErrorHandler, useClass: MyErrorHandler}]
 * })
 *
 * // Provide in module-based apps
 * @NgModule({
 *   providers: [{provide: ErrorHandler, useClass: MyErrorHandler}]
 * })
 * class MyModule {}
 * ```
 *
 * @publicApi
 */
export class ErrorHandler {
  /**
   * @internal
   */
  _console: Console = console;

  handleError(error: any): void {
    this._console.error('ERROR', error);
  }
}

/**
 * `InjectionToken` used to configure how to call the `ErrorHandler`.
 */
export const INTERNAL_APPLICATION_ERROR_HANDLER = new InjectionToken<(e: any) => void>(
  typeof ngDevMode === 'undefined' || ngDevMode ? 'internal error handler' : '',
  {
    providedIn: 'root',
    factory: () => {
      // The user's error handler may depend on things that create a circular dependency
      // so we inject it lazily.
      const injector = inject(EnvironmentInjector);
      let userErrorHandler: ErrorHandler;
      return (e: unknown) => {
        if (injector.destroyed && !userErrorHandler) {
          setTimeout(() => {
            throw e;
          });
        } else {
          userErrorHandler ??= injector.get(ErrorHandler);
          userErrorHandler.handleError(e);
        }
      };
    },
  },
);

export const errorHandlerEnvironmentInitializer = {
  provide: ENVIRONMENT_INITIALIZER,
  useValue: () => void inject(ErrorHandler),
  multi: true,
};

const globalErrorListeners = new InjectionToken<void>(ngDevMode ? 'GlobalErrorListeners' : '', {
  providedIn: 'root',
  factory: () => {
    if (typeof ngServerMode !== 'undefined' && ngServerMode) {
      return;
    }
    const window = inject(DOCUMENT).defaultView;
    if (!window) {
      return;
    }

    const errorHandler = inject(INTERNAL_APPLICATION_ERROR_HANDLER);
    const rejectionListener = (e: PromiseRejectionEvent) => {
      errorHandler(e.reason);
      e.preventDefault();
    };
    const errorListener = (e: ErrorEvent) => {
      if (e.error) {
        errorHandler(e.error);
      } else {
        errorHandler(
          new Error(
            ngDevMode
              ? `An ErrorEvent with no error occurred. See Error.cause for details: ${e.message}`
              : e.message,
            {cause: e},
          ),
        );
      }
      e.preventDefault();
    };

    const setupEventListeners = () => {
      window.addEventListener('unhandledrejection', rejectionListener);
      window.addEventListener('error', errorListener);
    };

    // Angular doesn't have to run change detection whenever any asynchronous tasks are invoked in
    // the scope of this functionality.
    if (typeof Zone !== 'undefined') {
      Zone.root.run(setupEventListeners);
    } else {
      setupEventListeners();
    }

    inject(DestroyRef).onDestroy(() => {
      window.removeEventListener('error', errorListener);
      window.removeEventListener('unhandledrejection', rejectionListener);
    });
  },
});

/**
 * Provides an environment initializer which forwards unhandled errors to the ErrorHandler.
 *
 * The listeners added are for the window's 'unhandledrejection' and 'error' events.
 *
 * @publicApi
 */
export function provideBrowserGlobalErrorListeners(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideEnvironmentInitializer(() => void inject(globalErrorListeners)),
  ]);
}
