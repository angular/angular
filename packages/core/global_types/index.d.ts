/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// This file declares Angular's internal, framework-wide global flags. They are referenced as
// bare identifiers (no import) throughout `packages/`, so this file is wired into every
// `ts_project` that needs them via `typeRoots`/`types` in `tools/defaults.bzl`, rather than
// being imported directly.

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

  const ngJitMode: boolean;

  /**
   * Indicates whether the application is operating in server-rendering mode.
   *
   * `ngServerMode` is a global flag set by Angular's server-side rendering mechanisms,
   * typically configured by `provideServerRendering` and `platformServer` during runtime.
   *
   * @remarks
   * - **Internal Angular Flag**: This is an *internal* Angular flag (not a public API), avoid relying on it in application code.
   * - **Avoid Direct Use**: This variable is intended for runtime configuration; it should not be accessed directly in application code.
   */
  var ngServerMode: boolean | undefined;

  /**
   * Indicates whether HMR is enabled for the application.
   *
   * `ngHmrMode` is a global flag set by Angular's CLI.
   *
   * @remarks
   * - **Internal Angular Flag**: This is an *internal* Angular flag (not a public API), avoid relying on it in application code.
   * - **Avoid Direct Use**: This variable is intended for runtime configuration; it should not be accessed directly in application code.
   */
  var ngHmrMode: boolean | undefined;

  /**
   * NOTE: changes to the `ngI18nClosureMode` name must be synced with `compiler-cli/src/tooling.ts`.
   */
  const ngI18nClosureMode: boolean;
}

export {};
