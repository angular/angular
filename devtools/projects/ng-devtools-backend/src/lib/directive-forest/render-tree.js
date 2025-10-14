/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {ngDebugClient} from '../ng-debug-api/ng-debug-api';
import {isCustomElement} from '../utils';
const extractViewTree = (
  domNode,
  result,
  deferBlocks,
  rootId,
  getComponent,
  getDirectives,
  getDirectiveMetadata,
) => {
  // Ignore DOM Node if it came from a different frame. Use instanceof Node to check this.
  if (!(domNode instanceof Node)) {
    return result;
  }
  const directives = getDirectives?.(domNode) ?? [];
  if (!directives.length && !(domNode instanceof Element)) {
    return result;
  }
  const componentTreeNode = {
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
  const deferredNodesToSkip = new Set();
  const appendTo = isDisplayableNode ? componentTreeNode.children : result;
  domNode.childNodes.forEach((node) => {
    groupDeferChildrenIfNeeded(
      node,
      deferredNodesToSkip,
      appendTo,
      deferBlocks,
      rootId,
      getComponent,
      getDirectives,
      getDirectiveMetadata,
    );
    if (!deferredNodesToSkip.has(node)) {
      extractViewTree(
        node,
        appendTo,
        deferBlocks,
        rootId,
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
  node,
  deferredNodesToSkip,
  appendTo,
  deferBlocks,
  rootId,
  getComponent,
  getDirectives,
  getDirectiveMetadata,
) {
  const currentDeferBlock = deferBlocks.currentBlock;
  const isFirstDefferedChild = node === currentDeferBlock?.rootNodes[0];
  if (isFirstDefferedChild) {
    deferBlocks.advance();
    // When encountering the first child of a defer block
    // We create a synthetic TreeNode reprensenting the defer block
    const childrenTree = [];
    currentDeferBlock.rootNodes.forEach((child) => {
      extractViewTree(
        child,
        childrenTree,
        deferBlocks,
        rootId,
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
        id: `deferId-${rootId}-${deferBlocks.currentIndex}`,
        state: currentDeferBlock.state,
        currentBlock: currentBlock(currentDeferBlock),
        triggers: groupTriggers(currentDeferBlock.triggers),
        blocks: {
          hasErrorBlock: currentDeferBlock.hasErrorBlock,
          placeholderBlock: currentDeferBlock.placeholderBlock,
          loadingBlock: currentDeferBlock.loadingBlock,
        },
      },
    };
    currentDeferBlock?.rootNodes.forEach((child) => deferredNodesToSkip.add(child));
    appendTo.push(deferBlockTreeNode);
  }
}
function hydrationStatus(element) {
  if (!(element instanceof Element)) {
    return null;
  }
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
function groupTriggers(triggers) {
  const defer = [];
  const hydrate = [];
  const prefetch = [];
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
function currentBlock(deferBlock) {
  if (['placeholder', 'loading', 'error'].includes(deferBlock.state)) {
    return deferBlock.state;
  }
  return null;
}
export class RTreeStrategy {
  supports() {
    return ['getDirectiveMetadata', 'getComponent'].every(
      (method) => typeof ngDebugClient()[method] === 'function',
    );
  }
  build(element, rootId = 0) {
    const ng = ngDebugClient();
    const deferBlocks = ng.ɵgetDeferBlocks?.(element) ?? [];
    return extractViewTree(
      element,
      [],
      new DeferBlocksIterator(deferBlocks),
      rootId,
      ng.getComponent,
      ng.getDirectives,
      ng.getDirectiveMetadata,
    );
  }
}
class DeferBlocksIterator {
  constructor(blocks) {
    this.currentIndex = 0;
    this.blocks = [];
    this.blocks = blocks;
  }
  advance() {
    this.currentIndex++;
  }
  get currentBlock() {
    return this.blocks[this.currentIndex];
  }
}
//# sourceMappingURL=render-tree.js.map
