/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  ɵwhenStable as whenStable,
  inject,
  ErrorHandler,
  OnDestroy,
  Injectable,
  ApplicationRef,
  NgZone,
} from '@angular/core';

@Injectable({providedIn: 'root'})
export class ErrorInterceptor implements OnDestroy {
  private readonly errorHandler = inject(ErrorHandler);
  private readonly errorHandlerPromise: Promise<void>;
  private unlistenUnhandledRejection: VoidFunction | undefined;
  private promiseReject!: (reason?: unknown) => void;

  constructor() {
    const appRef = inject(ApplicationRef);
    const ngZone = inject(NgZone);

    this.errorHandlerPromise = ngZone.runOutsideAngular(
      () =>
        new Promise<void>((resolve, reject) => {
          this.promiseReject = reject;

          whenStable(appRef)
            // Allows pending promises to be settled and errors to be surfaced to the users.
            .then(() => new Promise<void>((resolve) => setTimeout(resolve, 0)))
            .then(() => resolve());
        }),
    );
  }

  get whenStableWithoutError(): Promise<void> {
    return this.errorHandlerPromise;
  }

  intercept(): void {
    this.patchHandleError();
    this.interceptUnhandledRejection();
  }

  private onError(reason?: unknown): void {
    this.promiseReject(reason);
  }

  /** Update the error handler to allow interception of its calls, enabling us to track occurrences of errors. */
  private patchHandleError(): void {
    const errorHandler = this.errorHandler;
    const originalHandleError = errorHandler.handleError;
    errorHandler.handleError = (error) => {
      originalHandleError.call(errorHandler, error);
      this.onError(error);
    };
  }

  /**
   * Intecept unhandled promise rejections.
   * This is crucial to prevent server crashes in scenarios where Zone.js is not utilized, and to avoid application
   * build to succeed incorrectly during SSG when async errors occurring within life-cycle hooks, listeners and other.
   * The framework currently lacks proper handling of async methods, leading to unhandled promise rejections. This issue needs to be rectified in future.
   */
  private interceptUnhandledRejection(): void {
    if (typeof process !== 'undefined') {
      const listener: (reason: unknown, promise: Promise<unknown>) => void = (reason) =>
        this.onError(reason);
      process.on('unhandledRejection', listener);
      this.unlistenUnhandledRejection = () =>
        process.removeListener('unhandledRejection', listener);
    } else if ('addEventListener' in globalThis) {
      const listener = (event: PromiseRejectionEvent) => {
        this.onError(event.reason);
        event.preventDefault();
      };

      addEventListener('unhandledrejection', listener);
      this.unlistenUnhandledRejection = () => removeEventListener('unhandledrejection', listener);
    }
  }

  ngOnDestroy() {
    this.unlistenUnhandledRejection?.();
  }
}
