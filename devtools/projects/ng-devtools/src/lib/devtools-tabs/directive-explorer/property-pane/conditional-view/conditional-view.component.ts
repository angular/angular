/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, computed, input} from '@angular/core';
import {MatToolbar} from '@angular/material/toolbar';

import {ControlFlowBlockType, IfBlock, SwitchBlock} from '../../../../../../../protocol';

type ConditionalBlock = IfBlock | SwitchBlock;

@Component({
  selector: 'ng-conditional-view',
  templateUrl: './conditional-view.component.html',
  styleUrls: ['./conditional-view.component.scss', '../styles/view-tab.scss'],
  imports: [MatToolbar],
})
export class ConditionalViewComponent {
  protected readonly block = input.required<IfBlock | SwitchBlock>();

  protected readonly primaryExpression = computed(() => getPrimaryExpression(this.block()));

  protected readonly renderedBlock = computed(() => {
    const activeIndex = getActiveBlockIndex(this.block());
    if (activeIndex === null) {
      return null;
    }

    return this.declaredBlocks()[activeIndex] ?? null;
  });

  protected readonly emptyRenderedBlockLabel = computed(() =>
    getEmptyRenderedBlockLabel(this.block()),
  );

  protected readonly declaredBlocks = computed(() => getDeclaredBlocks(this.block()));

  protected readonly state = computed(() => getStateLabel(this.block()));
}

function getPrimaryExpression(block: ConditionalBlock): string | null {
  return isIfBlock(block) ? (block.conditionExpressions?.[0] ?? null) : block.expression;
}

function getActiveBlockIndex(block: ConditionalBlock): number | null {
  return isIfBlock(block) ? block.activeBranchIndex : block.activeCaseIndex;
}

function getEmptyRenderedBlockLabel(block: ConditionalBlock): string {
  return isIfBlock(block) ? 'Nothing rendered' : 'No case matched';
}

function getDeclaredBlocks(block: ConditionalBlock): string[] {
  if (isIfBlock(block)) {
    return getDeclaredIfBlocks(block);
  }

  return getDeclaredSwitchBlocks(block);
}

function getDeclaredIfBlocks(block: IfBlock): string[] {
  return Array.from({length: block.branchCount}, (_, index) => getIfBranchLabel(block, index));
}

function getIfBranchLabel(block: IfBlock, index: number): string {
  if (index === 0) {
    return formatBlockWithExpression('@if', block.conditionExpressions?.[index] ?? null);
  }

  if (isElseBranch(block, index)) {
    return '@else';
  }

  return formatBlockWithExpression('@else if', block.conditionExpressions?.[index] ?? null);
}

function isElseBranch(block: IfBlock, index: number): boolean {
  return block.hasElseBlock && index === block.branchCount - 1;
}

function getDeclaredSwitchBlocks(block: SwitchBlock): string[] {
  const blocks = Array.from({length: block.caseCount}, (_, index) =>
    getSwitchCaseLabel(block, index),
  );

  if (block.hasExhaustiveCheck) {
    blocks.push('@default never');
  }

  return blocks;
}

function getSwitchCaseLabel(block: SwitchBlock, index: number): string {
  if (index === block.defaultCaseIndex) {
    return '@default';
  }

  return formatSwitchCase(block.caseExpressions?.[index] ?? []);
}

function getStateLabel(block: ConditionalBlock): string {
  const activeIndex = getActiveBlockIndex(block);
  const count = getRenderableBlockCount(block);
  const unit = isIfBlock(block) ? 'branch' : 'case group';

  if (activeIndex === null) {
    return `${count} declared, none active`;
  }

  return `Active ${unit} ${activeIndex + 1} of ${count}`;
}

function getRenderableBlockCount(block: ConditionalBlock): number {
  if (isIfBlock(block)) {
    return block.branchCount;
  }

  return block.caseCount;
}

function isIfBlock(block: ConditionalBlock): block is IfBlock {
  return block.type === ControlFlowBlockType.If;
}

function formatBlockWithExpression(name: string, expression: string | null): string {
  return expression ? `${name} (${expression})` : name;
}

function formatSwitchCase(expressions: string[]): string {
  if (expressions.length === 0) {
    return '@case (?)';
  }

  return expressions.map((expression) => `@case (${expression})`).join(', ');
}
