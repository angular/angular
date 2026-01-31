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
  ɵForLoopBlockData as ForLoopBlockData,
  ɵHydratedNode as HydrationNode,
} from '@angular/core';
import {RenderedDeferBlock, HydrationStatus} from '../../../../protocol';

import {ComponentTreeNode} from '../interfaces';
import {ngDebugClient} from '../ng-debug-api/ng-debug-api';
import {serializeValue} from '../state-serializer/state-serializer';
import {isCustomElement} from '../utils';

interface TreeExtractionContext {
  deferBlocks: DeferBlocksIterator;
  forLoopBlocks: ForLoopBlocksIterator;
  rootId: number;
  getComponent?: FrameworkAgnosticGlobalUtils['getComponent'];
  getDirectives?: FrameworkAgnosticGlobalUtils['getDirectives'];
  getDirectiveMetadata?: FrameworkAgnosticGlobalUtils['getDirectiveMetadata'];
}

function extractChildrenFromNodes(
  rootNodes: Node[],
  result: ComponentTreeNode[],
  ctx: TreeExtractionContext,
): void {
  for (const child of rootNodes) {
    extractViewTree(child, result, ctx);
  }
}

const extractViewTree = (
  domNode: Node | Element,
  result: ComponentTreeNode[],
  ctx: TreeExtractionContext,
): ComponentTreeNode[] => {
  // Ignore DOM Node if it came from a different frame. Use instanceof Node to check this.
  if (!(domNode instanceof Node)) {
    return result;
  }

  const directives = ctx.getDirectives?.(domNode) ?? [];
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
    forLoop: null,
  };

  if (!(domNode instanceof Element)) {
    // In case we show the Comment nodes
    result.push(componentTreeNode);
    return result;
  }

  const isDehydratedElement = componentTreeNode.hydration?.status === 'dehydrated';
  const component = ctx.getComponent?.(domNode);
  if (component) {
    componentTreeNode.component = {
      instance: component,
      isElement: isCustomElement(domNode),
      name: ctx.getDirectiveMetadata?.(component)?.name ?? domNode.nodeName.toLowerCase(),
    };
  }

  const isDisplayableNode = component || componentTreeNode.directives.length || isDehydratedElement;
  if (isDisplayableNode) {
    result.push(componentTreeNode);
  }

  // Nodes that are part of a defer block or for loop will be added as children of the block
  // and should be skipped from the regular code path
  const nodesToSkip = new Set<Node>();
  const appendTo = isDisplayableNode ? componentTreeNode.children : result;

  domNode.childNodes.forEach((node) => {
    if (nodesToSkip.has(node)) {
      return;
    }

    if (groupDeferChildrenIfNeeded(node, nodesToSkip, appendTo, ctx)) {
      return;
    }

    if (groupForLoopChildrenIfNeeded(node, nodesToSkip, appendTo, ctx)) {
      return;
    }

    extractViewTree(node, appendTo, ctx);
  });

  return result;
};

/**
 * Creates a synthetic ComponentTreeNode for control flow blocks (@defer, @for).
 */
function createControlFlowTreeNode(
  element: '@defer' | '@for',
  children: ComponentTreeNode[],
  defer: ComponentTreeNode['defer'] = null,
  forLoop: ComponentTreeNode['forLoop'] = null,
): ComponentTreeNode {
  return {
    children,
    component: null,
    directives: [],
    element,
    nativeElement: undefined,
    hydration: null,
    defer,
    forLoop,
  };
}

/**
 * Groups nodes under a @defer block if the given node is the first child of one.
 * @returns true if a defer block was created, false otherwise.
 */
function groupDeferChildrenIfNeeded(
  node: Node,
  nodesToSkip: Set<Node>,
  appendTo: ComponentTreeNode[],
  ctx: TreeExtractionContext,
): boolean {
  const currentDeferBlock = ctx.deferBlocks.currentBlock;
  const isFirstDeferredChild = node === currentDeferBlock?.rootNodes[0];
  // Handles the case where the @defer is still unresolved but doesn't
  // have a placeholder, for instance, by which children we mark
  // the position of the block normally. In this case, we use the host.
  const isHostNode = node === currentDeferBlock?.hostNode;

  if (!isFirstDeferredChild && !isHostNode) {
    return false;
  }

  ctx.deferBlocks.advance();

  const childrenTree: ComponentTreeNode[] = [];
  extractChildrenFromNodes(currentDeferBlock.rootNodes, childrenTree, ctx);

  const deferBlockTreeNode = createControlFlowTreeNode('@defer', childrenTree, {
    id: `deferId-${ctx.rootId}-${ctx.deferBlocks.currentIndex}`,
    state: currentDeferBlock.state,
    renderedBlock: getRenderedBlock(currentDeferBlock),
    triggers: groupTriggers(currentDeferBlock.triggers),
    blocks: {
      hasErrorBlock: currentDeferBlock.hasErrorBlock,
      placeholderBlock: currentDeferBlock.placeholderBlock,
      loadingBlock: currentDeferBlock.loadingBlock,
    },
  });

  currentDeferBlock.rootNodes.forEach((child) => nodesToSkip.add(child));
  appendTo.push(deferBlockTreeNode);
  return true;
}

/**
 * Groups nodes under a @for loop if the given node is the first child of one.
 * @returns true if a for loop block was created, false otherwise.
 */
function groupForLoopChildrenIfNeeded(
  node: Node,
  nodesToSkip: Set<Node>,
  appendTo: ComponentTreeNode[],
  ctx: TreeExtractionContext,
): boolean {
  const matchingForLoop = ctx.forLoopBlocks.findBlockForNode(node);
  if (!matchingForLoop) {
    return false;
  }

  const childrenTree: ComponentTreeNode[] = [];
  const processedNodes = new Set<Node>();
  processForLoopChildren(matchingForLoop.rootNodes, childrenTree, processedNodes, ctx);

  const forLoopTreeNode = createForLoopTreeNode(matchingForLoop, childrenTree, ctx);

  matchingForLoop.rootNodes.forEach((child) => nodesToSkip.add(child));
  appendTo.push(forLoopTreeNode);
  return true;
}

function processForLoopChildren(
  rootNodes: Node[],
  result: ComponentTreeNode[],
  processedNodes: Set<Node>,
  ctx: TreeExtractionContext,
): void {
  for (const child of rootNodes) {
    if (processedNodes.has(child)) {
      continue;
    }

    // Check if this child starts a nested @for loop
    const nestedForLoop = ctx.forLoopBlocks.findBlockForNode(child);
    if (nestedForLoop) {
      nestedForLoop.rootNodes.forEach((n) => processedNodes.add(n));

      const nestedChildren: ComponentTreeNode[] = [];
      processForLoopChildren(nestedForLoop.rootNodes, nestedChildren, new Set<Node>(), ctx);
      result.push(createForLoopTreeNode(nestedForLoop, nestedChildren, ctx));
    } else {
      processedNodes.add(child);
      extractViewTree(child, result, ctx);
    }
  }
}

function createForLoopTreeNode(
  forLoop: ForLoopBlockData,
  children: ComponentTreeNode[],
  ctx: TreeExtractionContext,
): ComponentTreeNode {
  const serializedItems = forLoop.items.map((item) => serializeValue(item, 5));

  return createControlFlowTreeNode('@for', children, null, {
    id: `forId-${ctx.rootId}-${ctx.forLoopBlocks.currentIndex}`,
    itemCount: forLoop.itemCount,
    hasEmptyBlock: forLoop.hasEmptyBlock,
    items: serializedItems,
    trackExpression: forLoop.trackExpression,
  });
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

function getRenderedBlock(deferBlock: DeferBlockData): RenderedDeferBlock | null {
  if (['placeholder', 'loading', 'error'].includes(deferBlock.state)) {
    return deferBlock.state as 'placeholder' | 'loading' | 'error';
  }
  if (deferBlock.state === 'complete') {
    return 'defer';
  }
  return null;
}

export class RTreeStrategy {
  supports(): boolean {
    return (['getDirectiveMetadata', 'getComponent'] as const).every(
      (method) => typeof ngDebugClient()[method] === 'function',
    );
  }

  build(element: Element, rootId: number = 0): ComponentTreeNode[] {
    const ng = ngDebugClient();
    const deferBlocks = ng.ɵgetDeferBlocks?.(element) ?? [];
    const forLoopBlocks = ng.ɵgetForLoopBlocks?.(element) ?? [];
    const ctx: TreeExtractionContext = {
      deferBlocks: new DeferBlocksIterator(deferBlocks),
      forLoopBlocks: new ForLoopBlocksIterator(forLoopBlocks),
      rootId,
      getComponent: ng.getComponent,
      getDirectives: ng.getDirectives,
      getDirectiveMetadata: ng.getDirectiveMetadata,
    };

    return extractViewTree(element, [], ctx);
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

  get currentBlock(): DeferBlockData | undefined {
    return this.blocks[this.currentIndex];
  }
}

class ForLoopBlocksIterator {
  public currentIndex = 0;
  private blocks: ForLoopBlockData[] = [];
  private usedBlocks = new Set<number>();

  constructor(blocks: ForLoopBlockData[]) {
    this.blocks = blocks;
  }

  advance() {
    this.currentIndex++;
  }

  findBlockForNode(node: Node): ForLoopBlockData | null {
    for (let i = 0; i < this.blocks.length; i++) {
      if (this.usedBlocks.has(i)) {
        continue;
      }
      const block = this.blocks[i];
      if (block.rootNodes[0] === node) {
        this.usedBlocks.add(i);
        this.currentIndex = i;
        return block;
      }
    }
    return null;
  }

  get currentBlock() {
    return this.blocks[this.currentIndex];
  }
}
