/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Reference} from '../../imports';
import {ClassDeclaration} from '../../reflection';

import {DirectiveMeta, MetadataReaderWithIndex, MetadataRegistry, MetaKind, NgModuleMeta, PipeMeta} from './api';

/**
 * A registry of directive, pipe, and module metadata for types defined in the current compilation
 * unit, which supports both reading and registering.
 */
export class LocalMetadataRegistry implements MetadataRegistry, MetadataReaderWithIndex {
  private directives = new Map<ClassDeclaration, DirectiveMeta>();
  private ngModules = new Map<ClassDeclaration, NgModuleMeta>();
  private pipes = new Map<ClassDeclaration, PipeMeta>();

  getDirectiveMetadata(ref: Reference<ClassDeclaration>): DirectiveMeta|null {
    return this.directives.has(ref.node) ? this.directives.get(ref.node)! : null;
  }
  getNgModuleMetadata(ref: Reference<ClassDeclaration>): NgModuleMeta|null {
    return this.ngModules.has(ref.node) ? this.ngModules.get(ref.node)! : null;
  }
  getPipeMetadata(ref: Reference<ClassDeclaration>): PipeMeta|null {
    return this.pipes.has(ref.node) ? this.pipes.get(ref.node)! : null;
  }

  registerDirectiveMetadata(meta: DirectiveMeta): void {
    this.directives.set(meta.ref.node, meta);
  }
  registerNgModuleMetadata(meta: NgModuleMeta): void {
    this.ngModules.set(meta.ref.node, meta);
  }
  registerPipeMetadata(meta: PipeMeta): void {
    this.pipes.set(meta.ref.node, meta);
  }

  getKnown(kind: MetaKind): Array<ClassDeclaration> {
    switch (kind) {
      case MetaKind.Directive:
        return Array.from(this.directives.values()).map(v => v.ref.node);
      case MetaKind.Pipe:
        return Array.from(this.pipes.values()).map(v => v.ref.node);
      case MetaKind.NgModule:
        return Array.from(this.ngModules.values()).map(v => v.ref.node);
    }
  }
}

/**
 * A `MetadataRegistry` which registers metadata with multiple delegate `MetadataRegistry`
 * instances.
 */
export class CompoundMetadataRegistry implements MetadataRegistry {
  constructor(private registries: MetadataRegistry[]) {}

  registerDirectiveMetadata(meta: DirectiveMeta): void {
    for (const registry of this.registries) {
      registry.registerDirectiveMetadata(meta);
    }
  }

  registerNgModuleMetadata(meta: NgModuleMeta): void {
    for (const registry of this.registries) {
      registry.registerNgModuleMetadata(meta);
    }
  }

  registerPipeMetadata(meta: PipeMeta): void {
    for (const registry of this.registries) {
      registry.registerPipeMetadata(meta);
    }
  }
}
