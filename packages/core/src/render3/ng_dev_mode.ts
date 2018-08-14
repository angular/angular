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

declare var WorkerGlobalScope: any;
// CommonJS / Node have global context exposed as "global" variable.
// We don't want to include the whole node.d.ts this compilation unit so we'll just fake
// the global "global" var for now.

function getRoot(window: any, global: any, self: any) {
  return this || window || global || self;
}

const _root = getRoot(
    typeof window !== 'undefined' && window, typeof global !== 'undefined' && global,
    typeof self !== 'undefined' && typeof WorkerGlobalScope !== 'undefined' &&
        self instanceof WorkerGlobalScope && self);

export function ngDevModeResetPerfCounters(): NgDevModePerfCounters {
  // Make sure to refer to ngDevMode as ['ngDevMode'] for clousre.
  return _root['ngDevMode'] = {
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
  // Make sure to refer to ngDevMode as ['ngDevMode'] for clousre.
  _root['ngDevMode'] = ngDevModeResetPerfCounters();
}
