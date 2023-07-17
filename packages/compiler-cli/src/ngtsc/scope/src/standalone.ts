/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Reference} from '../../imports';
import {DirectiveMeta, MetadataReader, NgModuleMeta, PipeMeta} from '../../metadata';
import {ClassDeclaration} from '../../reflection';

import {ComponentScopeKind, ComponentScopeReader, ExportScope, RemoteScope, StandaloneScope} from './api';
import {DtsModuleScopeResolver} from './dependency';
import {LocalModuleScopeRegistry} from './local';

/**
 * Computes scopes for standalone components based on their `imports`, expanding imported NgModule
 * scopes where necessary.
 */
export class StandaloneComponentScopeReader implements ComponentScopeReader {
  private cache = new Map<ClassDeclaration, StandaloneScope|null>();

  constructor(
      private metaReader: MetadataReader, private localModuleReader: LocalModuleScopeRegistry,
      private dtsModuleReader: DtsModuleScopeResolver) {}

  getScopeForComponent(clazz: ClassDeclaration): StandaloneScope|null {
    if (!this.cache.has(clazz)) {
      const clazzRef = new Reference(clazz);
      const clazzMeta = this.metaReader.getDirectiveMetadata(clazzRef);

      if (clazzMeta === null || !clazzMeta.isComponent || !clazzMeta.isStandalone) {
        this.cache.set(clazz, null);
        return null;
      }

      // A standalone component always has itself in scope, so add `clazzMeta` during
      // initialization.
      const dependencies = new Set<DirectiveMeta|PipeMeta|NgModuleMeta>([clazzMeta]);
      const seen = new Set<ClassDeclaration>([clazz]);
      let isPoisoned = clazzMeta.isPoisoned;

      if (clazzMeta.imports !== null) {
        for (const ref of clazzMeta.imports) {
          if (seen.has(ref.node)) {
            continue;
          }
          seen.add(ref.node);

          const dirMeta = this.metaReader.getDirectiveMetadata(ref);
          if (dirMeta !== null) {
            dependencies.add({...dirMeta, ref});
            isPoisoned = isPoisoned || dirMeta.isPoisoned || !dirMeta.isStandalone;
            continue;
          }

          const pipeMeta = this.metaReader.getPipeMetadata(ref);
          if (pipeMeta !== null) {
            dependencies.add({...pipeMeta, ref});
            isPoisoned = isPoisoned || !pipeMeta.isStandalone;
            continue;
          }

          const ngModuleMeta = this.metaReader.getNgModuleMetadata(ref);
          if (ngModuleMeta !== null) {
            dependencies.add({...ngModuleMeta, ref});

            let ngModuleScope: ExportScope|null;
            if (ref.node.getSourceFile().isDeclarationFile) {
              ngModuleScope = this.dtsModuleReader.resolve(ref);
            } else {
              ngModuleScope = this.localModuleReader.getScopeOfModule(ref.node);
            }
            if (ngModuleScope === null) {
              // This technically shouldn't happen, but mark the scope as poisoned just in case.
              isPoisoned = true;
              continue;
            }

            isPoisoned = isPoisoned || ngModuleScope.exported.isPoisoned;
            for (const dep of ngModuleScope.exported.dependencies) {
              if (!seen.has(dep.ref.node)) {
                seen.add(dep.ref.node);
                dependencies.add(dep);
              }
            }

            continue;
          }

          // Import was not a component/directive/pipe/NgModule, which is an error and poisons the
          // scope.
          isPoisoned = true;
        }
      }

      this.cache.set(clazz, {
        kind: ComponentScopeKind.Standalone,
        component: clazz,
        dependencies: Array.from(dependencies),
        isPoisoned,
        schemas: clazzMeta.schemas ?? [],
      });
    }

    return this.cache.get(clazz)!;
  }

  getRemoteScope(): null {
    return null;
  }
}
