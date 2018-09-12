/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

declare global {
  const ngDevMode: null|NgDevModePerfCounters;
  interface NgDevModePerfCounters {
    firstTemplatePass: number;
    tNode: number;
    tView: number;
    rendererCreateTextNode: number;
    rendererSetText: number;
    rendererCreateElement: number;
    rendererAddEventListener: number;
    rendererSetAttribute: number;
    rendererRemoveAttribute: number;
    rendererSetProperty: number;
    rendererSetClassName: number;
    rendererAddClass: number;
    rendererRemoveClass: number;
    rendererSetStyle: number;
    rendererRemoveStyle: number;
    rendererDestroy: number;
    rendererDestroyNode: number;
    rendererMoveNode: number;
    rendererRemoveNode: number;
    rendererCreateComment: number;
  }
}

declare let global: any;

export function ngDevModeResetPerfCounters(): NgDevModePerfCounters {
  const newCounters: NgDevModePerfCounters = {
    firstTemplatePass: 0,
    tNode: 0,
    tView: 0,
    rendererCreateTextNode: 0,
    rendererSetText: 0,
    rendererCreateElement: 0,
    rendererAddEventListener: 0,
    rendererSetAttribute: 0,
    rendererRemoveAttribute: 0,
    rendererSetProperty: 0,
    rendererSetClassName: 0,
    rendererAddClass: 0,
    rendererRemoveClass: 0,
    rendererSetStyle: 0,
    rendererRemoveStyle: 0,
    rendererDestroy: 0,
    rendererDestroyNode: 0,
    rendererMoveNode: 0,
    rendererRemoveNode: 0,
    rendererCreateComment: 0,
  };
  // NOTE: Under Ivy we may have both window & global defined in the Node
  //    environment since ensureDocument() in render3.ts sets global.window.
  if (typeof window != 'undefined') {
    // Make sure to refer to ngDevMode as ['ngDevMode'] for closure.
    (window as any)['ngDevMode'] = newCounters;
  }
  if (typeof global != 'undefined') {
    // Make sure to refer to ngDevMode as ['ngDevMode'] for closure.
    (global as any)['ngDevMode'] = newCounters;
  }
  if (typeof self != 'undefined') {
    // Make sure to refer to ngDevMode as ['ngDevMode'] for closure.
    (self as any)['ngDevMode'] = newCounters;
  }
  return newCounters;
}

/**
 * This checks to see if the `ngDevMode` has been set. If yes,
 * than we honor it, otherwise we default to dev mode with additional checks.
 *
 * The idea is that unless we are doing production build where we explicitly
 * set `ngDevMode == false` we should be helping the developer by providing
 * as much early warning and errors as possible.
 */
if (typeof ngDevMode === 'undefined' || ngDevMode) {
  ngDevModeResetPerfCounters();
}
