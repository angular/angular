/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ControlFlowBlock,
  ControlFlowBlockType,
  DeferBlock,
  ForBlock,
} from '../../../../../protocol';

export const BlockType = {
  isDeferBlock(node: ControlFlowBlock | null): node is DeferBlock {
    return !!node && node.type === ControlFlowBlockType.Defer;
  },

  isForBlock(node: ControlFlowBlock | null): node is ForBlock {
    return !!node && node.type === ControlFlowBlockType.For;
  },
};
