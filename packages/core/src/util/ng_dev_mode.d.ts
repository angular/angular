/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
declare global {
    /**
     * Values of ngDevMode
     * Depending on the current state of the application, ngDevMode may have one of several values.
     *
     * For convenience, the “truthy” value which enables dev mode is also an object which contains
     * Angular’s performance counters. This is not necessary, but cuts down on boilerplate for the
     * perf counters.
     *
     * ngDevMode may also be set to false. This can happen in one of a few ways:
     * - The user explicitly sets `window.ngDevMode = false` somewhere in their app.
     * - The user calls `enableProdMode()`.
     * - The URL contains a `ngDevMode=false` text.
     * Finally, ngDevMode may not have been defined at all.
     */
    const ngDevMode: null | NgDevModePerfCounters;
    interface NgDevModePerfCounters {
        hydratedNodes: number;
        hydratedComponents: number;
        dehydratedViewsRemoved: number;
        dehydratedViewsCleanupRuns: number;
        componentsSkippedHydration: number;
        deferBlocksWithIncrementalHydration: number;
    }
}
/**
 * This function checks to see if the `ngDevMode` has been set. If yes,
 * then we honor it, otherwise we default to dev mode with additional checks.
 *
 * The idea is that unless we are doing production build where we explicitly
 * set `ngDevMode == false` we should be helping the developer by providing
 * as much early warning and errors as possible.
 *
 * `ɵɵdefineComponent` is guaranteed to have been called before any component template functions
 * (and thus Ivy instructions), so a single initialization there is sufficient to ensure ngDevMode
 * is defined for the entire instruction set.
 *
 * When checking `ngDevMode` on toplevel, always init it before referencing it
 * (e.g. `((typeof ngDevMode === 'undefined' || ngDevMode) && initNgDevMode())`), otherwise you can
 *  get a `ReferenceError` like in https://github.com/angular/angular/issues/31595.
 *
 * Details on possible values for `ngDevMode` can be found on its docstring.
 */
export declare function initNgDevMode(): boolean;
