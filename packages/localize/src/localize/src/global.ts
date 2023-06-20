/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// **********************************************************************************************
// This code to access the global object is mostly copied from `packages/core/src/util/global.ts`

// We do not want to pull the `webworker` types into this file, as it would make
// the global augmentations apply to the whole compilation and possible importers.
declare const WorkerGlobalScope: any;

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
