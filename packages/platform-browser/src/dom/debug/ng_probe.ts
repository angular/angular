/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as core from '@angular/core';
import {exportNgVar} from '../util';

const CORE_TOKENS = {
  'ApplicationRef': core.ApplicationRef,
  'NgZone': core.NgZone,
};

const INSPECT_GLOBAL_NAME = 'probe';
const CORE_TOKENS_GLOBAL_NAME = 'coreTokens';

/**
 * Returns a {@link DebugElement} for the given native DOM element, or
 * null if the given native element does not have an Angular view associated
 * with it.
 */
export function inspectNativeElement(element: any): core.DebugNode|null {
  return core.getDebugNode(element);
}

export function _createNgProbe(coreTokens: core.NgProbeToken[]): any {
  exportNgVar(INSPECT_GLOBAL_NAME, inspectNativeElement);
  exportNgVar(CORE_TOKENS_GLOBAL_NAME, {...CORE_TOKENS, ..._ngProbeTokensToMap(coreTokens || [])});
  return () => inspectNativeElement;
}

function _ngProbeTokensToMap(tokens: core.NgProbeToken[]): {[name: string]: any} {
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
      [core.NgProbeToken, new core.Optional()],
    ],
    multi: true,
  },
];
