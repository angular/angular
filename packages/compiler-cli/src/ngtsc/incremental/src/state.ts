/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {DependencyTracker} from '../../partial_evaluator';
import {ResourceDependencyRecorder} from '../../util/src/resource_recorder';

/**
 * Drives an incremental build, by tracking changes and determining which files need to be emitted.
 */
export class IncrementalDriver implements DependencyTracker, ResourceDependencyRecorder {
  /**
   * State of the current build.
   *
   * This transitions as the compilation progresses.
   */
  private state: BuildState;

  /**
   * Tracks metadata related to each `ts.SourceFile` in the program.
   */
  private metadata = new Map<ts.SourceFile, FileMetadata>();

  private constructor(state: PendingBuildState, private allTsFiles: Set<ts.SourceFile>) {
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
      modifiedResourceFiles: Set<string>|null): IncrementalDriver {
    // Initialize the state of the current build based on the previous one.
    let state: PendingBuildState;
    if (oldDriver.state.kind === BuildStateKind.Pending) {
      // The previous build never made it past the pending state. Reuse it as the starting state for
      // this build.
      state = oldDriver.state;
    } else {
      // The previous build was successfully analyzed. `pendingEmit` is the only state carried
      // forward into this build.
      state = {
        kind: BuildStateKind.Pending,
        pendingEmit: oldDriver.state.pendingEmit,
        changedResourcePaths: new Set<string>(),
        changedTsPaths: new Set<string>(),
      };
    }

    // Merge the freshly modified resource files with any prior ones.
    if (modifiedResourceFiles !== null) {
      for (const resFile of modifiedResourceFiles) {
        state.changedResourcePaths.add(resFile);
      }
    }

    // Next, process the files in the new program, with a couple of goals:
    // 1) Determine which TS files have changed, if any, and merge them into `changedTsFiles`.
    // 2) Produce a list of TS files which no longer exist in the program (they've been deleted
    //    since the previous compilation). These need to be removed from the state tracking to avoid
    //    leaking memory.

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
        // dependencies on .d.ts files, so bail out of incremental builds here and do a full build.
        // This usually only happens if something in node_modules changes.
        return IncrementalDriver.fresh(newProgram);
      }
    }

    // The last step is to remove any deleted files from the state.
    for (const filePath of deletedTsPaths) {
      state.pendingEmit.delete(filePath);

      // Even if the file doesn't exist in the current compilation, it still might have been changed
      // in a previous one, so delete it from the set of changed TS files, just in case.
      state.changedTsPaths.delete(filePath);
    }

    // `state` now reflects the initial compilation state of the current
    return new IncrementalDriver(state, new Set<ts.SourceFile>(tsOnlyFiles(newProgram)));
  }

  static fresh(program: ts.Program): IncrementalDriver {
    // Initialize the set of files which need to be emitted to the set of all TS files in the
    // program.
    const tsFiles = tsOnlyFiles(program);

    const state: PendingBuildState = {
      kind: BuildStateKind.Pending,
      pendingEmit: new Set<string>(tsFiles.map(sf => sf.fileName)),
      changedResourcePaths: new Set<string>(),
      changedTsPaths: new Set<string>(),
    };

    return new IncrementalDriver(state, new Set(tsFiles));
  }

  recordSuccessfulAnalysis(): void {
    if (this.state.kind !== BuildStateKind.Pending) {
      // Changes have already been incorporated.
      return;
    }

    const pendingEmit = this.state.pendingEmit;

    const state: PendingBuildState = this.state;

    for (const sf of this.allTsFiles) {
      // It's safe to skip emitting a file if:
      // 1) it hasn't changed
      // 2) none if its resource dependencies have changed
      // 3) none of its source dependencies have changed
      if (state.changedTsPaths.has(sf.fileName) || this.hasChangedResourceDependencies(sf) ||
          this.getFileDependencies(sf).some(dep => state.changedTsPaths.has(dep.fileName))) {
        // Something has changed which requires this file be re-emitted.
        pendingEmit.add(sf.fileName);
      }
    }

    // Update the state to an `AnalyzedBuildState`.
    this.state = {
      kind: BuildStateKind.Analyzed,
      pendingEmit,
    };
  }

  recordSuccessfulEmit(sf: ts.SourceFile): void { this.state.pendingEmit.delete(sf.fileName); }

  safeToSkipEmit(sf: ts.SourceFile): boolean { return !this.state.pendingEmit.has(sf.fileName); }

  trackFileDependency(dep: ts.SourceFile, src: ts.SourceFile) {
    const metadata = this.ensureMetadata(src);
    metadata.fileDependencies.add(dep);
  }

  trackFileDependencies(deps: ts.SourceFile[], src: ts.SourceFile) {
    const metadata = this.ensureMetadata(src);
    for (const dep of deps) {
      metadata.fileDependencies.add(dep);
    }
  }

  getFileDependencies(file: ts.SourceFile): ts.SourceFile[] {
    if (!this.metadata.has(file)) {
      return [];
    }
    const meta = this.metadata.get(file) !;
    return Array.from(meta.fileDependencies);
  }

  recordResourceDependency(file: ts.SourceFile, resourcePath: string): void {
    const metadata = this.ensureMetadata(file);
    metadata.resourcePaths.add(resourcePath);
  }

  private ensureMetadata(sf: ts.SourceFile): FileMetadata {
    const metadata = this.metadata.get(sf) || new FileMetadata();
    this.metadata.set(sf, metadata);
    return metadata;
  }

  private hasChangedResourceDependencies(sf: ts.SourceFile): boolean {
    if (!this.metadata.has(sf)) {
      return false;
    }
    const resourceDeps = this.metadata.get(sf) !.resourcePaths;
    return Array.from(resourceDeps.keys())
        .some(
            resourcePath => this.state.kind === BuildStateKind.Pending &&
                this.state.changedResourcePaths.has(resourcePath));
  }
}

/**
 * Information about the whether a source file can have analysis or emission can be skipped.
 */
class FileMetadata {
  /** A set of source files that this file depends upon. */
  fileDependencies = new Set<ts.SourceFile>();
  resourcePaths = new Set<string>();
}


type BuildState = PendingBuildState | AnalyzedBuildState;

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
   * If an emit happens, any written files are removed from the `Set`, as they're no longer pending.
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
  changedResourcePaths: Set<string>;
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
}

function tsOnlyFiles(program: ts.Program): ReadonlyArray<ts.SourceFile> {
  return program.getSourceFiles().filter(sf => !sf.isDeclarationFile);
}
