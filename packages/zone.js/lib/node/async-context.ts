/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/**
 * @fileoverview
 * @suppress {missingRequire}
 */

import {ZoneType} from '../zone-impl';

function loadAsyncResource(): typeof import('async_hooks').AsyncResource | undefined {
  try {
    // `require` is unavailable when the Node bundle is loaded as an ES module. This synchronous
    // loader works in both module formats without making the patch asynchronous.
    const asyncHooks = globalThis.process?.getBuiltinModule?.('node:async_hooks') as
      typeof import('async_hooks') | undefined;
    if (asyncHooks) {
      return asyncHooks.AsyncResource;
    }
    return require('async_hooks').AsyncResource;
  } catch {
    // `async_hooks` or a synchronous module loader is not available in every Node.js-like host.
    return undefined;
  }
}

/**
 * Node.js keeps a context of its own for every asynchronous operation — the stores of the active
 * `AsyncLocalStorage` instances and the chain of async resources — and propagates it through
 * promise reactions and `queueMicrotask` callbacks. Loggers, tracers and request-context
 * libraries rely on it to tell concurrent operations apart.
 *
 * zone.js replaces the global `Promise` and runs the reactions of unrelated operations from a
 * single shared microtask, so Node.js can no longer propagate that context on its own: it only
 * sees the one microtask, and runs every reaction in the context which happened to schedule it.
 * As the `async_hooks` documentation prescribes for code which manages its own callback queues
 * or provides a custom thenable, zone.js therefore captures the context with an `AsyncResource`
 * and runs the callback inside it.
 */
export function patchAsyncContext(Zone: ZoneType): void {
  Zone.__load_patch('asyncContext', (global: any, Zone: ZoneType, api: _ZonePrivate) => {
    const AsyncResource = loadAsyncResource();
    if (AsyncResource === undefined) {
      return;
    }

    api.captureAsyncContext = () => {
      // Creating the resource captures the current context and `runInAsyncScope` enters it again.
      // This is cheaper than `AsyncResource.bind` and `AsyncLocalStorage.snapshot`, which define
      // properties on a bound function for every capture.
      const resource = new AsyncResource('ZoneMicrotask');
      return (callback) => resource.runInAsyncScope(callback);
    };
  });
}
