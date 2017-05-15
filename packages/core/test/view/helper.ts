/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector, NgModuleRef, RootRenderer, Sanitizer} from '@angular/core';
import {ArgumentType, NodeCheckFn, NodeDef, RootData, Services, ViewData, ViewDefinition, initServicesIfNeeded} from '@angular/core/src/view/index';
import {TestBed} from '@angular/core/testing';
import {getDOM} from '@angular/platform-browser/src/dom/dom_adapter';

export function isBrowser() {
  return getDOM().supportsDOMEvents();
}

export const ARG_TYPE_VALUES = [ArgumentType.Inline, ArgumentType.Dynamic];

export function checkNodeInlineOrDynamic(
    check: NodeCheckFn, view: ViewData, nodeIndex: number, argType: ArgumentType,
    values: any[]): any {
  switch (argType) {
    case ArgumentType.Inline:
      return (<any>check)(view, nodeIndex, argType, ...values);
    case ArgumentType.Dynamic:
      return check(view, nodeIndex, argType, values);
  }
}

export function createRootView(
    def: ViewDefinition, context?: any, projectableNodes?: any[][],
    rootSelectorOrNode?: any): ViewData {
  initServicesIfNeeded();
  return Services.createRootView(
      TestBed.get(Injector), projectableNodes || [], rootSelectorOrNode, def,
      TestBed.get(NgModuleRef), context);
}

export function createEmbeddedView(parent: ViewData, anchorDef: NodeDef, context?: any): ViewData {
  return Services.createEmbeddedView(parent, anchorDef, anchorDef.element !.template !, context);
}

export let removeNodes: Node[];
beforeEach(() => { removeNodes = []; });
afterEach(() => { removeNodes.forEach((node) => getDOM().remove(node)); });
