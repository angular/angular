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

type HydrationInfo = ReturnType<
  FrameworkAgnosticGlobalUtils['ɵgetIncrementalHydrationInfo']
> | null;

const extractViewTree = (
  domNode: Node | Element,
  hydrationBoundaries: Map<string, HydrationBoundary>,
  result: ComponentTreeNode[],
  hydrationInfo: HydrationInfo | undefined,
  getComponent?: FrameworkAgnosticGlobalUtils['getComponent'],
  getDirectives?: FrameworkAgnosticGlobalUtils['getDirectives'],
  getDirectiveMetadata?: FrameworkAgnosticGlobalUtils['getDirectiveMetadata'],
): ComponentTreeNode[] => {
  // Ignore DOM Node if it came from a different frame. Use instanceof Node to check this.
  if (!(domNode instanceof Node)) {
    return result;
  }

  // Dehydrated nodes are not component/directive yet
  // They are regular DOM nodes attached to a hydration boundary "ngb"
  if (hydrationInfo?.dehydratedNodes.has(domNode as Element)) {
    const blockId = (domNode as Element).getAttribute('ngb')!;
    if (!hydrationBoundaries.has(blockId)) {
      const siblingNodes = [...(domNode.parentElement?.childNodes ?? [])];
      const nghPattern = 'ngh=';
      const hydrationBoundaryNode = siblingNodes.find(
        (node) => node.nodeType == Node.COMMENT_NODE && node.textContent?.includes(nghPattern),
      )!;

      const hydratedInfo = hydrationInfo.boundariesInfo.get(blockId) ?? {
        idle: false,
        immediate: false,
        viewport: false,
        timer: null,
        hover: false,
        interaction: false,
      };

      const deferedTreeNode: ComponentTreeNode = {
        children: [],
        component: null,
        directives: [],
        element: '@defer',
        nativeElement: hydrationBoundaryNode,
        hydration: {id: blockId, status: 'hydration-boundary', hydrate: hydratedInfo},
      };

      hydrationBoundaries.set(blockId, {tree: deferedTreeNode.children});
      result.push(deferedTreeNode);
    }

    const hydrationBoundaryNode = hydrationBoundaries.get(blockId)?.tree;
    if (hydrationBoundaryNode) {
      const deferedTreeNode: ComponentTreeNode = {
        children: [],
        component: null,
        directives: [],
        element: domNode.nodeName.toLowerCase(),
        nativeElement: domNode,
        hydration: {status: 'dehydrated'},
      };
      hydrationBoundaryNode.push(deferedTreeNode);

      domNode.childNodes.forEach((node) => {
        extractViewTree(
          node,
          hydrationBoundaries,
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
    hydration: hydrationStatus(domNode as HydrationNode),
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
    domNode.childNodes.forEach((node) => {
      extractViewTree(
        node,
        hydrationBoundaries,
        componentTreeNode.children,
        hydrationInfo,
        getComponent,
        getDirectives,
        getDirectiveMetadata,
      );
    });
  } else {
    domNode.childNodes.forEach((node) => {
      extractViewTree(
        node,
        hydrationBoundaries,
        result,
        hydrationInfo,
        getComponent,
        getDirectives,
        getDirectiveMetadata,
      );
    });
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

interface HydrationBoundary {
  tree: ComponentTreeNode[];
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
    const hydrationInfo = ng.ɵgetIncrementalHydrationInfo?.(appRootElement);
    return extractViewTree(
      topMostElement,
      new Map(),
      [],
      hydrationInfo,
      ng.getComponent,
      ng.getDirectives,
      ng.getDirectiveMetadata,
    );
  }
}
