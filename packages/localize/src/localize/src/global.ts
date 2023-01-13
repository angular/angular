/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// **********************************************************************************************
// This code to access the global object is mostly copied from `packages/core/src/util/global.ts`

declare global {
  // The definition of `WorkerGlobalScope` must be compatible with the one in `lib.webworker.d.ts`,
  // because all files under `packages/` are compiled together as part of the
  // [legacy-unit-tests-saucelabs][1] CI job, including the `lib.webworker.d.ts` typings brought in
  // by [service-worker/worker/src/service-worker.d.ts][2].
  //
  // [1]:
  // https://github.com/angular/angular/blob/ffeea63f43e6a7fd46be4a8cd5a5d254c98dea08/.circleci/config.yml#L681
  // [2]:
  // https://github.com/angular/angular/blob/316dc2f12ce8931f5ff66fa5f8da21c0d251a337/packages/service-worker/worker/src/service-worker.d.ts#L9
  interface WorkerGlobalScope extends EventTarget, WindowOrWorkerGlobalScope {}

  var WorkerGlobalScope: {prototype: WorkerGlobalScope; new (): WorkerGlobalScope;};
}

// Always use __globalThis if available, which is the spec-defined global variable across all
// environments, then fallback to __global first, because in Node tests both __global and
// __window may be defined and _global should be __global in that case. Note: Typeof/Instanceof
// checks are considered side-effects in Terser. We explicitly mark this as side-effect free:
// https://github.com/terser/terser/issues/250.
export const _global: any = (/* @__PURE__ */ (
    () => (typeof globalThis !== 'undefined' && globalThis) ||
        (typeof global !== 'undefined' && global) || (typeof window !== 'undefined' && window) ||
        (typeof self !== 'undefined' && typeof WorkerGlobalScope !== 'undefined' &&
         self instanceof WorkerGlobalScope && self))());
