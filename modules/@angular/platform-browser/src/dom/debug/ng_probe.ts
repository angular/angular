/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ApplicationRef, DebugNode, NgZone, Optional, Provider, RootRenderer, getDebugNode, isDevMode} from '@angular/core';

import {StringMapWrapper} from '../../facade/collection';
import {DebugDomRootRenderer} from '../../private_import_core';
import {getDOM} from '../dom_adapter';
import {DomRootRenderer} from '../dom_renderer';


const CORE_TOKENS = {
  'ApplicationRef': ApplicationRef,
  'NgZone': NgZone
};

const INSPECT_GLOBAL_NAME = 'ng.probe';
const CORE_TOKENS_GLOBAL_NAME = 'ng.coreTokens';

/**
 * Returns a {@link DebugElement} for the given native DOM element, or
 * null if the given native element does not have an Angular view associated
 * with it.
 */
export function inspectNativeElement(element: any /** TODO #9100 */): DebugNode {
  return getDebugNode(element);
}

/**
 * @experimental
 */
export class NgProbeToken {
  constructor(private name: string, private token: any) {}
}

export function _createConditionalRootRenderer(
    rootRenderer: any /** TODO #9100 */, extraTokens: NgProbeToken[]) {
  if (isDevMode()) {
    return _createRootRenderer(rootRenderer, extraTokens);
  }
  return rootRenderer;
}

function _createRootRenderer(rootRenderer: any /** TODO #9100 */, extraTokens: NgProbeToken[]) {
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
export const ELEMENT_PROBE_PROVIDERS: Provider[] = [{
  provide: RootRenderer,
  useFactory: _createConditionalRootRenderer,
  deps: [DomRootRenderer, [NgProbeToken, new Optional()]]
}];

export const ELEMENT_PROBE_PROVIDERS_PROD_MODE: any[] = [{
  provide: RootRenderer,
  useFactory: _createRootRenderer,
  deps: [DomRootRenderer, [NgProbeToken, new Optional()]]
}];
