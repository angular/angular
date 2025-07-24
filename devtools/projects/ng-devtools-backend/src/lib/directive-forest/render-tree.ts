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
import {CurrentDeferBlock, HydrationStatus} from '../../../../protocol';

import {ComponentTreeNode} from '../interfaces';
import {ngDebugClient} from '../ng-debug-api/ng-debug-api';
import {isCustomElement} from '../utils';

const extractViewTree = (
  domNode: Node | Element,
  result: ComponentTreeNode[],
  deferBlocks: DeferBlocksIterator,
  getComponent?: FrameworkAgnosticGlobalUtils['getComponent'],
  getDirectives?: FrameworkAgnosticGlobalUtils['getDirectives'],
  getDirectiveMetadata?: FrameworkAgnosticGlobalUtils['getDirectiveMetadata'],
): ComponentTreeNode[] => {
  // Ignore DOM Node if it came from a different frame. Use instanceof Node to check this.
  if (!(domNode instanceof Node)) {
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

  if (!(domNode instanceof Element)) {
    // In case we show the Comment nodes
    result.push(componentTreeNode);
    return result;
  }

  const isDehydratedElement = componentTreeNode.hydration?.status === 'dehydrated';
  const component = getComponent?.(domNode);
  if (component) {
    componentTreeNode.component = {
      instance: component,
      isElement: isCustomElement(domNode),
      name: getDirectiveMetadata?.(component)?.name ?? domNode.nodeName.toLowerCase(),
    };
  }

  const isDisplayableNode = component || componentTreeNode.directives.length || isDehydratedElement;
  if (isDisplayableNode) {
    result.push(componentTreeNode);
  }

  // Nodes that are part of a defer block will be added as children of the defer block
  // and should be skipped from the regular code path
  const deferredNodesToSkip = new Set<Node>();
  const appendTo = isDisplayableNode ? componentTreeNode.children : result;

  domNode.childNodes.forEach((node) => {
    groupDeferChildrenIfNeeded(
      node,
      deferredNodesToSkip,
      appendTo,
      deferBlocks,
      getComponent,
      getDirectives,
      getDirectiveMetadata,
    );

    if (!deferredNodesToSkip.has(node)) {
      extractViewTree(
        node,
        appendTo,
        deferBlocks,
        getComponent,
        getDirectives,
        getDirectiveMetadata,
      );
    }
  });

  return result;
};

/**
 * Group Nodes under a defer block if they are part of it.
 *
 * @param node
 * @param deferredNodesToSkip Will mutate the set with the nodes that are grouped into the created deferblock.
 * @param deferBlocks
 * @param appendTo
 * @param getComponent
 * @param getDirectives
 * @param getDirectiveMetadata
 */
function groupDeferChildrenIfNeeded(
  node: Node,
  deferredNodesToSkip: Set<Node>,
  appendTo: ComponentTreeNode[],
  deferBlocks: DeferBlocksIterator,
  getComponent?: FrameworkAgnosticGlobalUtils['getComponent'],
  getDirectives?: FrameworkAgnosticGlobalUtils['getDirectives'],
  getDirectiveMetadata?: FrameworkAgnosticGlobalUtils['getDirectiveMetadata'],
) {
  const currentDeferBlock = deferBlocks.currentBlock;
  const isFirstDefferedChild = node === currentDeferBlock?.rootNodes[0];
  if (isFirstDefferedChild) {
    deferBlocks.advance();

    // When encountering the first child of a defer block
    // We create a synthetic TreeNode reprensenting the defer block
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
        state: currentDeferBlock.state,
        currentBlock: currentBlock(currentDeferBlock),
        triggers: groupTriggers(currentDeferBlock.triggers),
        blocks: {
          hasErrorBlock: currentDeferBlock.hasErrorBlock,
          placeholderBlock: currentDeferBlock.placeholderBlock,
          loadingBlock: currentDeferBlock.loadingBlock,
        },
      },
    } satisfies ComponentTreeNode;

    currentDeferBlock?.rootNodes.forEach((child) => deferredNodesToSkip.add(child));
    appendTo.push(deferBlockTreeNode);
  }
}

function hydrationStatus(element: Node): HydrationStatus {
  if (!(element instanceof Element)) {
    return null;
  }

  if (!!element.getAttribute('ngh')) {
    return {status: 'dehydrated'};
  }

  const hydrationInfo = (element as HydrationNode).__ngDebugHydrationInfo__;
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

function groupTriggers(triggers: string[]) {
  const defer: string[] = [];
  const hydrate: string[] = [];
  const prefetch: string[] = [];

  for (let trigger of triggers) {
    if (trigger.startsWith('hydrate')) {
      hydrate.push(trigger);
    } else if (trigger.startsWith('prefetch')) {
      prefetch.push(trigger);
    } else {
      defer.push(trigger);
    }
  }
  return {defer, hydrate, prefetch};
}

function currentBlock(deferBlock: DeferBlockData): CurrentDeferBlock | null {
  if (['placeholder', 'loading', 'error'].includes(deferBlock.state)) {
    return deferBlock.state as 'placeholder' | 'loading' | 'error';
  }
  return null;
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
      new DeferBlocksIterator(deferBlocks),
      ng.getComponent,
      ng.getDirectives,
      ng.getDirectiveMetadata,
    );
  }
}

class DeferBlocksIterator {
  public currentIndex = 0;
  private blocks: DeferBlockData[] = [];
  constructor(blocks: DeferBlockData[]) {
    this.blocks = blocks;
  }

  advance() {
    this.currentIndex++;
  }

  get currentBlock() {
    return this.blocks[this.currentIndex];
  }
}
