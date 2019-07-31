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
import {ComponentScopeReader, ComponentScopeRegistry, LocalModuleScope} from '../../scope';
import {ResourceDependencyRecorder} from '../../util/src/resource_recorder';

/**
 * Accumulates state between compilations.
 */
export class IncrementalState implements DependencyTracker, MetadataReader, MetadataRegistry,
    ResourceDependencyRecorder, ComponentScopeRegistry, ComponentScopeReader {
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
    if (!this.metadata.has(file)) {
      return [];
    }
    const meta = this.metadata.get(file) !;
    return Array.from(meta.fileDependencies);
  }

  getNgModuleMetadata(ref: Reference<ClassDeclaration>): NgModuleMeta|null {
    if (!this.metadata.has(ref.node.getSourceFile())) {
      return null;
    }
    const metadata = this.metadata.get(ref.node.getSourceFile()) !;
    if (!metadata.ngModuleMeta.has(ref.node)) {
      return null;
    }
    return metadata.ngModuleMeta.get(ref.node) !;
  }

  registerNgModuleMetadata(meta: NgModuleMeta): void {
    const metadata = this.ensureMetadata(meta.ref.node.getSourceFile());
    metadata.ngModuleMeta.set(meta.ref.node, meta);
  }

  getDirectiveMetadata(ref: Reference<ClassDeclaration>): DirectiveMeta|null {
    if (!this.metadata.has(ref.node.getSourceFile())) {
      return null;
    }
    const metadata = this.metadata.get(ref.node.getSourceFile()) !;
    if (!metadata.directiveMeta.has(ref.node)) {
      return null;
    }
    return metadata.directiveMeta.get(ref.node) !;
  }

  registerDirectiveMetadata(meta: DirectiveMeta): void {
    const metadata = this.ensureMetadata(meta.ref.node.getSourceFile());
    metadata.directiveMeta.set(meta.ref.node, meta);
  }

  getPipeMetadata(ref: Reference<ClassDeclaration>): PipeMeta|null {
    if (!this.metadata.has(ref.node.getSourceFile())) {
      return null;
    }
    const metadata = this.metadata.get(ref.node.getSourceFile()) !;
    if (!metadata.pipeMeta.has(ref.node)) {
      return null;
    }
    return metadata.pipeMeta.get(ref.node) !;
  }

  registerPipeMetadata(meta: PipeMeta): void {
    const metadata = this.ensureMetadata(meta.ref.node.getSourceFile());
    metadata.pipeMeta.set(meta.ref.node, meta);
  }

  recordResourceDependency(file: ts.SourceFile, resourcePath: string): void {
    const metadata = this.ensureMetadata(file);
    metadata.resourcePaths.add(resourcePath);
  }

  registerComponentScope(clazz: ClassDeclaration, scope: LocalModuleScope): void {
    const metadata = this.ensureMetadata(clazz.getSourceFile());
    metadata.componentScope.set(clazz, scope);
  }

  getScopeForComponent(clazz: ClassDeclaration): LocalModuleScope|null {
    if (!this.metadata.has(clazz.getSourceFile())) {
      return null;
    }
    const metadata = this.metadata.get(clazz.getSourceFile()) !;
    if (!metadata.componentScope.has(clazz)) {
      return null;
    }
    return metadata.componentScope.get(clazz) !;
  }

  setComponentAsRequiringRemoteScoping(clazz: ClassDeclaration): void {
    const metadata = this.ensureMetadata(clazz.getSourceFile());
    metadata.remoteScoping.add(clazz);
  }

  getRequiresRemoteScope(clazz: ClassDeclaration): boolean|null {
    // TODO: https://angular-team.atlassian.net/browse/FW-1501
    // Handle the incremental build case where a component requires remote scoping.
    // This means that if the the component's template changes, it requires the module to be
    // re-emitted.
    // Also, we need to make sure the cycle detector works well across rebuilds.
    if (!this.metadata.has(clazz.getSourceFile())) {
      return null;
    }
    const metadata = this.metadata.get(clazz.getSourceFile()) !;
    return metadata.remoteScoping.has(clazz);
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
  componentScope = new Map<ClassDeclaration, LocalModuleScope>();
  remoteScoping = new Set<ClassDeclaration>();
}
