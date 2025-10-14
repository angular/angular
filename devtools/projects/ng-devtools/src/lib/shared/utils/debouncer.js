/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/** Debounces a callback/handler. */
export class Debouncer {
  constructor() {
    this.initialized = false;
  }
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
  debounce(handler, timeout) {
    if (this.initialized) {
      throw new Error('The debouncer is already initialized and running.');
    }
    this.initialized = true;
    return (...lastArgs) => {
      this.cancel();
      this.handle = setTimeout(() => handler(...lastArgs), timeout);
    };
  }
  /** Cancel the currently debounced handler, if not resolved. */
  cancel() {
    if (this.handle !== undefined) {
      clearTimeout(this.handle);
      this.handle = undefined;
    }
  }
}
//# sourceMappingURL=debouncer.js.map
