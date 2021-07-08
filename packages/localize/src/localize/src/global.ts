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

const __globalThis = typeof globalThis !== 'undefined' && globalThis;
const __window = typeof window !== 'undefined' && window;
const __self = typeof self !== 'undefined' && typeof WorkerGlobalScope !== 'undefined' &&
    self instanceof WorkerGlobalScope && self;
const __global = typeof global !== 'undefined' && global;
// Always use __globalThis if available; this is the spec-defined global variable across all
// environments.
// Then fallback to __global first; in Node tests both __global and __window may be defined.
export const _global: any = __globalThis || __global || __window || __self;
