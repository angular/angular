/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ɵgetDOM as getDOM} from '@angular/common';
import {Injector, NgModuleRef} from '@angular/core';
import {ArgumentType, initServicesIfNeeded, NodeCheckFn, NodeDef, rootRenderNodes, Services, ViewData, viewDef, ViewDefinition, ViewDefinitionFactory, ViewFlags, ViewUpdateFn} from '@angular/core/src/view/index';
import {TestBed} from '@angular/core/testing';

export function isBrowser() {
  return getDOM().supportsDOMEvents;
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
      TestBed.inject(Injector), projectableNodes || [], rootSelectorOrNode, def,
      TestBed.inject(NgModuleRef), context);
}

export function createEmbeddedView(parent: ViewData, anchorDef: NodeDef, context?: any): ViewData {
  return Services.createEmbeddedView(parent, anchorDef, anchorDef.element!.template !, context);
}

export function compViewDef(
    nodes: NodeDef[], updateDirectives?: null|ViewUpdateFn, updateRenderer?: null|ViewUpdateFn,
    viewFlags: ViewFlags = ViewFlags.None): ViewDefinition {
  const def = viewDef(viewFlags, nodes, updateDirectives, updateRenderer);

  def.nodes.forEach((node, index) => {
    if (node.nodeIndex !== index) {
      throw new Error('nodeIndex should be the same as the index of the node');
    }

    // This check should be removed when we start reordering nodes at runtime
    if (node.checkIndex > -1 && node.checkIndex !== node.nodeIndex) {
      throw new Error(`nodeIndex and checkIndex should be the same, got ${node.nodeIndex} !== ${
          node.checkIndex}`);
    }
  });

  return def;
}

export function compViewDefFactory(
    nodes: NodeDef[], updateDirectives?: null|ViewUpdateFn, updateRenderer?: null|ViewUpdateFn,
    viewFlags: ViewFlags = ViewFlags.None): ViewDefinitionFactory {
  return () => compViewDef(nodes, updateDirectives, updateRenderer, viewFlags);
}

export function createAndGetRootNodes(
    viewDef: ViewDefinition, ctx?: any): {rootNodes: any[], view: ViewData} {
  const view = createRootView(viewDef, ctx);
  const rootNodes = rootRenderNodes(view);
  return {rootNodes, view};
}

let removeNodes: Node[];

beforeEach(() => {
  removeNodes = [];
});
afterEach(() => {
  removeNodes.forEach((node) => getDOM().remove(node));
});

export function recordNodeToRemove(node: Node) {
  removeNodes.push(node);
}

export function callMostRecentEventListenerHandler(spy: any, params: any) {
  const mostRecent = spy.calls.mostRecent();
  if (!mostRecent) {
    return;
  }

  const obj = mostRecent.object;
  const args = mostRecent.args;

  const eventName = args[0];
  const handler = args[1];

  handler && handler.apply(obj, [{type: eventName}]);
}
