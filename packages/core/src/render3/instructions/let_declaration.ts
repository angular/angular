/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {RuntimeError, RuntimeErrorCode} from '../../errors';
import {performanceMarkFeature} from '../../util/performance';
import {TNodeType} from '../interfaces/node';
import {HEADER_OFFSET} from '../interfaces/view';
import {getContextLView, getLView, getSelectedIndex, getTView, setCurrentTNode} from '../state';
import {getOrCreateTNode} from '../tnode_manipulation';
import {load, store} from '../util/view_utils';

/** Object that indicates the value of a `@let` declaration that hasn't been initialized yet. */
const UNINITIALIZED_LET = {};

/**
 * Declares an `@let` at a specific data slot. Returns itself to allow chaining.
 *
 * @param index Index at which to declare the `@let`.
 *
 * @codeGenApi
 */
export function ɵɵdeclareLet(index: number): typeof ɵɵdeclareLet {
  const tView = getTView();
  const lView = getLView();
  const adjustedIndex = index + HEADER_OFFSET;
  const tNode = getOrCreateTNode(tView, adjustedIndex, TNodeType.LetDeclaration, null, null);
  setCurrentTNode(tNode, false);
  store(tView, lView, adjustedIndex, UNINITIALIZED_LET);
  return ɵɵdeclareLet;
}

/**
 * Instruction that stores the value of a `@let` declaration on the current view.
 * Returns the value to allow usage inside variable initializers.
 *
 * @codeGenApi
 */
export function ɵɵstoreLet<T>(value: T): T {
  performanceMarkFeature('NgLet');
  const tView = getTView();
  const lView = getLView();
  const index = getSelectedIndex();
  store(tView, lView, index, value);
  return value;
}

/**
 * Retrieves the value of a `@let` declaration defined in a parent view.
 *
 * @param index Index of the declaration within the view.
 *
 * @codeGenApi
 */
export function ɵɵreadContextLet<T>(index: number): T {
  const contextLView = getContextLView();
  const value = load<T>(contextLView, HEADER_OFFSET + index);

  if (value === UNINITIALIZED_LET) {
    throw new RuntimeError(
      RuntimeErrorCode.UNINITIALIZED_LET_ACCESS,
      ngDevMode && 'Attempting to access a @let declaration whose value is not available yet',
    );
  }

  return value;
}
