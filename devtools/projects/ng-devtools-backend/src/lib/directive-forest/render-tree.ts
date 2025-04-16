/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ɵFrameworkAgnosticGlobalUtils as FrameworkAgnosticGlobalUtils,
  ɵDeferBlockData as DeferBlockData,
  ɵHydratedNode as HydrationNode,
} from '@angular/core';
import {HydrationStatus} from 'protocol';

import {ComponentTreeNode} from '../interfaces';
import {ngDebugClient} from '../ng-debug-api/ng-debug-api';
import {isCustomElement} from '../utils';

const extractViewTree = (
  domNode: Node | Element,
  result: ComponentTreeNode[],
  deferBlocks: {currentIndex: number; blocks: DeferBlockData[]},
  getComponent?: FrameworkAgnosticGlobalUtils['getComponent'],
  getDirectives?: FrameworkAgnosticGlobalUtils['getDirectives'],
  getDirectiveMetadata?: FrameworkAgnosticGlobalUtils['getDirectiveMetadata'],
): ComponentTreeNode[] => {
  // Ignore DOM Node if it came from a different frame. Use instanceof HTMLElement to check this.
  if (!(domNode instanceof HTMLElement)) {
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
    hydration: hydrationStatus(domNode),
    defer: null,
  };

  const isDehydratedElement = componentTreeNode.hydration?.status === 'dehydrated';

  if (isDehydratedElement) {
    result.push(componentTreeNode);
  } else {
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
  }

  const shouldNestChildren =
    componentTreeNode.component || componentTreeNode.directives.length || isDehydratedElement;

  // Nodes that are part of a defer block will be added as children of the defer block
  // and should be skipped from the regular code path
  const deferredNodesToSkip = new Set<Node>();

  domNode.childNodes.forEach((node) => {
    const currentDeferBlock = deferBlocks.blocks[deferBlocks.currentIndex];
    const isFirstDefferedChild = node === currentDeferBlock?.rootNodes[0];
    if (isFirstDefferedChild) {
      deferBlocks.currentIndex++;

      // When encountering the first child of a defer block
      // We create a synthetic TreeNode reprensenting the defer block
      const deferBlockTreeNode = createDeferTreeNode(
        node,
        currentDeferBlock,
        deferBlocks,
        getComponent,
        getDirectives,
        getDirectiveMetadata,
      );

      currentDeferBlock?.rootNodes.forEach((child) => deferredNodesToSkip.add(child));
      (shouldNestChildren ? componentTreeNode.children : result).push(deferBlockTreeNode);
    }

    if (!deferredNodesToSkip.has(node)) {
      extractViewTree(
        node,
        shouldNestChildren ? componentTreeNode.children : result,
        deferBlocks,
        getComponent,
        getDirectives,
        getDirectiveMetadata,
      );
    }
  });

  return result;
};

function createDeferTreeNode(
  domNode: Node | Element,
  currentDeferBlock: DeferBlockData,
  deferBlocks: {currentIndex: number; blocks: DeferBlockData[]},
  getComponent?: FrameworkAgnosticGlobalUtils['getComponent'],
  getDirectives?: FrameworkAgnosticGlobalUtils['getDirectives'],
  getDirectiveMetadata?: FrameworkAgnosticGlobalUtils['getDirectiveMetadata'],
) {
  const childrenTree: ComponentTreeNode[] = [];
  currentDeferBlock.rootNodes.forEach((child) => {
    extractViewTree(
      child,
      childrenTree,
      deferBlocks,
      getComponent,
      getDirectives,
      getDirectiveMetadata,
    );
  });

  const deferBlockTreeNode = {
    children: childrenTree,
    component: null,
    directives: [],
    element: '@defer',
    nativeElement: undefined,
    hydration: null,
    defer: {
      id: `deferId-${deferBlocks.currentIndex}`,
      triggers: currentDeferBlock.triggers,
    },
  } satisfies ComponentTreeNode;
  return deferBlockTreeNode;
}

function hydrationStatus(element: HydrationNode): HydrationStatus {
  if (!!element.getAttribute('ngh')) {
    return {status: 'dehydrated'};
  }

  const hydrationInfo = element.__ngDebugHydrationInfo__;
  switch (hydrationInfo?.status) {
    case 'hydrated':
      return {status: 'hydrated'};
    case 'skipped':
      return {status: 'skipped'};
    case 'mismatched':
      return {
        status: 'mismatched',
        expectedNodeDetails: hydrationInfo.expectedNodeDetails,
        actualNodeDetails: hydrationInfo.actualNodeDetails,
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

  build(element: Element): ComponentTreeNode[] {
    const ng = ngDebugClient();
    const deferBlocks = ng.ɵgetDeferBlocks?.(element) ?? [];

    // We want to start from the root element so that we can find components which are attached to
    // the application ref and which host elements have been inserted with DOM APIs.
    while (element.parentElement && element !== document.body) {
      element = element.parentElement;
    }
    return extractViewTree(
      element,
      [],
      {currentIndex: 0, blocks: deferBlocks},
      ng.getComponent,
      ng.getDirectives,
      ng.getDirectiveMetadata,
    );
  }
}
