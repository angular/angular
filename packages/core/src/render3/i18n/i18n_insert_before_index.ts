/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {assertEqual} from '../../util/assert';
import {TNode, TNodeType} from '../interfaces/node';
import {setI18nHandling} from '../node_manipulation';
import {getInsertInFrontOfRNodeWithI18n, processI18nInsertBefore} from '../node_manipulation_i18n';

/**
 * Add `tNode` to `previousTNodes` list and update relevant `TNode`s in `previousTNodes` list
 * `tNode.insertBeforeIndex`.
 *
 * Things to keep in mind:
 * 1. All i18n text nodes are encoded as `TNodeType.Element` and are created eagerly by the
 *    `ɵɵi18nStart` instruction.
 * 2. All `TNodeType.Placeholder` `TNodes` are elements which will be created later by
 *    `ɵɵelementStart` instruction.
 * 3. `ɵɵelementStart` instruction will create `TNode`s in the ascending `TNode.index` order. (So a
 *    smaller index `TNode` is guaranteed to be created before a larger one)
 *
 * We use the above three invariants to determine `TNode.insertBeforeIndex`.
 *
 * In an ideal world `TNode.insertBeforeIndex` would always be `TNode.next.index`. However,
 * this will not work because `TNode.next.index` may be larger than `TNode.index` which means that
 * the next node is not yet created and therefore we can't insert in front of it.
 *
 * Rule1: `TNode.insertBeforeIndex = null` if `TNode.next === null` (Initial condition, as we don't
 *        know if there will be further `TNode`s inserted after.)
 * Rule2: If `previousTNode` is created after the `tNode` being inserted, then
 *        `previousTNode.insertBeforeNode = tNode.index` (So when a new `tNode` is added we check
 *        previous to see if we can update its `insertBeforeTNode`)
 *
 * See `TNode.insertBeforeIndex` for more context.
 *
 * @param previousTNodes A list of previous TNodes so that we can easily traverse `TNode`s in
 *     reverse order. (If `TNode` would have `previous` this would not be necessary.)
 * @param newTNode A TNode to add to the `previousTNodes` list.
 */
export function addTNodeAndUpdateInsertBeforeIndex(previousTNodes: TNode[], newTNode: TNode) {
  // Start with Rule1
  ngDevMode &&
    assertEqual(newTNode.insertBeforeIndex, null, 'We expect that insertBeforeIndex is not set');

  previousTNodes.push(newTNode);
  if (previousTNodes.length > 1) {
    for (let i = previousTNodes.length - 2; i >= 0; i--) {
      const existingTNode = previousTNodes[i];
      // Text nodes are created eagerly and so they don't need their `indexBeforeIndex` updated.
      // It is safe to ignore them.
      if (!isI18nText(existingTNode)) {
        if (
          isNewTNodeCreatedBefore(existingTNode, newTNode) &&
          getInsertBeforeIndex(existingTNode) === null
        ) {
          // If it was created before us in time, (and it does not yet have `insertBeforeIndex`)
          // then add the `insertBeforeIndex`.
          setInsertBeforeIndex(existingTNode, newTNode.index);
        }
      }
    }
  }
}

function isI18nText(tNode: TNode): boolean {
  return !(tNode.type & TNodeType.Placeholder);
}

function isNewTNodeCreatedBefore(existingTNode: TNode, newTNode: TNode): boolean {
  return isI18nText(newTNode) || existingTNode.index > newTNode.index;
}

function getInsertBeforeIndex(tNode: TNode): number | null {
  const index = tNode.insertBeforeIndex;
  return Array.isArray(index) ? index[0] : index;
}

function setInsertBeforeIndex(tNode: TNode, value: number): void {
  const index = tNode.insertBeforeIndex;
  if (Array.isArray(index)) {
    // Array is stored if we have to insert child nodes. See `TNode.insertBeforeIndex`
    index[0] = value;
  } else {
    setI18nHandling(getInsertInFrontOfRNodeWithI18n, processI18nInsertBefore);
    tNode.insertBeforeIndex = value;
  }
}
