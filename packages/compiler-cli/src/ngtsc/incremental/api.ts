/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';
import {AbsoluteFsPath} from '../file_system';

/**
 * Interface of the incremental build engine.
 *
 * `W` is a generic type representing a unit of work. This is generic to avoid a cyclic dependency
 * between the incremental engine API definition and its consumer(s).
 * `T` is a generic type representing template type-checking data for a particular file, which is
 * generic for the same reason.
 */
export interface IncrementalBuild<W, T> {
  /**
   * Retrieve the prior analysis work, if any, done for the given source file.
   */
  priorWorkFor(sf: ts.SourceFile): W[]|null;

  /**
   * Retrieve the prior type-checking work, if any, that's been done for the given source file.
   */
  priorTypeCheckingResultsFor(sf: ts.SourceFile): T|null;
}

/**
 * Tracks dependencies between source files or resources in the application.
 */
export interface DependencyTracker<T extends {fileName: string} = ts.SourceFile> {
  /**
   * Record that the file `from` depends on the file `on`.
   */
  addDependency(from: T, on: T): void;

  /**
   * Record that the file `from` depends on the resource file `on`.
   */
  addResourceDependency(from: T, on: AbsoluteFsPath): void;

  /**
   * Record that the file `from` depends on the file `on` as well as `on`'s direct dependencies.
   *
   * This operation is reified immediately, so if future dependencies are added to `on` they will
   * not automatically be added to `from`.
   */
  addTransitiveDependency(from: T, on: T): void;

  /**
   * Record that the file `from` depends on the resource dependencies of `resourcesOf`.
   *
   * This operation is reified immediately, so if future resource dependencies are added to
   * `resourcesOf` they will not automatically be added to `from`.
   */
  addTransitiveResources(from: T, resourcesOf: T): void;
}
