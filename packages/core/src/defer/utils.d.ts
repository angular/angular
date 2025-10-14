/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { DependencyDef } from '../render3/interfaces/definition';
import { TContainerNode, TNode } from '../render3/interfaces/node';
import { LView, TView } from '../render3/interfaces/view';
import { DeferBlockState, LDeferBlockDetails, TDeferBlockDetails } from './interfaces';
/**
 * Calculates a data slot index for defer block info (either static or
 * instance-specific), given an index of a defer instruction.
 */
export declare function getDeferBlockDataIndex(deferBlockIndex: number): number;
/** Retrieves a defer block state from an LView, given a TNode that represents a block. */
export declare function getLDeferBlockDetails(lView: LView, tNode: TNode): LDeferBlockDetails;
/** Stores a defer block instance state in LView. */
export declare function setLDeferBlockDetails(lView: LView, deferBlockIndex: number, lDetails: LDeferBlockDetails): void;
/** Retrieves static info about a defer block, given a TView and a TNode that represents a block. */
export declare function getTDeferBlockDetails(tView: TView, tNode: TNode): TDeferBlockDetails;
/** Stores a defer block static info in `TView.data`. */
export declare function setTDeferBlockDetails(tView: TView, deferBlockIndex: number, deferBlockConfig: TDeferBlockDetails): void;
export declare function getTemplateIndexForState(newState: DeferBlockState, hostLView: LView, tNode: TNode): number | null;
/**
 * Returns a minimum amount of time that a given state should be rendered for,
 * taking into account `minimum` parameter value. If the `minimum` value is
 * not specified - returns `null`.
 */
export declare function getMinimumDurationForState(tDetails: TDeferBlockDetails, currentState: DeferBlockState): number | null;
/** Retrieves the value of the `after` parameter on the @loading block. */
export declare function getLoadingBlockAfter(tDetails: TDeferBlockDetails): number | null;
/**
 * Adds downloaded dependencies into a directive or a pipe registry,
 * making sure that a dependency doesn't yet exist in the registry.
 */
export declare function addDepsToRegistry<T extends DependencyDef[]>(currentDeps: T | null, newDeps: T): T;
/** Retrieves a TNode that represents main content of a defer block. */
export declare function getPrimaryBlockTNode(tView: TView, tDetails: TDeferBlockDetails): TContainerNode;
/**
 * Asserts whether all dependencies for a defer block are loaded.
 * Always run this function (in dev mode) before rendering a defer
 * block in completed state.
 */
export declare function assertDeferredDependenciesLoaded(tDetails: TDeferBlockDetails): void;
/**
 * Determines if a given value matches the expected structure of a defer block
 *
 * We can safely rely on the primaryTmplIndex because every defer block requires
 * that a primary template exists. All the other template options are optional.
 */
export declare function isTDeferBlockDetails(value: unknown): value is TDeferBlockDetails;
/**
 * Whether a given TNode represents a defer block.
 */
export declare function isDeferBlock(tView: TView, tNode: TNode): boolean;
/**
 * Tracks debugging information about a trigger.
 * @param tView TView in which the trigger is declared.
 * @param tNode TNode on which the trigger is declared.
 * @param textRepresentation Text representation of the trigger to be used for debugging purposes.
 */
export declare function trackTriggerForDebugging(tView: TView, tNode: TNode, textRepresentation: string): void;
