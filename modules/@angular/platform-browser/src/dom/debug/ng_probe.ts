import {DebugNode, getDebugNode, Provider, RootRenderer, NgZone, ApplicationRef} from '@angular/core';
import {DebugDomRootRenderer} from '../../../core_private';
import {assertionsEnabled} from '../../facade/lang';
import {getDOM} from '../dom_adapter';
import {DomRootRenderer} from '../dom_renderer';


const CORE_TOKENS = /*@ts2dart_const*/ {'ApplicationRef': ApplicationRef, 'NgZone': NgZone};

const INSPECT_GLOBAL_NAME = 'ng.probe';
const CORE_TOKENS_GLOBAL_NAME = 'ng.coreTokens';

/**
 * Returns a {@link DebugElement} for the given native DOM element, or
 * null if the given native element does not have an Angular view associated
 * with it.
 */
export function inspectNativeElement(element): DebugNode {
  return getDebugNode(element);
}

function _createConditionalRootRenderer(rootRenderer) {
  if (assertionsEnabled()) {
    return _createRootRenderer(rootRenderer);
  }
  return rootRenderer;
}

function _createRootRenderer(rootRenderer) {
  getDOM().setGlobalVar(INSPECT_GLOBAL_NAME, inspectNativeElement);
  getDOM().setGlobalVar(CORE_TOKENS_GLOBAL_NAME, CORE_TOKENS);
  return new DebugDomRootRenderer(rootRenderer);
}

/**
 * Providers which support debugging Angular applications (e.g. via `ng.probe`).
 */
export const ELEMENT_PROBE_PROVIDERS: any[] = /*@ts2dart_const*/[
  /*@ts2dart_Provider*/ {
    provide: RootRenderer,
    useFactory: _createConditionalRootRenderer,
    deps: [DomRootRenderer]
  }
];

export const ELEMENT_PROBE_PROVIDERS_PROD_MODE: any[] = /*@ts2dart_const*/[
  /*@ts2dart_Provider*/ {
    provide: RootRenderer,
    useFactory: _createRootRenderer,
    deps: [DomRootRenderer]
  }
];
