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
 * Accumulates state between compilations.
 */
export class IncrementalState implements DependencyTracker, ResourceDependencyRecorder {
  private constructor(
      private unchangedFiles: Set<ts.SourceFile>,
      private metadata: Map<ts.SourceFile, FileMetadata>,
      private modifiedResourceFiles: Set<string>|null) {}

  static reconcile(
      oldProgram: ts.Program, newProgram: ts.Program,
      modifiedResourceFiles: Set<string>|null): IncrementalState {
    const unchangedFiles = new Set<ts.SourceFile>();
    const metadata = new Map<ts.SourceFile, FileMetadata>();
    const oldFiles = new Set<ts.SourceFile>(oldProgram.getSourceFiles());

    // Compute the set of files that are unchanged (both in themselves and their dependencies).
    for (const newFile of newProgram.getSourceFiles()) {
      if (newFile.isDeclarationFile && !oldFiles.has(newFile)) {
        // Bail out and re-emit everything if a .d.ts file has changed - currently the compiler does
        // not track dependencies into .d.ts files very well.
        return IncrementalState.fresh();
      } else if (oldFiles.has(newFile)) {
        unchangedFiles.add(newFile);
      }
    }

    return new IncrementalState(unchangedFiles, metadata, modifiedResourceFiles);
  }

  static fresh(): IncrementalState {
    return new IncrementalState(
        new Set<ts.SourceFile>(), new Map<ts.SourceFile, FileMetadata>(), null);
  }

  safeToSkip(sf: ts.SourceFile): boolean {
    // It's safe to skip emitting a file if:
    // 1) it hasn't changed
    // 2) none if its resource dependencies have changed
    // 3) none of its source dependencies have changed
    return this.unchangedFiles.has(sf) && !this.hasChangedResourceDependencies(sf) &&
        this.getFileDependencies(sf).every(dep => this.unchangedFiles.has(dep));
  }

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
    if (this.modifiedResourceFiles === null || !this.metadata.has(sf)) {
      return false;
    }
    const resourceDeps = this.metadata.get(sf) !.resourcePaths;
    return Array.from(resourceDeps.keys())
        .some(resourcePath => this.modifiedResourceFiles !.has(resourcePath));
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
