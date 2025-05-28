/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

type Callable = (...args: any) => void;

export class Debouncer {
  private timeout?: ReturnType<typeof setTimeout>;
  private initialized: boolean = false;

  debounce<T = any>(handler: T, timeout: number): T {
    if (this.initialized) {
      throw new Error('The debouncer is already initialized and running.');
    }
    this.initialized = true;

    return ((...args: any) => {
      this.cancel();
      this.timeout = setTimeout(() => (handler as Callable)(...args), timeout);
    }) as T;
  }

  cancel() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  }
}
