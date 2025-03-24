/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {IncrementalState} from './state';

/**
 * Strategy used to manage the association between a `ts.Program` and the `IncrementalState` which
 * represents the reusable Angular part of its compilation.
 */
export interface IncrementalBuildStrategy {
  /**
   * Determine the Angular `IncrementalState` for the given `ts.Program`, if one is available.
   */
  getIncrementalState(program: ts.Program): IncrementalState | null;

  /**
   * Associate the given `IncrementalState` with the given `ts.Program` and make it available to
   * future compilations.
   */
  setIncrementalState(driver: IncrementalState, program: ts.Program): void;

  /**
   * Convert this `IncrementalBuildStrategy` into a possibly new instance to be used in the next
   * incremental compilation (may be a no-op if the strategy is not stateful).
   */
  toNextBuildStrategy(): IncrementalBuildStrategy;
}

/**
 * A noop implementation of `IncrementalBuildStrategy` which neither returns nor tracks any
 * incremental data.
 */
export class NoopIncrementalBuildStrategy implements IncrementalBuildStrategy {
  getIncrementalState(): null {
    return null;
  }

  setIncrementalState(): void {}

  toNextBuildStrategy(): IncrementalBuildStrategy {
    return this;
  }
}

/**
 * Tracks an `IncrementalState` within the strategy itself.
 */
export class TrackedIncrementalBuildStrategy implements IncrementalBuildStrategy {
  private state: IncrementalState | null = null;
  private isSet: boolean = false;

  getIncrementalState(): IncrementalState | null {
    return this.state;
  }

  setIncrementalState(state: IncrementalState): void {
    this.state = state;
    this.isSet = true;
  }

  toNextBuildStrategy(): TrackedIncrementalBuildStrategy {
    const strategy = new TrackedIncrementalBuildStrategy();
    // Only reuse state that was explicitly set via `setIncrementalState`.
    strategy.state = this.isSet ? this.state : null;
    return strategy;
  }
}

/**
 * Manages the `IncrementalState` associated with a `ts.Program` by monkey-patching it onto the
 * program under `SYM_INCREMENTAL_STATE`.
 */
export class PatchedProgramIncrementalBuildStrategy implements IncrementalBuildStrategy {
  getIncrementalState(program: ts.Program): IncrementalState | null {
    const state = (program as MayHaveIncrementalState)[SYM_INCREMENTAL_STATE];
    if (state === undefined) {
      return null;
    }
    return state;
  }

  setIncrementalState(state: IncrementalState, program: ts.Program): void {
    (program as MayHaveIncrementalState)[SYM_INCREMENTAL_STATE] = state;
  }

  toNextBuildStrategy(): IncrementalBuildStrategy {
    return this;
  }
}

/**
 * Symbol under which the `IncrementalState` is stored on a `ts.Program`.
 *
 * The TS model of incremental compilation is based around reuse of a previous `ts.Program` in the
 * construction of a new one. The `NgCompiler` follows this abstraction - passing in a previous
 * `ts.Program` is sufficient to trigger incremental compilation. This previous `ts.Program` need
 * not be from an Angular compilation (that is, it need not have been created from `NgCompiler`).
 *
 * If it is, though, Angular can benefit from reusing previous analysis work. This reuse is managed
 * by the `IncrementalState`, which is inherited from the old program to the new program. To
 * support this behind the API of passing an old `ts.Program`, the `IncrementalState` is stored on
 * the `ts.Program` under this symbol.
 */
const SYM_INCREMENTAL_STATE = Symbol('NgIncrementalState');

interface MayHaveIncrementalState {
  [SYM_INCREMENTAL_STATE]?: IncrementalState;
}
