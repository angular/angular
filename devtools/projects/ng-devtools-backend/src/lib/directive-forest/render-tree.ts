/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import type {
  ɵFrameworkAgnosticGlobalUtils as FrameworkAgnosticGlobalUtils,
  ɵHydratedNode as HydrationNode,
} from '@angular/core';
import {HydrationStatus} from 'protocol';

import {ComponentTreeNode} from '../interfaces';
import {ngDebugClient} from '../ng-debug-api/ng-debug-api';
import {isCustomElement} from '../utils';

type HydrationInfo = ReturnType<FrameworkAgnosticGlobalUtils['ɵgetIncrementalHydrationInfo']> & {
  deferChildren: Map<string, ComponentTreeNode[]>;
};

const extractViewTree = (
  domNode: Node | Element,
  result: ComponentTreeNode[],
  hydrationInfo: HydrationInfo | undefined,
  getComponent?: FrameworkAgnosticGlobalUtils['getComponent'],
  getDirectives?: FrameworkAgnosticGlobalUtils['getDirectives'],
  getDirectiveMetadata?: FrameworkAgnosticGlobalUtils['getDirectiveMetadata'],
): ComponentTreeNode[] => {
  // Ignore DOM Node if it came from a different frame. Use instanceof Element to check this.
  if (!(domNode instanceof HTMLElement)) {
    return result;
  }

  const isAngular = true;
  if (isAngular) {
    const nodes = insertDeferBlock(
      domNode,
      result,
      hydrationInfo,
      getComponent,
      getDirectives,
      getDirectiveMetadata,
    );
    if (nodes) {
      return nodes;
    }
  }

  const directives = getDirectives?.(domNode) ?? [];
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
    hydration: hydrationStatus(domNode),
  };
  if (!(domNode instanceof Element)) {
    result.push(componentTreeNode);
    return result;
  }
  const component = getComponent?.(domNode);
  if (component) {
    componentTreeNode.component = {
      instance: component,
      isElement: isCustomElement(domNode),
      name: getDirectiveMetadata?.(component)?.name ?? domNode.nodeName.toLowerCase(),
    };
  }
  if (component || componentTreeNode.directives.length) {
    result.push(componentTreeNode);
  }
  if (componentTreeNode.component || componentTreeNode.directives.length) {
    domNode.childNodes.forEach((node) =>
      extractViewTree(
        node,
        componentTreeNode.children,
        hydrationInfo,
        getComponent,
        getDirectives,
        getDirectiveMetadata,
      ),
    );
  } else {
    domNode.childNodes.forEach((node) =>
      extractViewTree(
        node,
        result,
        hydrationInfo,
        getComponent,
        getDirectives,
        getDirectiveMetadata,
      ),
    );
  }
  return result;
};

function insertDeferBlock(
  domNode: HTMLElement,
  result: ComponentTreeNode[],
  hydrationInfo: HydrationInfo | undefined,
  getComponent?: FrameworkAgnosticGlobalUtils['getComponent'],
  getDirectives?: FrameworkAgnosticGlobalUtils['getDirectives'],
  getDirectiveMetadata?: FrameworkAgnosticGlobalUtils['getDirectiveMetadata'],
): ComponentTreeNode[] | undefined {
  // Dehydrated nodes are not component/directive yet
  // They are regular DOM nodes attached to a hydration boundary "ngb"
  if (
    hydrationInfo &&
    (domNode as HydrationNode).__ngDebugHydrationInfo__?.status === 'dehydrated'
  ) {
    const blockId = domNode.getAttribute('ngb')!;
    if (!hydrationInfo.deferChildren.has(blockId)) {
      // We'll create a synthetic TreeNode for the defer block
      // All elements hydrated within this block will be children of this node
      const hydratedInfo = hydrationInfo.hydrationTriggers.get(blockId);

      const deferedTreeNode: ComponentTreeNode = {
        children: [],
        component: null,
        directives: [],
        element: '@defer',
        nativeElement: undefined, // The defer block only exists as a comment node
        hydration: {
          id: blockId,
          status: 'hydration-boundary',
          hydrate: hydratedInfo,
          defer: {
            hover: false,
            idle: false,
            interaction: false,
            immediate: false,
            timer: null,
            viewport: false,
            when: false,
          },
        },
      };

      hydrationInfo.deferChildren.set(blockId, deferedTreeNode.children);
      result.push(deferedTreeNode);
    }

    const deferBlockTreeNode = hydrationInfo.deferChildren.get(blockId);
    if (deferBlockTreeNode) {
      // Where do we insert the new node? As a defer child or as a component child?
      const isOnHydrationBoundaryLevel =
        deferBlockTreeNode.length === 0 ||
        deferBlockTreeNode[0]?.nativeElement?.parentElement === domNode.parentElement;

      const deferedTreeNode: ComponentTreeNode = {
        children: [],
        component: null,
        directives: [],
        element: domNode.nodeName.toLowerCase(),
        nativeElement: domNode,
        hydration: {status: 'dehydrated'},
      };
      (isOnHydrationBoundaryLevel ? deferBlockTreeNode : result).push(deferedTreeNode);

      domNode.childNodes.forEach((node) => {
        extractViewTree(
          node,
          deferedTreeNode.children,
          hydrationInfo,
          getComponent,
          getDirectives,
          getDirectiveMetadata,
        );
      });
    }
    return result;
  }

  return undefined;
}

function hydrationStatus(node: Element): HydrationStatus {
  if (!('__ngDebugHydrationInfo__' in node)) {
    return null;
  }
  const hydratedNode = node as HydrationNode;
  switch (hydratedNode.__ngDebugHydrationInfo__?.status) {
    case 'hydrated':
      return {status: 'hydrated'};
    case 'skipped':
      return {status: 'skipped'};
    case 'mismatched':
      return {
        status: 'mismatched',
        expectedNodeDetails: hydratedNode.__ngDebugHydrationInfo__.expectedNodeDetails,
        actualNodeDetails: hydratedNode.__ngDebugHydrationInfo__.actualNodeDetails,
      };
    default:
      return null;
  }
}

export class RTreeStrategy {
  supports(): boolean {
    return (['getDirectiveMetadata', 'getComponent'] as const).every(
      (method) => typeof ngDebugClient()[method] === 'function',
    );
  }

  build(appRootElement: Element): ComponentTreeNode[] {
    // We want to start from the root element so that we can find components which are attached to
    // the application ref and which host elements have been inserted with DOM APIs.
    let topMostElement = appRootElement;
    while (topMostElement.parentElement) {
      topMostElement = topMostElement.parentElement;
    }

    const ng = ngDebugClient();
    const hydrationInfo: HydrationInfo = {
      // If the global function isn' defined in this app context
      hydrationTriggers: new Map(),

      ...ng.ɵgetIncrementalHydrationInfo?.(appRootElement),
      deferChildren: new Map(),
    };
    return extractViewTree(
      topMostElement,
      [],
      hydrationInfo,
      ng.getComponent,
      ng.getDirectives,
      ng.getDirectiveMetadata,
    );
  }
}
