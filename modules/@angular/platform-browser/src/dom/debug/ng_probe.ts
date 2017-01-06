/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as core from '@angular/core';

import {StringMapWrapper} from '../../facade/collection';
import {DebugDomRootRenderer} from '../../private_import_core';
import {getDOM} from '../dom_adapter';
import {DomRootRenderer} from '../dom_renderer';

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
export function inspectNativeElement(element: any): core.DebugNode {
  return core.getDebugNode(element);
}

/**
 * Deprecated. Use the one from '@angular/core'.
 * @deprecated
 */
export class NgProbeToken {
  constructor(public name: string, public token: any) {}
}


export function _createConditionalRootRenderer(
    rootRenderer: any, extraTokens: NgProbeToken[], coreTokens: core.NgProbeToken[]) {
  return core.isDevMode() ?
      _createRootRenderer(rootRenderer, (extraTokens || []).concat(coreTokens || [])) :
      rootRenderer;
}

function _createRootRenderer(rootRenderer: any, extraTokens: NgProbeToken[]) {
  getDOM().setGlobalVar(INSPECT_GLOBAL_NAME, inspectNativeElement);
  getDOM().setGlobalVar(
      CORE_TOKENS_GLOBAL_NAME,
      StringMapWrapper.merge(CORE_TOKENS, _ngProbeTokensToMap(extraTokens || [])));
  return new DebugDomRootRenderer(rootRenderer);
}

function _ngProbeTokensToMap(tokens: NgProbeToken[]): {[name: string]: any} {
  return tokens.reduce((prev: any, t: any) => (prev[t.name] = t.token, prev), {});
}

/**
 * Providers which support debugging Angular applications (e.g. via `ng.probe`).
 */
export const ELEMENT_PROBE_PROVIDERS: core.Provider[] = [{
  provide: core.RootRenderer,
  useFactory: _createConditionalRootRenderer,
  deps: [
    DomRootRenderer, [NgProbeToken, new core.Optional()],
    [core.NgProbeToken, new core.Optional()]
  ]
}];