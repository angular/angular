/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {assertIndexInDeclRange} from '../render3/assert';
import {DependencyDef} from '../render3/interfaces/definition';
import {TContainerNode, TNode} from '../render3/interfaces/node';
import {HEADER_OFFSET, LView, TVIEW, TView} from '../render3/interfaces/view';
import {getTNode} from '../render3/util/view_utils';
import {assertEqual, throwError} from '../util/assert';

import {
  DeferBlockState,
  DeferDependenciesLoadingState,
  LDeferBlockDetails,
  LOADING_AFTER_SLOT,
  MINIMUM_SLOT,
  TDeferBlockDetails,
} from './interfaces';

/**
 * Calculates a data slot index for defer block info (either static or
 * instance-specific), given an index of a defer instruction.
 */
export function getDeferBlockDataIndex(deferBlockIndex: number) {
  // Instance state is located at the *next* position
  // after the defer block slot in an LView or TView.data.
  return deferBlockIndex + 1;
}

/** Retrieves a defer block state from an LView, given a TNode that represents a block. */
export function getLDeferBlockDetails(lView: LView, tNode: TNode): LDeferBlockDetails {
  const tView = lView[TVIEW];
  const slotIndex = getDeferBlockDataIndex(tNode.index);
  ngDevMode && assertIndexInDeclRange(tView, slotIndex);
  return lView[slotIndex];
}

/** Stores a defer block instance state in LView. */
export function setLDeferBlockDetails(
  lView: LView,
  deferBlockIndex: number,
  lDetails: LDeferBlockDetails,
) {
  const tView = lView[TVIEW];
  const slotIndex = getDeferBlockDataIndex(deferBlockIndex);
  ngDevMode && assertIndexInDeclRange(tView, slotIndex);
  lView[slotIndex] = lDetails;
}

/** Retrieves static info about a defer block, given a TView and a TNode that represents a block. */
export function getTDeferBlockDetails(tView: TView, tNode: TNode): TDeferBlockDetails {
  const slotIndex = getDeferBlockDataIndex(tNode.index);
  ngDevMode && assertIndexInDeclRange(tView, slotIndex);
  return tView.data[slotIndex] as TDeferBlockDetails;
}

/** Stores a defer block static info in `TView.data`. */
export function setTDeferBlockDetails(
  tView: TView,
  deferBlockIndex: number,
  deferBlockConfig: TDeferBlockDetails,
) {
  const slotIndex = getDeferBlockDataIndex(deferBlockIndex);
  ngDevMode && assertIndexInDeclRange(tView, slotIndex);
  tView.data[slotIndex] = deferBlockConfig;
}

export function getTemplateIndexForState(
  newState: DeferBlockState,
  hostLView: LView,
  tNode: TNode,
): number | null {
  const tView = hostLView[TVIEW];
  const tDetails = getTDeferBlockDetails(tView, tNode);

  switch (newState) {
    case DeferBlockState.Complete:
      return tDetails.primaryTmplIndex;
    case DeferBlockState.Loading:
      return tDetails.loadingTmplIndex;
    case DeferBlockState.Error:
      return tDetails.errorTmplIndex;
    case DeferBlockState.Placeholder:
      return tDetails.placeholderTmplIndex;
    default:
      ngDevMode && throwError(`Unexpected defer block state: ${newState}`);
      return null;
  }
}

/**
 * Returns a minimum amount of time that a given state should be rendered for,
 * taking into account `minimum` parameter value. If the `minimum` value is
 * not specified - returns `null`.
 */
export function getMinimumDurationForState(
  tDetails: TDeferBlockDetails,
  currentState: DeferBlockState,
): number | null {
  if (currentState === DeferBlockState.Placeholder) {
    return tDetails.placeholderBlockConfig?.[MINIMUM_SLOT] ?? null;
  } else if (currentState === DeferBlockState.Loading) {
    return tDetails.loadingBlockConfig?.[MINIMUM_SLOT] ?? null;
  }
  return null;
}

/** Retrieves the value of the `after` parameter on the @loading block. */
export function getLoadingBlockAfter(tDetails: TDeferBlockDetails): number | null {
  return tDetails.loadingBlockConfig?.[LOADING_AFTER_SLOT] ?? null;
}

/**
 * Adds downloaded dependencies into a directive or a pipe registry,
 * making sure that a dependency doesn't yet exist in the registry.
 */
export function addDepsToRegistry<T extends DependencyDef[]>(currentDeps: T | null, newDeps: T): T {
  if (!currentDeps || currentDeps.length === 0) {
    return newDeps;
  }

  const currentDepSet = new Set(currentDeps);
  for (const dep of newDeps) {
    currentDepSet.add(dep);
  }

  // If `currentDeps` is the same length, there were no new deps and can
  // return the original array.
  return currentDeps.length === currentDepSet.size ? currentDeps : (Array.from(currentDepSet) as T);
}

/** Retrieves a TNode that represents main content of a defer block. */
export function getPrimaryBlockTNode(tView: TView, tDetails: TDeferBlockDetails): TContainerNode {
  const adjustedIndex = tDetails.primaryTmplIndex + HEADER_OFFSET;
  return getTNode(tView, adjustedIndex) as TContainerNode;
}

/**
 * Asserts whether all dependencies for a defer block are loaded.
 * Always run this function (in dev mode) before rendering a defer
 * block in completed state.
 */
export function assertDeferredDependenciesLoaded(tDetails: TDeferBlockDetails) {
  assertEqual(
    tDetails.loadingState,
    DeferDependenciesLoadingState.COMPLETE,
    'Expecting all deferred dependencies to be loaded.',
  );
}

/**
 * Determines if a given value matches the expected structure of a defer block
 *
 * We can safely rely on the primaryTmplIndex because every defer block requires
 * that a primary template exists. All the other template options are optional.
 */
export function isTDeferBlockDetails(value: unknown): value is TDeferBlockDetails {
  return (
    value !== null &&
    typeof value === 'object' &&
    typeof (value as TDeferBlockDetails).primaryTmplIndex === 'number'
  );
}

/**
 * Whether a given TNode represents a defer block.
 */
export function isDeferBlock(tView: TView, tNode: TNode): boolean {
  let tDetails: TDeferBlockDetails | null = null;
  const slotIndex = getDeferBlockDataIndex(tNode.index);
  // Check if a slot index is in the reasonable range.
  // Note: we do `-1` on the right border, since defer block details are stored
  // in the `n+1` slot, see `getDeferBlockDataIndex` for more info.
  if (HEADER_OFFSET < slotIndex && slotIndex < tView.bindingStartIndex) {
    tDetails = getTDeferBlockDetails(tView, tNode);
  }
  return !!tDetails && isTDeferBlockDetails(tDetails);
}

/**
 * Tracks debugging information about a trigger.
 * @param tView TView in which the trigger is declared.
 * @param tNode TNode on which the trigger is declared.
 * @param textRepresentation Text representation of the trigger to be used for debugging purposes.
 */
export function trackTriggerForDebugging(tView: TView, tNode: TNode, textRepresentation: string) {
  const tDetails = getTDeferBlockDetails(tView, tNode);
  tDetails.debug ??= {};
  tDetails.debug.triggers ??= new Set();
  tDetails.debug.triggers.add(textRepresentation);
}
