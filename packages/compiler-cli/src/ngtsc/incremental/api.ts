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
 * `AnalysisT` is a generic type representing a unit of work. This is generic to avoid a cyclic
 * dependency between the incremental engine API definition and its consumer(s).
 * `FileTypeCheckDataT` is a generic type representing template type-checking data for a particular
 * input file, which is generic for the same reason.
 */
export interface IncrementalBuild<AnalysisT, FileTypeCheckDataT> {
  /**
   * Retrieve the prior analysis work, if any, done for the given source file.
   */
  priorAnalysisFor(sf: ts.SourceFile): AnalysisT[]|null;

  /**
   * Retrieve the prior type-checking work, if any, that's been done for the given source file.
   */
  priorTypeCheckingResultsFor(fileSf: ts.SourceFile): FileTypeCheckDataT|null;

  /**
   * Reports that template type-checking has completed successfully, with a map of type-checking
   * data for each user file which can be reused in a future incremental iteration.
   */
  recordSuccessfulTypeCheck(results: Map<AbsoluteFsPath, FileTypeCheckDataT>): void;
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
   * Record that the given file contains unresolvable dependencies.
   *
   * In practice, this means that the dependency graph cannot provide insight into the effects of
   * future changes on that file.
   */
  recordDependencyAnalysisFailure(file: T): void;
}
