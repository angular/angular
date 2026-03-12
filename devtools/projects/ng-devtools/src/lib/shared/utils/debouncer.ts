/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/** Debounces a callback/handler. */
export class Debouncer {
  private handle?: number;
  private initialized: boolean = false;

  /**
   * Debounces the wrapped handler by a provided timeout.
   *
   * Example:
   *
   * ```typescript
   * // Non-debounced
   * api((args) => { ... });
   *
   * // Debounced
   * const d = new Debouncer();
   * api(d.debounce(
   *   (args) => { ... },
   *   1000
   * ));
   * ```
   *
   * @param handler
   * @param timeout
   * @returns A debounced handler
   */
  debounce<T extends (...args: any[]) => void>(handler: T, timeout: number): T {
    if (this.initialized) {
      throw new Error('The debouncer is already initialized and running.');
    }
    this.initialized = true;

    return ((...lastArgs: any[]) => {
      this.cancel();
      this.handle = setTimeout(() => handler(...lastArgs), timeout);
    }) as T;
  }

  /** Cancel the currently debounced handler, if not resolved. */
  cancel() {
    if (this.handle) {
      clearTimeout(this.handle);
    }
  }
}
