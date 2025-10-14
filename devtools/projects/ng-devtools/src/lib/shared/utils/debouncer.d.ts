/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/** Debounces a callback/handler. */
export declare class Debouncer {
    private handle?;
    private initialized;
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
    debounce<T extends (...args: any[]) => void>(handler: T, timeout: number): T;
    /** Cancel the currently debounced handler, if not resolved. */
    cancel(): void;
}
