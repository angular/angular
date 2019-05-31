/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {APP_INITIALIZER, ApplicationRef, DebugNode, NgProbeToken, NgZone, Optional, Provider, getDebugNode} from '@angular/core';

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
export function inspectNativeElement(element: any): DebugNode|null {
  return getDebugNode(element);
}

export function _createNgProbe(coreTokens: NgProbeToken[]): any {
  exportNgVar(INSPECT_GLOBAL_NAME, inspectNativeElement);
  exportNgVar(CORE_TOKENS_GLOBAL_NAME, {...CORE_TOKENS, ..._ngProbeTokensToMap(coreTokens || [])});
  return () => inspectNativeElement;
}

function _ngProbeTokensToMap(tokens: NgProbeToken[]): {[name: string]: any} {
  return tokens.reduce((prev: any, t: any) => (prev[t.name] = t.token, prev), {});
}

/**
 * In Ivy, we don't support NgProbe because we have our own set of testing utilities
 * with more robust functionality.
 *
 * We shouldn't bring in NgProbe because it prevents DebugNode and friends from
 * tree-shaking properly.
 */
export const ELEMENT_PROBE_PROVIDERS__POST_R3__ = [];

/**
 * Providers which support debugging Angular applications (e.g. via `ng.probe`).
 */
export const ELEMENT_PROBE_PROVIDERS__PRE_R3__: Provider[] = [
  {
    provide: APP_INITIALIZER,
    useFactory: _createNgProbe,
    deps: [
      [NgProbeToken, new Optional()],
    ],
    multi: true,
  },
];

export const ELEMENT_PROBE_PROVIDERS = ELEMENT_PROBE_PROVIDERS__PRE_R3__;
