/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { InjectionToken } from './di/injection_token';
import type { EnvironmentProviders } from './di/interface/provider';
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
export declare class ErrorHandler {
    /**
     * @internal
     */
    _console: Console;
    handleError(error: any): void;
}
/**
 * `InjectionToken` used to configure how to call the `ErrorHandler`.
 */
export declare const INTERNAL_APPLICATION_ERROR_HANDLER: InjectionToken<(e: any) => void>;
export declare const errorHandlerEnvironmentInitializer: {
    provide: InjectionToken<readonly (() => void)[]>;
    useValue: () => void;
    multi: boolean;
};
/**
 * Provides an environment initializer which forwards unhandled errors to the ErrorHandler.
 *
 * The listeners added are for the window's 'unhandledrejection' and 'error' events.
 *
 * @publicApi
 */
export declare function provideBrowserGlobalErrorListeners(): EnvironmentProviders;
