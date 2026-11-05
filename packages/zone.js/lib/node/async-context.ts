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

import {AsyncContext, ZoneType} from '../zone-impl';

/** The part of the Node.js `AsyncResource` class that zone.js uses. */
type AsyncResourceConstructor = new (type: string) => AsyncContext;

function loadAsyncResource(global: any): AsyncResourceConstructor | undefined {
  let asyncHooks: {AsyncResource?: AsyncResourceConstructor} | undefined;
  try {
    // `require` is unavailable when the Node bundle is loaded as an ES module. This synchronous
    // loader works in both module formats without making the patch asynchronous.
    asyncHooks = global.process?.getBuiltinModule?.('node:async_hooks');
  } catch {}
  if (!asyncHooks) {
    try {
      asyncHooks = require('async_hooks');
    } catch {
      // `async_hooks` or a synchronous module loader is not available in every Node.js-like host.
    }
  }
  return asyncHooks?.AsyncResource;
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
    const AsyncResource = loadAsyncResource(global);
    if (typeof AsyncResource !== 'function') {
      return;
    }

    // Creating the resource captures the current context and `runInAsyncScope` enters it again.
    // This is cheaper than `AsyncResource.bind` and `AsyncLocalStorage.snapshot`, which define
    // properties on a bound function for every capture.
    api.captureAsyncContext = () => new AsyncResource('ZoneMicrotask');
  });
}
