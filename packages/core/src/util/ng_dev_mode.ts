/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {global} from './global';

declare global {
  const ngDevMode: null|NgDevModePerfCounters;
  interface NgDevModePerfCounters {
    namedConstructors: boolean;
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
    rendererAppendChild: number;
    rendererInsertBefore: number;
    rendererCreateComment: number;
    styleMap: number;
    styleMapCacheMiss: number;
    classMap: number;
    classMapCacheMiss: number;
    styleProp: number;
    stylePropCacheMiss: number;
    classProp: number;
    classPropCacheMiss: number;
    flushStyling: number;
    classesApplied: number;
    stylesApplied: number;
    stylingWritePersistedState: number;
    stylingReadPersistedState: number;
  }
}

export function ngDevModeResetPerfCounters(): NgDevModePerfCounters {
  const locationString = typeof location !== 'undefined' ? location.toString() : '';
  const newCounters: NgDevModePerfCounters = {
    namedConstructors: locationString.indexOf('ngDevMode=namedConstructors') != -1,
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
    rendererAppendChild: 0,
    rendererInsertBefore: 0,
    rendererCreateComment: 0,
    styleMap: 0,
    styleMapCacheMiss: 0,
    classMap: 0,
    classMapCacheMiss: 0,
    styleProp: 0,
    stylePropCacheMiss: 0,
    classProp: 0,
    classPropCacheMiss: 0,
    flushStyling: 0,
    classesApplied: 0,
    stylesApplied: 0,
    stylingWritePersistedState: 0,
    stylingReadPersistedState: 0,
  };

  // Make sure to refer to ngDevMode as ['ngDevMode'] for closure.
  const allowNgDevModeTrue = locationString.indexOf('ngDevMode=false') === -1;
  global['ngDevMode'] = allowNgDevModeTrue && newCounters;
  return newCounters;
}

/**
 * This checks to see if the `ngDevMode` has been set. If yes,
 * then we honor it, otherwise we default to dev mode with additional checks.
 *
 * The idea is that unless we are doing production build where we explicitly
 * set `ngDevMode == false` we should be helping the developer by providing
 * as much early warning and errors as possible.
 *
 * NOTE: changes to the `ngDevMode` name must be synced with `compiler-cli/src/tooling.ts`.
 */
if (typeof ngDevMode === 'undefined' || ngDevMode) {
  ngDevModeResetPerfCounters();
}
