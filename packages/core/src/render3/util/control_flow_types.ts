/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TrackByFunction} from '../../change_detection';
import {LView, TView} from '../interfaces/view';
import {LiveCollection} from '../list_reconciliation';

export enum ControlFlowBlockType {
  Defer,
  For,
}

export interface ControlFlowBlockDataBase {
  /** The comment host/container node next to which all of the root nodes are rendered. */
  hostNode: Node;

  /** Element root nodes that are currently being shown in the block. */
  rootNodes: Node[];
}

/** Retrieved information about a `@defer` block. */
export interface DeferBlockData extends ControlFlowBlockDataBase {
  type: ControlFlowBlockType.Defer;

  /** Current state of the block. */
  state: 'placeholder' | 'loading' | 'complete' | 'error' | 'initial';

  /** Hydration state of the block. */
  incrementalHydrationState: 'not-configured' | 'hydrated' | 'dehydrated';

  /** Wherther the block has a connected `@error` block. */
  hasErrorBlock: boolean;

  /** Information about the connected `@loading` block. */
  loadingBlock: {
    /** Whether the block is defined. */
    exists: boolean;

    /** Minimum amount of milliseconds that the block should be shown. */
    minimumTime: number | null;

    /** Amount of time after which the block should be shown. */
    afterTime: number | null;
  };

  /** Information about the connected `@placeholder` block. */
  placeholderBlock: {
    /** Whether the block is defined. */
    exists: boolean;

    /** Minimum amount of time that block should be shown. */
    minimumTime: number | null;
  };

  /** Stringified version of the block's triggers. */
  triggers: string[];
}

/** Retrieved information about a `@for` block. */
export interface ForLoopBlockData extends ControlFlowBlockDataBase {
  type: ControlFlowBlockType.For;

  /** A list of items managed by the for loop. */
  items: unknown[];

  /** Whether the block has an `@empty` block. */
  hasEmptyBlock: boolean;

  /** String representation of the trackBy expression. */
  trackExpression: string;
}

/**
 * A control flow block information object.
 */
export type ControlFlowBlock = DeferBlockData | ForLoopBlockData;

/**
 * A configuration object passed to a `ControlFlowBlockViewFinder` function.
 */
export interface ControlFlowBlockViewFinderConfig {
  node: Node;
  lView: LView;
  tView: TView;
  slotIdx: number;
}

/**
 * Describes a finder function that extracts `ControlFlowBlock`s from an LView.
 */
export type ControlFlowBlockViewFinder = (
  config: ControlFlowBlockViewFinderConfig,
) => ControlFlowBlock | null;
