/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {absoluteFromSourceFile, AbsoluteFsPath, resolve} from '../../file_system';
import {PerfPhase, PerfRecorder} from '../../perf';
import {MaybeSourceFileWithOriginalFile, NgOriginalFile} from '../../program_driver';
import {ClassRecord, TraitCompiler} from '../../transform';
import {FileTypeCheckingData} from '../../typecheck';
import {toUnredirectedSourceFile} from '../../util/src/typescript';
import {IncrementalBuild} from '../api';
import {SemanticDepGraphUpdater} from '../semantic_graph';

import {FileDependencyGraph} from './dependency_tracking';
import {AnalyzedIncrementalState, DeltaIncrementalState, IncrementalState, IncrementalStateKind} from './state';

/**
 * Information about the previous compilation being used as a starting point for the current one,
 * including the delta of files which have logically changed and need to be reanalyzed.
 */
interface IncrementalStep {
  priorState: AnalyzedIncrementalState;
  logicallyChangedTsFiles: Set<AbsoluteFsPath>;
}

/**
 * Discriminant of the `Phase` type union.
 */
enum PhaseKind {
  Analysis,
  TypeCheckAndEmit,
}

/**
 * An incremental compilation undergoing analysis, and building a semantic dependency graph.
 */
interface AnalysisPhase {
  kind: PhaseKind.Analysis;
  semanticDepGraphUpdater: SemanticDepGraphUpdater;
}

/**
 * An incremental compilation that completed analysis and is undergoing template type-checking and
 * emit.
 */
interface TypeCheckAndEmitPhase {
  kind: PhaseKind.TypeCheckAndEmit;
  needsEmit: Set<AbsoluteFsPath>;
  needsTypeCheckEmit: Set<AbsoluteFsPath>;
}

/**
 * Represents the current phase of a compilation.
 */
type Phase = AnalysisPhase|TypeCheckAndEmitPhase;

/**
 * Manages the incremental portion of an Angular compilation, allowing for reuse of a prior
 * compilation if available, and producing an output state for reuse of the current compilation in a
 * future one.
 */
export class IncrementalCompilation implements IncrementalBuild<ClassRecord, FileTypeCheckingData> {
  private phase: Phase;

  /**
   * `IncrementalState` of this compilation if it were to be reused in a subsequent incremental
   * compilation at the current moment.
   *
   * Exposed via the `state` read-only getter.
   */
  private _state: IncrementalState;

  private constructor(
      state: IncrementalState, readonly depGraph: FileDependencyGraph,
      private versions: Map<AbsoluteFsPath, string>|null, private step: IncrementalStep|null) {
    this._state = state;

    // The compilation begins in analysis phase.
    this.phase = {
      kind: PhaseKind.Analysis,
      semanticDepGraphUpdater:
          new SemanticDepGraphUpdater(step !== null ? step.priorState.semanticDepGraph : null),
    };
  }

  /**
   * Begin a fresh `IncrementalCompilation`.
   */
  static fresh(program: ts.Program, versions: Map<AbsoluteFsPath, string>|null):
      IncrementalCompilation {
    const state: IncrementalState = {
      kind: IncrementalStateKind.Fresh,
    };
    return new IncrementalCompilation(state, new FileDependencyGraph(), versions, /* reuse */ null);
  }

  static incremental(
      program: ts.Program, newVersions: Map<AbsoluteFsPath, string>|null, oldProgram: ts.Program,
      oldState: IncrementalState, modifiedResourceFiles: Set<AbsoluteFsPath>|null,
      perf: PerfRecorder): IncrementalCompilation {
    return perf.inPhase(PerfPhase.Reconciliation, () => {
      const physicallyChangedTsFiles = new Set<AbsoluteFsPath>();
      const changedResourceFiles = new Set<AbsoluteFsPath>(modifiedResourceFiles ?? []);


      let priorAnalysis: AnalyzedIncrementalState;
      switch (oldState.kind) {
        case IncrementalStateKind.Fresh:
          // Since this line of program has never been successfully analyzed to begin with, treat
          // this as a fresh compilation.
          return IncrementalCompilation.fresh(program, newVersions);
        case IncrementalStateKind.Analyzed:
          // The most recent program was analyzed successfully, so we can use that as our prior
          // state and don't need to consider any other deltas except changes in the most recent
          // program.
          priorAnalysis = oldState;
          break;
        case IncrementalStateKind.Delta:
          // There is an ancestor program which was analyzed successfully and can be used as a
          // starting point, but we need to determine what's changed since that program.
          priorAnalysis = oldState.lastAnalyzedState;
          for (const sfPath of oldState.physicallyChangedTsFiles) {
            physicallyChangedTsFiles.add(sfPath);
          }
          for (const resourcePath of oldState.changedResourceFiles) {
            changedResourceFiles.add(resourcePath);
          }
          break;
      }

      const oldVersions = priorAnalysis.versions;

      const oldFilesArray = oldProgram.getSourceFiles().map(toOriginalSourceFile);
      const oldFiles = new Set(oldFilesArray);
      const deletedTsFiles = new Set(oldFilesArray.map(sf => absoluteFromSourceFile(sf)));

      for (const possiblyRedirectedNewFile of program.getSourceFiles()) {
        const sf = toOriginalSourceFile(possiblyRedirectedNewFile);
        const sfPath = absoluteFromSourceFile(sf);
        // Since we're seeing a file in the incoming program with this name, it can't have been
        // deleted.
        deletedTsFiles.delete(sfPath);

        if (oldFiles.has(sf)) {
          // This source file has the same object identity as in the previous program. We need to
          // determine if it's really the same file, or if it might have changed versions since the
          // last program without changing its identity.

          // If there's no version information available, then this is the same file, and we can
          // skip it.
          if (oldVersions === null || newVersions === null) {
            continue;
          }

          // If a version is available for the file from both the prior and the current program, and
          // that version is the same, then this is the same file, and we can skip it.
          if (oldVersions.has(sfPath) && newVersions.has(sfPath) &&
              oldVersions.get(sfPath)! === newVersions.get(sfPath)!) {
            continue;
          }

          // Otherwise, assume that the file has changed. Either its versions didn't match, or we
          // were missing version information about it on one side for some reason.
        }

        // Bail out if a .d.ts file changes - the semantic dep graph is not able to process such
        // changes correctly yet.
        if (sf.isDeclarationFile) {
          return IncrementalCompilation.fresh(program, newVersions);
        }

        // The file has changed physically, so record it.
        physicallyChangedTsFiles.add(sfPath);
      }

      // Remove any files that have been deleted from the list of physical changes.
      for (const deletedFileName of deletedTsFiles) {
        physicallyChangedTsFiles.delete(resolve(deletedFileName));
      }

      // Use the prior dependency graph to project physical changes into a set of logically changed
      // files.
      const depGraph = new FileDependencyGraph();
      const logicallyChangedTsFiles = depGraph.updateWithPhysicalChanges(
          priorAnalysis.depGraph, physicallyChangedTsFiles, deletedTsFiles, changedResourceFiles);

      // Physically changed files aren't necessarily counted as logically changed by the dependency
      // graph (files do not have edges to themselves), so add them to the logical changes
      // explicitly.
      for (const sfPath of physicallyChangedTsFiles) {
        logicallyChangedTsFiles.add(sfPath);
      }

      // Start off in a `DeltaIncrementalState` as a delta against the previous successful analysis,
      // until this compilation completes its own analysis.
      const state: DeltaIncrementalState = {
        kind: IncrementalStateKind.Delta,
        physicallyChangedTsFiles,
        changedResourceFiles,
        lastAnalyzedState: priorAnalysis,
      };

      return new IncrementalCompilation(state, depGraph, newVersions, {
        priorState: priorAnalysis,
        logicallyChangedTsFiles,
      });
    });
  }

  get state(): IncrementalState {
    return this._state;
  }

  get semanticDepGraphUpdater(): SemanticDepGraphUpdater {
    if (this.phase.kind !== PhaseKind.Analysis) {
      throw new Error(
          `AssertionError: Cannot update the SemanticDepGraph after analysis completes`);
    }
    return this.phase.semanticDepGraphUpdater;
  }

  recordSuccessfulAnalysis(traitCompiler: TraitCompiler): void {
    if (this.phase.kind !== PhaseKind.Analysis) {
      throw new Error(`AssertionError: Incremental compilation in phase ${
          PhaseKind[this.phase.kind]}, expected Analysis`);
    }

    const {needsEmit, needsTypeCheckEmit, newGraph} = this.phase.semanticDepGraphUpdater.finalize();

    // Determine the set of files which have already been emitted.
    let emitted: Set<AbsoluteFsPath>;
    if (this.step === null) {
      // Since there is no prior compilation, no files have yet been emitted.
      emitted = new Set();
    } else {
      // Begin with the files emitted by the prior successful compilation, but remove those which we
      // know need to bee re-emitted.
      emitted = new Set(this.step.priorState.emitted);

      // Files need re-emitted if they've logically changed.
      for (const sfPath of this.step.logicallyChangedTsFiles) {
        emitted.delete(sfPath);
      }

      // Files need re-emitted if they've semantically changed.
      for (const sfPath of needsEmit) {
        emitted.delete(sfPath);
      }
    }

    // Transition to a successfully analyzed compilation. At this point, a subsequent compilation
    // could use this state as a starting point.
    this._state = {
      kind: IncrementalStateKind.Analyzed,
      versions: this.versions,
      depGraph: this.depGraph,
      semanticDepGraph: newGraph,
      priorAnalysis: traitCompiler.getAnalyzedRecords(),
      typeCheckResults: null,
      emitted,
    };

    // We now enter the type-check and emit phase of compilation.
    this.phase = {
      kind: PhaseKind.TypeCheckAndEmit,
      needsEmit,
      needsTypeCheckEmit,
    };
  }

  recordSuccessfulTypeCheck(results: Map<AbsoluteFsPath, FileTypeCheckingData>): void {
    if (this._state.kind !== IncrementalStateKind.Analyzed) {
      throw new Error(`AssertionError: Expected successfully analyzed compilation.`);
    } else if (this.phase.kind !== PhaseKind.TypeCheckAndEmit) {
      throw new Error(`AssertionError: Incremental compilation in phase ${
          PhaseKind[this.phase.kind]}, expected TypeCheck`);
    }

    this._state.typeCheckResults = results;
  }


  recordSuccessfulEmit(sf: ts.SourceFile): void {
    if (this._state.kind !== IncrementalStateKind.Analyzed) {
      throw new Error(`AssertionError: Expected successfully analyzed compilation.`);
    }
    this._state.emitted.add(absoluteFromSourceFile(sf));
  }

  priorAnalysisFor(sf: ts.SourceFile): ClassRecord[]|null {
    if (this.step === null) {
      return null;
    }

    const sfPath = absoluteFromSourceFile(sf);

    // If the file has logically changed, its previous analysis cannot be reused.
    if (this.step.logicallyChangedTsFiles.has(sfPath)) {
      return null;
    }

    const priorAnalysis = this.step.priorState.priorAnalysis;
    if (!priorAnalysis.has(sf)) {
      return null;
    }
    return priorAnalysis.get(sf)!;
  }

  priorTypeCheckingResultsFor(sf: ts.SourceFile): FileTypeCheckingData|null {
    if (this.phase.kind !== PhaseKind.TypeCheckAndEmit) {
      throw new Error(`AssertionError: Expected successfully analyzed compilation.`);
    }

    if (this.step === null) {
      return null;
    }

    const sfPath = absoluteFromSourceFile(sf);

    // If the file has logically changed, or its template type-checking results have semantically
    // changed, then past type-checking results cannot be reused.
    if (this.step.logicallyChangedTsFiles.has(sfPath) ||
        this.phase.needsTypeCheckEmit.has(sfPath)) {
      return null;
    }

    // Past results also cannot be reused if they're not available.
    if (this.step.priorState.typeCheckResults === null ||
        !this.step.priorState.typeCheckResults.has(sfPath)) {
      return null;
    }

    const priorResults = this.step.priorState.typeCheckResults.get(sfPath)!;
    // If the past results relied on inlining, they're not safe for reuse.
    if (priorResults.hasInlines) {
      return null;
    }

    return priorResults;
  }

  safeToSkipEmit(sf: ts.SourceFile): boolean {
    // If this is a fresh compilation, it's never safe to skip an emit.
    if (this.step === null) {
      return false;
    }

    const sfPath = absoluteFromSourceFile(sf);

    // If the file has itself logically changed, it must be emitted.
    if (this.step.logicallyChangedTsFiles.has(sfPath)) {
      return false;
    }

    if (this.phase.kind !== PhaseKind.TypeCheckAndEmit) {
      throw new Error(
          `AssertionError: Expected successful analysis before attempting to emit files`);
    }

    // If during analysis it was determined that this file has semantically changed, it must be
    // emitted.
    if (this.phase.needsEmit.has(sfPath)) {
      return false;
    }

    // Generally it should be safe to assume here that the file was previously emitted by the last
    // successful compilation. However, as a defense-in-depth against incorrectness, we explicitly
    // check that the last emit included this file, and re-emit it otherwise.
    return this.step.priorState.emitted.has(sfPath);
  }
}

/**
 * To accurately detect whether a source file was affected during an incremental rebuild, the
 * "original" source file needs to be consistently used.
 *
 * First, TypeScript may have created source file redirects when declaration files of the same
 * version of a library are included multiple times. The non-redirected source file should be used
 * to detect changes, as otherwise the redirected source files cause a mismatch when compared to
 * a prior program.
 *
 * Second, the program that is used for template type checking may contain mutated source files, if
 * inline type constructors or inline template type-check blocks had to be used. Such source files
 * store their original, non-mutated source file from the original program in a symbol. For
 * computing the affected files in an incremental build this original source file should be used, as
 * the mutated source file would always be considered affected.
 */
function toOriginalSourceFile(sf: ts.SourceFile): ts.SourceFile {
  const unredirectedSf = toUnredirectedSourceFile(sf);
  const originalFile = (unredirectedSf as MaybeSourceFileWithOriginalFile)[NgOriginalFile];
  if (originalFile !== undefined) {
    return originalFile;
  } else {
    return unredirectedSf;
  }
}
