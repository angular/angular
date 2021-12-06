/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ApplicationRef, DebugNode, NgProbeToken, NgZone, ɵgetDebugNodeR2} from '@angular/core';

import {exportNgVar} from '../util';

const CORE_TOKENS = (() => ({
                       'ApplicationRef': ApplicationRef,
                       'NgZone': NgZone,
                     }))();

const INSPECT_GLOBAL_NAME = 'probe';
const CORE_TOKENS_GLOBAL_NAME = 'coreTokens';

/**
 * Returns a {@link DebugElement} for the given native DOM element, or
 * null if the given native element does not have an Angular view associated
 * with it.
 */
export function inspectNativeElementR2(element: any): DebugNode|null {
  return ɵgetDebugNodeR2(element);
}

export function _createNgProbeR2(coreTokens: NgProbeToken[]): any {
  exportNgVar(INSPECT_GLOBAL_NAME, inspectNativeElementR2);
  exportNgVar(CORE_TOKENS_GLOBAL_NAME, {...CORE_TOKENS, ..._ngProbeTokensToMap(coreTokens || [])});
  return () => inspectNativeElementR2;
}

function _ngProbeTokensToMap(tokens: NgProbeToken[]): {[name: string]: any} {
  return tokens.reduce((prev: any, t: any) => (prev[t.name] = t.token, prev), {});
}
