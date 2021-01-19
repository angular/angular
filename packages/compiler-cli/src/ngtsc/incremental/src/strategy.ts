/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';
import {IncrementalDriver} from './state';

/**
 * Strategy used to manage the association between a `ts.Program` and the `IncrementalDriver` which
 * represents the reusable Angular part of its compilation.
 */
export interface IncrementalBuildStrategy {
  /**
   * Determine the Angular `IncrementalDriver` for the given `ts.Program`, if one is available.
   */
  getIncrementalDriver(program: ts.Program): IncrementalDriver|null;

  /**
   * Associate the given `IncrementalDriver` with the given `ts.Program` and make it available to
   * future compilations.
   */
  setIncrementalDriver(driver: IncrementalDriver, program: ts.Program): void;

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
  getIncrementalDriver(): null {
    return null;
  }

  setIncrementalDriver(): void {}

  toNextBuildStrategy(): IncrementalBuildStrategy {
    return this;
  }
}

/**
 * Tracks an `IncrementalDriver` within the strategy itself.
 */
export class TrackedIncrementalBuildStrategy implements IncrementalBuildStrategy {
  private driver: IncrementalDriver|null = null;
  private isSet: boolean = false;

  getIncrementalDriver(): IncrementalDriver|null {
    return this.driver;
  }

  setIncrementalDriver(driver: IncrementalDriver): void {
    this.driver = driver;
    this.isSet = true;
  }

  toNextBuildStrategy(): TrackedIncrementalBuildStrategy {
    const strategy = new TrackedIncrementalBuildStrategy();
    // Only reuse a driver that was explicitly set via `setIncrementalDriver`.
    strategy.driver = this.isSet ? this.driver : null;
    return strategy;
  }
}

/**
 * Manages the `IncrementalDriver` associated with a `ts.Program` by monkey-patching it onto the
 * program under `SYM_INCREMENTAL_DRIVER`.
 */
export class PatchedProgramIncrementalBuildStrategy implements IncrementalBuildStrategy {
  getIncrementalDriver(program: ts.Program): IncrementalDriver|null {
    const driver = (program as any)[SYM_INCREMENTAL_DRIVER];
    if (driver === undefined || !(driver instanceof IncrementalDriver)) {
      return null;
    }
    return driver;
  }

  setIncrementalDriver(driver: IncrementalDriver, program: ts.Program): void {
    (program as any)[SYM_INCREMENTAL_DRIVER] = driver;
  }

  toNextBuildStrategy(): IncrementalBuildStrategy {
    return this;
  }
}


/**
 * Symbol under which the `IncrementalDriver` is stored on a `ts.Program`.
 *
 * The TS model of incremental compilation is based around reuse of a previous `ts.Program` in the
 * construction of a new one. The `NgCompiler` follows this abstraction - passing in a previous
 * `ts.Program` is sufficient to trigger incremental compilation. This previous `ts.Program` need
 * not be from an Angular compilation (that is, it need not have been created from `NgCompiler`).
 *
 * If it is, though, Angular can benefit from reusing previous analysis work. This reuse is managed
 * by the `IncrementalDriver`, which is inherited from the old program to the new program. To
 * support this behind the API of passing an old `ts.Program`, the `IncrementalDriver` is stored on
 * the `ts.Program` under this symbol.
 */
const SYM_INCREMENTAL_DRIVER = Symbol('NgIncrementalDriver');
