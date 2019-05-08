/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';
import {Reference} from '../../imports';
import {DirectiveMeta, MetadataReader, MetadataRegistry, NgModuleMeta, PipeMeta} from '../../metadata';
import {DependencyTracker} from '../../partial_evaluator';
import {ClassDeclaration} from '../../reflection';

/**
 * Accumulates state between compilations.
 */
export class IncrementalState implements DependencyTracker, MetadataReader, MetadataRegistry {
  private constructor(
      private unchangedFiles: Set<ts.SourceFile>,
      private metadata: Map<ts.SourceFile, FileMetadata>) {}

  static reconcile(previousState: IncrementalState, oldProgram: ts.Program, newProgram: ts.Program):
      IncrementalState {
    const unchangedFiles = new Set<ts.SourceFile>();
    const metadata = new Map<ts.SourceFile, FileMetadata>();

    // Compute the set of files that's unchanged.
    const oldFiles = new Set<ts.SourceFile>();
    for (const oldFile of oldProgram.getSourceFiles()) {
      if (!oldFile.isDeclarationFile) {
        oldFiles.add(oldFile);
      }
    }

    // Look for files in the new program which haven't changed.
    for (const newFile of newProgram.getSourceFiles()) {
      if (oldFiles.has(newFile)) {
        unchangedFiles.add(newFile);

        // Copy over metadata for the unchanged file if available.
        if (previousState.metadata.has(newFile)) {
          metadata.set(newFile, previousState.metadata.get(newFile) !);
        }
      }
    }

    return new IncrementalState(unchangedFiles, metadata);
  }

  static fresh(): IncrementalState {
    return new IncrementalState(new Set<ts.SourceFile>(), new Map<ts.SourceFile, FileMetadata>());
  }

  safeToSkipEmit(sf: ts.SourceFile): boolean {
    if (!this.unchangedFiles.has(sf)) {
      // The file has changed since the last run, and must be re-emitted.
      return false;
    }

    // The file hasn't changed since the last emit. Whether or not it's safe to emit depends on
    // what metadata was gathered about the file.

    if (!this.metadata.has(sf)) {
      // The file has no metadata from the previous or current compilations, so it must be emitted.
      return false;
    }

    const meta = this.metadata.get(sf) !;

    // Check if this file was explicitly marked as safe. This would only be done if every
    // `DecoratorHandler` agreed that the file didn't depend on any other file's contents.
    if (meta.safeToSkipEmitIfUnchanged) {
      return true;
    }

    // The file wasn't explicitly marked as safe to skip emitting, so require an emit.
    return false;
  }

  markFileAsSafeToSkipEmitIfUnchanged(sf: ts.SourceFile): void {
    const metadata = this.ensureMetadata(sf);
    metadata.safeToSkipEmitIfUnchanged = true;
  }

  trackFileDependency(dep: ts.SourceFile, src: ts.SourceFile) {
    const metadata = this.ensureMetadata(src);
    metadata.fileDependencies.add(dep);
  }

  getNgModuleMetadata(ref: Reference<ClassDeclaration>): NgModuleMeta|null {
    const metadata = this.metadata.get(ref.node.getSourceFile()) || null;
    return metadata && metadata.ngModuleMeta.get(ref.node) || null;
  }
  registerNgModuleMetadata(meta: NgModuleMeta): void {
    const metadata = this.ensureMetadata(meta.ref.node.getSourceFile());
    metadata.ngModuleMeta.set(meta.ref.node, meta);
  }

  getDirectiveMetadata(ref: Reference<ClassDeclaration>): DirectiveMeta|null {
    const metadata = this.metadata.get(ref.node.getSourceFile()) || null;
    return metadata && metadata.directiveMeta.get(ref.node) || null;
  }
  registerDirectiveMetadata(meta: DirectiveMeta): void {
    const metadata = this.ensureMetadata(meta.ref.node.getSourceFile());
    metadata.directiveMeta.set(meta.ref.node, meta);
  }

  getPipeMetadata(ref: Reference<ClassDeclaration>): PipeMeta|null {
    const metadata = this.metadata.get(ref.node.getSourceFile()) || null;
    return metadata && metadata.pipeMeta.get(ref.node) || null;
  }
  registerPipeMetadata(meta: PipeMeta): void {
    const metadata = this.ensureMetadata(meta.ref.node.getSourceFile());
    metadata.pipeMeta.set(meta.ref.node, meta);
  }

  private ensureMetadata(sf: ts.SourceFile): FileMetadata {
    const metadata = this.metadata.get(sf) || new FileMetadata();
    this.metadata.set(sf, metadata);
    return metadata;
  }
}

/**
 * Information about the whether a source file can have analysis or emission can be skipped.
 */
class FileMetadata {
  /** True if this file has no dependency changes that require it to be re-emitted. */
  safeToSkipEmitIfUnchanged = false;
  /** A set of source files that this file depends upon. */
  fileDependencies = new Set<ts.SourceFile>();
  directiveMeta = new Map<ClassDeclaration, DirectiveMeta>();
  ngModuleMeta = new Map<ClassDeclaration, NgModuleMeta>();
  pipeMeta = new Map<ClassDeclaration, PipeMeta>();
}
