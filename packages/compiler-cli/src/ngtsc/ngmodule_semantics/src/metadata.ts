/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {DirectiveMeta, MetadataRegistry, NgModuleMeta, PipeMeta} from '../../metadata';
import {SemanticDepGraphUpdater} from './graph';

export class SemanticDepGraphAdapter implements MetadataRegistry {
  constructor(private updater: SemanticDepGraphUpdater) {}

  registerDirectiveMetadata(meta: DirectiveMeta): void {
    this.updater.addDirective(meta);
  }

  registerNgModuleMetadata(meta: NgModuleMeta): void {
    this.updater.addNgModule(meta);
  }

  registerPipeMetadata(meta: PipeMeta): void {
    this.updater.addPipe(meta);
  }
}
