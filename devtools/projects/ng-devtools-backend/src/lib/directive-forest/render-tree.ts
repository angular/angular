/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ɵHydratedNode as HydrationNode} from '@angular/core';
import {HydrationStatus} from 'protocol';

import {ComponentTreeNode} from '../interfaces';
import {ngDebugClient} from '../ng-debug-api/ng-debug-api';
import {isCustomElement} from '../utils';

const extractViewTree = (
  domNode: Node | Element,
  result: ComponentTreeNode[],
  getComponent: (element: Element) => {} | null,
  getDirectives: (node: Node) => {}[],
): ComponentTreeNode[] => {
  const directives = getDirectives(domNode);
  if (!directives.length && !(domNode instanceof Element)) {
    return result;
  }
  const componentTreeNode: ComponentTreeNode = {
    children: [],
    component: null,
    directives: directives.map((dir) => {
      return {
        instance: dir,
        name: dir.constructor.name,
      };
    }),
    element: domNode.nodeName.toLowerCase(),
    nativeElement: domNode,
    hydration: hydrationStatus(domNode as HydrationNode),
  };
  if (!(domNode instanceof Element)) {
    result.push(componentTreeNode);
    return result;
  }
  const component = getComponent(domNode);
  if (component) {
    componentTreeNode.component = {
      instance: component,
      isElement: isCustomElement(domNode),
      name: domNode.nodeName.toLowerCase(),
    };
  }
  if (component || componentTreeNode.directives.length) {
    result.push(componentTreeNode);
  }
  if (componentTreeNode.component || componentTreeNode.directives.length) {
    domNode.childNodes.forEach((node) =>
      extractViewTree(node, componentTreeNode.children, getComponent, getDirectives),
    );
  } else {
    domNode.childNodes.forEach((node) =>
      extractViewTree(node, result, getComponent, getDirectives),
    );
  }
  return result;
};

function hydrationStatus(node: HydrationNode): HydrationStatus {
  switch (node.__ngDebugHydrationInfo__?.status) {
    case 'hydrated':
      return {status: 'hydrated'};
    case 'skipped':
      return {status: 'skipped'};
    case 'mismatched':
      return {
        status: 'mismatched',
        expectedNodeDetails: node.__ngDebugHydrationInfo__.expectedNodeDetails,
        actualNodeDetails: node.__ngDebugHydrationInfo__.actualNodeDetails,
      };
    default:
      return null;
  }
}

export class RTreeStrategy {
  supports(): boolean {
    return (['getDirectiveMetadata', 'getComponent', 'getDirectives'] as const).every(
      (method) => typeof ngDebugClient()[method] === 'function',
    );
  }

  build(element: Element): ComponentTreeNode[] {
    // We want to start from the root element so that we can find components which are attached to
    // the application ref and which host elements have been inserted with DOM APIs.
    while (element.parentElement) {
      element = element.parentElement;
    }
    const getComponent = ngDebugClient().getComponent;
    const getDirectives = ngDebugClient().getDirectives;
    return extractViewTree(element, [], getComponent, getDirectives);
  }
}
