/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as core from '@angular/core';
import {getDOM} from '../dom_adapter';

const CORE_TOKENS = {
  'ApplicationRef': core.ApplicationRef,
  'NgZone': core.NgZone,
};

const INSPECT_GLOBAL_NAME = 'ng.probe';
const CORE_TOKENS_GLOBAL_NAME = 'ng.coreTokens';

/**
 * Returns a {@link DebugElement} for the given native DOM element, or
 * null if the given native element does not have an Angular view associated
 * with it.
 */
export function inspectNativeElement(element: any): core.DebugNode|null {
  return core.getDebugNode(element);
}

/**
 * Deprecated. Use the one from '@angular/core'.
 * @deprecated
 */
export class NgProbeToken {
  constructor(public name: string, public token: any) {}
}

export function _createNgProbe(extraTokens: NgProbeToken[], coreTokens: core.NgProbeToken[]): any {
  const tokens = (extraTokens || []).concat(coreTokens || []);
  getDOM().setGlobalVar(INSPECT_GLOBAL_NAME, inspectNativeElement);
  getDOM().setGlobalVar(
      CORE_TOKENS_GLOBAL_NAME, {...CORE_TOKENS, ..._ngProbeTokensToMap(tokens || [])});
  return () => inspectNativeElement;
}

function _ngProbeTokensToMap(tokens: NgProbeToken[]): {[name: string]: any} {
  return tokens.reduce((prev: any, t: any) => (prev[t.name] = t.token, prev), {});
}

/**
 * Providers which support debugging Angular applications (e.g. via `ng.probe`).
 */
export const ELEMENT_PROBE_PROVIDERS: core.Provider[] = [
  {
    provide: core.APP_INITIALIZER,
    useFactory: _createNgProbe,
    deps: [
      [NgProbeToken, new core.Optional()],
      [core.NgProbeToken, new core.Optional()],
    ],
    multi: true,
  },
];
