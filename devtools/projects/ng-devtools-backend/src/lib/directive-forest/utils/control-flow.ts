/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ɵDeferBlockData as DeferBlockDataInternal,
  ɵControlFlowBlock as ControlFlowBlockInternal,
  ɵControlFlowBlockType as ControlFlowBlockTypeInternal,
} from '@angular/core';
import {
  ControlFlowBlock,
  ControlFlowBlockType,
  ForLoopBlock,
  DeferBlock,
  IfBlock,
  RenderedDeferBlock,
  SwitchBlock,
} from '../../../../../protocol';
import {ComponentTreeNode} from '../../shared/interfaces';
import {serializeValue} from '../../shared/state-serializer/state-serializer';

const ELEMENT_NAME_MAP: {[key in ControlFlowBlockType]: string} = {
  [ControlFlowBlockType.Defer]: '@defer',
  [ControlFlowBlockType.For]: '@for',
  [ControlFlowBlockType.If]: '@if',
  [ControlFlowBlockType.Switch]: '@switch',
};

export function isControlFlowBlock(node: Node, iterator: ControlFlowBlocksIterator) {
  const currentBlock = iterator.currentBlock;
  // Handles the case where the @defer is still unresolved but doesn't
  // have a placeholder, for instance, by which children we mark
  // the position of the block normally. In this case, we use the host.
  return node === currentBlock?.hostNode || node === currentBlock?.rootNodes[0];
}

export function mapToDevtoolsControlFlowModel(
  block: ControlFlowBlockInternal,
  iteratorCurrentIdx: number,
  rootId: number,
): ControlFlowBlock {
  switch (block.type) {
    case ControlFlowBlockTypeInternal.For:
      const serializedItems = block.items.map((item) => serializeValue(item, 5));

      return {
        id: `forId-${rootId}-${iteratorCurrentIdx}`,
        type: ControlFlowBlockType.For,
        hasEmptyBlock: block.hasEmptyBlock,
        items: serializedItems,
        trackExpression: block.trackExpression,
      } satisfies ForLoopBlock as ForLoopBlock;

    case ControlFlowBlockTypeInternal.Defer:
      return {
        id: `deferId-${rootId}-${iteratorCurrentIdx}`,
        type: ControlFlowBlockType.Defer,
        state: block.state,
        renderedBlock: getRenderedBlock(block),
        triggers: groupTriggers(block.triggers),
        blocks: {
          hasErrorBlock: block.hasErrorBlock,
          placeholderBlock: block.placeholderBlock,
          loadingBlock: block.loadingBlock,
        },
      } satisfies DeferBlock as DeferBlock;

    case ControlFlowBlockTypeInternal.If:
      return {
        id: `ifId-${rootId}-${iteratorCurrentIdx}`,
        type: ControlFlowBlockType.If,
        branchCount: block.branchCount,
        activeBranchIndex: block.activeBranchIndex,
        hasElseBlock: block.defaultBranchIndex !== null,
        conditionExpressions: normalizeBranchExpressions<string | null>(
          block.conditionExpressions,
          block.branchCount,
          () => null,
        ),
      } satisfies IfBlock as IfBlock;

    case ControlFlowBlockTypeInternal.Switch:
      return {
        id: `switchId-${rootId}-${iteratorCurrentIdx}`,
        type: ControlFlowBlockType.Switch,
        caseCount: block.branchCount,
        activeCaseIndex: block.activeBranchIndex,
        defaultCaseIndex: block.defaultBranchIndex,
        expression: block.expression ?? null,
        caseExpressions: normalizeBranchExpressions<string[]>(
          block.caseExpressions,
          block.branchCount,
          () => [],
        ),
        hasExhaustiveCheck: !!block.hasExhaustiveCheck,
      } satisfies SwitchBlock as SwitchBlock;
  }
}

function normalizeBranchExpressions<T>(
  expressions: ReadonlyArray<T | null | undefined> | undefined,
  branchCount: number,
  defaultValue: () => T,
): T[] {
  return Array.from({length: branchCount}, (_, index) => expressions?.[index] ?? defaultValue());
}

/**
 * Creates a synthetic ComponentTreeNode for control flow blocks.
 */
export function createControlFlowTreeNode(
  controlFlowBlock: ControlFlowBlockInternal,
  children: ComponentTreeNode[],
  iteratorCurrentIdx: number,
  rootId: number,
): ComponentTreeNode {
  return {
    children,
    component: null,
    directives: [],
    tagName: ELEMENT_NAME_MAP[controlFlowBlock.type],
    nativeElement: undefined,
    controlFlowBlock: mapToDevtoolsControlFlowModel(controlFlowBlock, iteratorCurrentIdx, rootId),
    static: false,
  };
}

export class ControlFlowBlocksIterator<
  T extends ControlFlowBlockInternal = ControlFlowBlockInternal,
> {
  public currentIndex = 0;
  private blocks: T[] = [];

  constructor(blocks: T[]) {
    this.blocks = blocks;
  }

  advance() {
    this.currentIndex++;
  }

  get currentBlock(): T | undefined {
    return this.blocks[this.currentIndex];
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

function getRenderedBlock(deferBlock: DeferBlockDataInternal): RenderedDeferBlock | null {
  if (['placeholder', 'loading', 'error'].includes(deferBlock.state)) {
    return deferBlock.state as 'placeholder' | 'loading' | 'error';
  }
  if (deferBlock.state === 'complete') {
    return 'defer';
  }
  return null;
}
