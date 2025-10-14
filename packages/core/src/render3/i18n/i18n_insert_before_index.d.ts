/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { TNode } from '../interfaces/node';
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
export declare function addTNodeAndUpdateInsertBeforeIndex(previousTNodes: TNode[], newTNode: TNode): void;
