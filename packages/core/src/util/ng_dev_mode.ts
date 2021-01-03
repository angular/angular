/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {global} from './global';

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
  const ngDevMode: null|NgDevModePerfCounters;
  interface NgDevModePerfCounters {
    namedConstructors: boolean;
    firstCreatePass: number;
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
    rendererAppendChild: number;
    rendererInsertBefore: number;
    rendererCreateComment: number;
  }
}

export function ngDevModeResetPerfCounters(): NgDevModePerfCounters {
  const locationString = typeof location !== 'undefined' ? location.toString() : '';
  const newCounters: NgDevModePerfCounters = {
    namedConstructors: locationString.indexOf('ngDevMode=namedConstructors') != -1,
    firstCreatePass: 0,
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
    rendererAppendChild: 0,
    rendererInsertBefore: 0,
    rendererCreateComment: 0,
  };

  // Make sure to refer to ngDevMode as ['ngDevMode'] for closure.
  const allowNgDevModeTrue = locationString.indexOf('ngDevMode=false') === -1;
  global['ngDevMode'] = allowNgDevModeTrue && newCounters;
  return newCounters;
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
 *
 * NOTE:
 * - changes to the `ngDevMode` name must be synced with `compiler-cli/src/tooling.ts`.
 */
export function initNgDevMode(): boolean {
  // The below checks are to ensure that calling `initNgDevMode` multiple times does not
  // reset the counters.
  // If the `ngDevMode` is not an object, then it means we have not created the perf counters
  // yet.
  if (typeof ngDevMode === 'undefined' || ngDevMode) {
    if (typeof ngDevMode !== 'object') {
      ngDevModeResetPerfCounters();
    }
    return typeof ngDevMode !== 'undefined' && !!ngDevMode;
  }
  return false;
}
