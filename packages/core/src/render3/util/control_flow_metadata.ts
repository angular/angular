/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TNode} from '../interfaces/node';

export type ConditionalBlockKind = 'if' | 'switch';

export type ConditionalBranchExpression = string | null | string[];

export interface ConditionalBlockMetadata {
  kind: ConditionalBlockKind;
  branchCount: number;
  defaultBranchIndex: number | null;
  expression: string | null;
  branchExpressions: ConditionalBranchExpression[];
  hasExhaustiveCheck: boolean;
}

const conditionalBlockMetadata = new WeakMap<TNode, ConditionalBlockMetadata>();

export function setConditionalBlockMetadata(
  tNode: TNode,
  metadata: ConditionalBlockMetadata,
): void {
  conditionalBlockMetadata.set(tNode, metadata);
}

export function getConditionalBlockMetadata(tNode: TNode): ConditionalBlockMetadata | undefined {
  return conditionalBlockMetadata.get(tNode);
}
