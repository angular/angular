/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {absoluteFrom, absoluteFromSourceFile, AbsoluteFsPath} from '../../file_system';
import {PerfEvent, PerfPhase, PerfRecorder} from '../../perf';
import {ClassDeclaration} from '../../reflection';
import {ClassRecord, TraitCompiler} from '../../transform';
import {FileTypeCheckingData} from '../../typecheck/src/checker';
import {IncrementalBuild} from '../api';
import {SemanticDepGraph, SemanticDepGraphUpdater} from '../semantic_graph';

import {FileDependencyGraph} from './dependency_tracking';

/**
 * Drives an incremental build, by tracking changes and determining which files need to be emitted.
 */
export class IncrementalDriver implements IncrementalBuild<ClassRecord, FileTypeCheckingData> {
  /**
   * State of the current build.
   *
   * This transitions as the compilation progresses.
   */
  private state: BuildState;

  private constructor(
      state: PendingBuildState, readonly depGraph: FileDependencyGraph,
      private logicalChanges: Set<string>|null) {
    this.state = state;
  }

  /**
   * Construct an `IncrementalDriver` with a starting state that incorporates the results of a
   * previous build.
   *
   * The previous build's `BuildState` is reconciled with the new program's changes, and the results
   * are merged into the new build's `PendingBuildState`.
   */
  static reconcile(
      oldProgram: ts.Program, oldDriver: IncrementalDriver, newProgram: ts.Program,
      modifiedResourceFiles: Set<string>|null, perf: PerfRecorder): IncrementalDriver {
    return perf.inPhase(PerfPhase.Reconciliation, () => {
      // Initialize the state of the current build based on the previous one.
      let state: PendingBuildState;
      if (oldDriver.state.kind === BuildStateKind.Pending) {
        // The previous build never made it past the pending state. Reuse it as the starting state
        // for this build.
        state = oldDriver.state;
      } else {
        let priorGraph: SemanticDepGraph|null = null;
        if (oldDriver.state.lastGood !== null) {
          priorGraph = oldDriver.state.lastGood.semanticDepGraph;
        }

        // The previous build was successfully analyzed. `pendingEmit` is the only state carried
        // forward into this build.
        state = {
          kind: BuildStateKind.Pending,
          pendingEmit: oldDriver.state.pendingEmit,
          pendingTypeCheckEmit: oldDriver.state.pendingTypeCheckEmit,
          changedResourcePaths: new Set<AbsoluteFsPath>(),
          changedTsPaths: new Set<string>(),
          lastGood: oldDriver.state.lastGood,
          semanticDepGraphUpdater: new SemanticDepGraphUpdater(priorGraph),
        };
      }

      // Merge the freshly modified resource files with any prior ones.
      if (modifiedResourceFiles !== null) {
        for (const resFile of modifiedResourceFiles) {
          state.changedResourcePaths.add(absoluteFrom(resFile));
        }
      }

      // Next, process the files in the new program, with a couple of goals:
      // 1) Determine which TS files have changed, if any, and merge them into `changedTsFiles`.
      // 2) Produce a list of TS files which no longer exist in the program (they've been deleted
      //    since the previous compilation). These need to be removed from the state tracking to
      //    avoid leaking memory.

      // All files in the old program, for easy detection of changes.
      const oldFiles = new Set<ts.SourceFile>(oldProgram.getSourceFiles());

      // Assume all the old files were deleted to begin with. Only TS files are tracked.
      const deletedTsPaths = new Set<string>(tsOnlyFiles(oldProgram).map(sf => sf.fileName));

      for (const newFile of newProgram.getSourceFiles()) {
        if (!newFile.isDeclarationFile) {
          // This file exists in the new program, so remove it from `deletedTsPaths`.
          deletedTsPaths.delete(newFile.fileName);
        }

        if (oldFiles.has(newFile)) {
          // This file hasn't changed; no need to look at it further.
          continue;
        }

        // The file has changed since the last successful build. The appropriate reaction depends on
        // what kind of file it is.
        if (!newFile.isDeclarationFile) {
          // It's a .ts file, so track it as a change.
          state.changedTsPaths.add(newFile.fileName);
        } else {
          // It's a .d.ts file. Currently the compiler does not do a great job of tracking
          // dependencies on .d.ts files, so bail out of incremental builds here and do a full
          // build. This usually only happens if something in node_modules changes.
          return IncrementalDriver.fresh(newProgram);
        }
      }

      // The next step is to remove any deleted files from the state.
      for (const filePath of deletedTsPaths) {
        state.pendingEmit.delete(filePath);
        state.pendingTypeCheckEmit.delete(filePath);

        // Even if the file doesn't exist in the current compilation, it still might have been
        // changed in a previous one, so delete it from the set of changed TS files, just in case.
        state.changedTsPaths.delete(filePath);
      }

      perf.eventCount(PerfEvent.SourceFilePhysicalChange, state.changedTsPaths.size);

      // Now, changedTsPaths contains physically changed TS paths. Use the previous program's
      // logical dependency graph to determine logically changed files.
      const depGraph = new FileDependencyGraph();

      // If a previous compilation exists, use its dependency graph to determine the set of
      // logically changed files.
      let logicalChanges: Set<string>|null = null;
      if (state.lastGood !== null) {
        // Extract the set of logically changed files. At the same time, this operation populates
        // the current (fresh) dependency graph with information about those files which have not
        // logically changed.
        logicalChanges = depGraph.updateWithPhysicalChanges(
            state.lastGood.depGraph, state.changedTsPaths, deletedTsPaths,
            state.changedResourcePaths);
        perf.eventCount(PerfEvent.SourceFileLogicalChange, logicalChanges.size);
        for (const fileName of state.changedTsPaths) {
          logicalChanges.add(fileName);
        }

        // Any logically changed files need to be re-emitted. Most of the time this would happen
        // regardless because the new dependency graph would _also_ identify the file as stale.
        // However there are edge cases such as removing a component from an NgModule without adding
        // it to another one, where the previous graph identifies the file as logically changed, but
        // the new graph (which does not have that edge) fails to identify that the file should be
        // re-emitted.
        for (const change of logicalChanges) {
          state.pendingEmit.add(change);
          state.pendingTypeCheckEmit.add(change);
        }
      }

      // `state` now reflects the initial pending state of the current compilation.
      return new IncrementalDriver(state, depGraph, logicalChanges);
    });
  }

  static fresh(program: ts.Program): IncrementalDriver {
    // Initialize the set of files which need to be emitted to the set of all TS files in the
    // program.
    const tsFiles = tsOnlyFiles(program);

    const state: PendingBuildState = {
      kind: BuildStateKind.Pending,
      pendingEmit: new Set<string>(tsFiles.map(sf => sf.fileName)),
      pendingTypeCheckEmit: new Set<string>(tsFiles.map(sf => sf.fileName)),
      changedResourcePaths: new Set<AbsoluteFsPath>(),
      changedTsPaths: new Set<string>(),
      lastGood: null,
      semanticDepGraphUpdater: new SemanticDepGraphUpdater(/* priorGraph */ null),
    };

    return new IncrementalDriver(state, new FileDependencyGraph(), /* logicalChanges */ null);
  }

  getSemanticDepGraphUpdater(): SemanticDepGraphUpdater {
    if (this.state.kind !== BuildStateKind.Pending) {
      throw new Error('Semantic dependency updater is only available when pending analysis');
    }
    return this.state.semanticDepGraphUpdater;
  }

  recordSuccessfulAnalysis(traitCompiler: TraitCompiler): void {
    if (this.state.kind !== BuildStateKind.Pending) {
      // Changes have already been incorporated.
      return;
    }

    const {needsEmit, needsTypeCheckEmit, newGraph} = this.state.semanticDepGraphUpdater.finalize();

    const pendingEmit = this.state.pendingEmit;
    for (const path of needsEmit) {
      pendingEmit.add(path);
    }

    const pendingTypeCheckEmit = this.state.pendingTypeCheckEmit;
    for (const path of needsTypeCheckEmit) {
      pendingTypeCheckEmit.add(path);
    }

    // Update the state to an `AnalyzedBuildState`.
    this.state = {
      kind: BuildStateKind.Analyzed,
      pendingEmit,
      pendingTypeCheckEmit,

      // Since this compilation was successfully analyzed, update the "last good" artifacts to the
      // ones from the current compilation.
      lastGood: {
        depGraph: this.depGraph,
        semanticDepGraph: newGraph,
        traitCompiler: traitCompiler,
        typeCheckingResults: null,
      },

      priorTypeCheckingResults:
          this.state.lastGood !== null ? this.state.lastGood.typeCheckingResults : null,
    };
  }

  recordSuccessfulTypeCheck(results: Map<AbsoluteFsPath, FileTypeCheckingData>): void {
    if (this.state.lastGood === null || this.state.kind !== BuildStateKind.Analyzed) {
      return;
    }
    this.state.lastGood.typeCheckingResults = results;

    // Delete the files for which type-check code was generated from the set of pending type-check
    // files.
    for (const fileName of results.keys()) {
      this.state.pendingTypeCheckEmit.delete(fileName);
    }
  }

  recordSuccessfulEmit(sf: ts.SourceFile): void {
    this.state.pendingEmit.delete(sf.fileName);
  }

  safeToSkipEmit(sf: ts.SourceFile): boolean {
    return !this.state.pendingEmit.has(sf.fileName);
  }

  priorWorkFor(sf: ts.SourceFile): ClassRecord[]|null {
    if (this.state.lastGood === null || this.logicalChanges === null) {
      // There is no previous good build, so no prior work exists.
      return null;
    } else if (this.logicalChanges.has(sf.fileName)) {
      // Prior work might exist, but would be stale as the file in question has logically changed.
      return null;
    } else {
      // Prior work might exist, and if it does then it's usable!
      return this.state.lastGood.traitCompiler.recordsFor(sf);
    }
  }

  priorTypeCheckingResultsFor(sf: ts.SourceFile): FileTypeCheckingData|null {
    if (this.state.kind !== BuildStateKind.Analyzed ||
        this.state.priorTypeCheckingResults === null || this.logicalChanges === null) {
      return null;
    }

    if (this.logicalChanges.has(sf.fileName) || this.state.pendingTypeCheckEmit.has(sf.fileName)) {
      return null;
    }

    const fileName = absoluteFromSourceFile(sf);
    if (!this.state.priorTypeCheckingResults.has(fileName)) {
      return null;
    }
    const data = this.state.priorTypeCheckingResults.get(fileName)!;
    if (data.hasInlines) {
      return null;
    }

    return data;
  }
}

type BuildState = PendingBuildState|AnalyzedBuildState;

enum BuildStateKind {
  Pending,
  Analyzed,
}

interface BaseBuildState {
  kind: BuildStateKind;

  /**
   * The heart of incremental builds. This `Set` tracks the set of files which need to be emitted
   * during the current compilation.
   *
   * This starts out as the set of files which are still pending from the previous program (or the
   * full set of .ts files on a fresh build).
   *
   * After analysis, it's updated to include any files which might have changed and need a re-emit
   * as a result of incremental changes.
   *
   * If an emit happens, any written files are removed from the `Set`, as they're no longer
   * pending.
   *
   * Thus, after compilation `pendingEmit` should be empty (on a successful build) or contain the
   * files which still need to be emitted but have not yet been (due to errors).
   *
   * `pendingEmit` is tracked as as `Set<string>` instead of a `Set<ts.SourceFile>`, because the
   * contents of the file are not important here, only whether or not the current version of it
   * needs to be emitted. The `string`s here are TS file paths.
   *
   * See the README.md for more information on this algorithm.
   */
  pendingEmit: Set<string>;

  /**
   * Similar to `pendingEmit`, but then for representing the set of files for which the type-check
   * file should be regenerated. It behaves identically with respect to errored compilations as
   * `pendingEmit`.
   */
  pendingTypeCheckEmit: Set<string>;


  /**
   * Specific aspects of the last compilation which successfully completed analysis, if any.
   */
  lastGood: {
    /**
     * The dependency graph from the last successfully analyzed build.
     *
     * This is used to determine the logical impact of physical file changes.
     */
    depGraph: FileDependencyGraph;

    /**
     * The semantic dependency graph from the last successfully analyzed build.
     *
     * This is used to perform in-depth comparison of Angular decorated classes, to determine
     * which files have to be re-emitted and/or re-type-checked.
     */
    semanticDepGraph: SemanticDepGraph;

    /**
     * The `TraitCompiler` from the last successfully analyzed build.
     *
     * This is used to extract "prior work" which might be reusable in this compilation.
     */
    traitCompiler: TraitCompiler;

    /**
     * Type checking results which will be passed onto the next build.
     */
    typeCheckingResults: Map<AbsoluteFsPath, FileTypeCheckingData>| null;
  }|null;
}

/**
 * State of a build before the Angular analysis phase completes.
 */
interface PendingBuildState extends BaseBuildState {
  kind: BuildStateKind.Pending;

  /**
   * Set of files which are known to need an emit.
   *
   * Before the compiler's analysis phase completes, `pendingEmit` only contains files that were
   * still pending after the previous build.
   */
  pendingEmit: Set<string>;

  /**
   * Set of TypeScript file paths which have changed since the last successfully analyzed build.
   */
  changedTsPaths: Set<string>;

  /**
   * Set of resource file paths which have changed since the last successfully analyzed build.
   */
  changedResourcePaths: Set<AbsoluteFsPath>;

  /**
   * In a pending state, the semantic dependency graph is available to the compilation to register
   * the incremental symbols into.
   */
  semanticDepGraphUpdater: SemanticDepGraphUpdater;
}

interface AnalyzedBuildState extends BaseBuildState {
  kind: BuildStateKind.Analyzed;

  /**
   * Set of files which are known to need an emit.
   *
   * After analysis completes (that is, the state transitions to `AnalyzedBuildState`), the
   * `pendingEmit` set takes into account any on-disk changes made since the last successfully
   * analyzed build.
   */
  pendingEmit: Set<string>;

  /**
   * Type checking results from the previous compilation, which can be reused in this one.
   */
  priorTypeCheckingResults: Map<AbsoluteFsPath, FileTypeCheckingData>|null;
}

function tsOnlyFiles(program: ts.Program): ReadonlyArray<ts.SourceFile> {
  return program.getSourceFiles().filter(sf => !sf.isDeclarationFile);
}
