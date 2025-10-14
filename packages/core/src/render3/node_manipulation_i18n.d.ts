/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { TNode } from './interfaces/node';
import { Renderer } from './interfaces/renderer';
import { RElement, RNode } from './interfaces/renderer_dom';
import { LView } from './interfaces/view';
/**
 * Find a node in front of which `currentTNode` should be inserted (takes i18n into account).
 *
 * This method determines the `RNode` in front of which we should insert the `currentRNode`. This
 * takes `TNode.insertBeforeIndex` into account.
 *
 * @param parentTNode parent `TNode`
 * @param currentTNode current `TNode` (The node which we would like to insert into the DOM)
 * @param lView current `LView`
 */
export declare function getInsertInFrontOfRNodeWithI18n(parentTNode: TNode, currentTNode: TNode, lView: LView): RNode | null;
/**
 * Process `TNode.insertBeforeIndex` by adding i18n text nodes.
 *
 * See `TNode.insertBeforeIndex`
 */
export declare function processI18nInsertBefore(renderer: Renderer, childTNode: TNode, lView: LView, childRNode: RNode | RNode[], parentRElement: RElement | null): void;
