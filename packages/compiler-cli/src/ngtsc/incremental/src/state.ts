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
import {ResourceDependencyRecorder} from '../../util/src/resource_recorder';

/**
 * Accumulates state between compilations.
 */
export class IncrementalState implements DependencyTracker, MetadataReader, MetadataRegistry,
    ResourceDependencyRecorder {
  private constructor(
      private unchangedFiles: Set<ts.SourceFile>,
      private metadata: Map<ts.SourceFile, FileMetadata>,
      private modifiedResourceFiles: Set<string>|null) {}

  static reconcile(
      previousState: IncrementalState, oldProgram: ts.Program, newProgram: ts.Program,
      modifiedResourceFiles: Set<string>|null): IncrementalState {
    const unchangedFiles = new Set<ts.SourceFile>();
    const metadata = new Map<ts.SourceFile, FileMetadata>();
    const oldFiles = new Set<ts.SourceFile>(oldProgram.getSourceFiles());
    const newFiles = new Set<ts.SourceFile>(newProgram.getSourceFiles());

    // Compute the set of files that are unchanged (both in themselves and their dependencies).
    for (const newFile of newProgram.getSourceFiles()) {
      if (oldFiles.has(newFile)) {
        const oldDeps = previousState.getFileDependencies(newFile);
        if (oldDeps.every(oldDep => newFiles.has(oldDep))) {
          // The file and its dependencies are unchanged.
          unchangedFiles.add(newFile);
          // Copy over its metadata too
          const meta = previousState.metadata.get(newFile);
          if (meta) {
            metadata.set(newFile, meta);
          }
        }
      } else if (newFile.isDeclarationFile) {
        // A typings file has changed so trigger a full rebuild of the Angular analyses
        return IncrementalState.fresh();
      }
    }

    return new IncrementalState(unchangedFiles, metadata, modifiedResourceFiles);
  }

  static fresh(): IncrementalState {
    return new IncrementalState(
        new Set<ts.SourceFile>(), new Map<ts.SourceFile, FileMetadata>(), null);
  }

  safeToSkip(sf: ts.SourceFile): boolean|Promise<boolean> {
    return this.unchangedFiles.has(sf) && !this.hasChangedResourceDependencies(sf);
  }

  trackFileDependency(dep: ts.SourceFile, src: ts.SourceFile) {
    const metadata = this.ensureMetadata(src);
    metadata.fileDependencies.add(dep);
  }

  getFileDependencies(file: ts.SourceFile): ts.SourceFile[] {
    const meta = this.metadata.get(file);
    return meta ? Array.from(meta.fileDependencies) : [];
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
  directiveMeta = new Map<ClassDeclaration, DirectiveMeta>();
  ngModuleMeta = new Map<ClassDeclaration, NgModuleMeta>();
  pipeMeta = new Map<ClassDeclaration, PipeMeta>();
}
