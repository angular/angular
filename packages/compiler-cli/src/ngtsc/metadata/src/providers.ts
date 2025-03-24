/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Reference} from '../../imports';
import {ClassDeclaration} from '../../reflection';

import {MetadataReader} from './api';

/**
 * Determines whether types may or may not export providers to NgModules, by transitively walking
 * the NgModule & standalone import graph.
 */
export class ExportedProviderStatusResolver {
  /**
   * `ClassDeclaration`s that we are in the process of determining the provider status for.
   *
   * This is used to detect cycles in the import graph and avoid getting stuck in them.
   */
  private calculating = new Set<ClassDeclaration>();

  constructor(private metaReader: MetadataReader) {}

  /**
   * Determines whether `ref` may or may not export providers to NgModules which import it.
   *
   * NgModules export providers if any are declared, and standalone components export providers from
   * their `imports` array (if any).
   *
   * If `true`, then `ref` should be assumed to export providers. In practice, this could mean
   * either that `ref` is a local type that we _know_ exports providers, or it's imported from a
   * .d.ts library and is declared in a way where the compiler cannot prove that it doesn't.
   *
   * If `false`, then `ref` is guaranteed not to export providers.
   *
   * @param `ref` the class for which the provider status should be determined
   * @param `dependencyCallback` a callback that, if provided, will be called for every type
   *     which is used in the determination of provider status for `ref`
   * @returns `true` if `ref` should be assumed to export providers, or `false` if the compiler can
   *     prove that it does not
   */
  mayExportProviders(
    ref: Reference<ClassDeclaration>,
    dependencyCallback?: (importRef: Reference<ClassDeclaration>) => void,
  ): boolean {
    if (this.calculating.has(ref.node)) {
      // For cycles, we treat the cyclic edge as not having providers.
      return false;
    }
    this.calculating.add(ref.node);

    if (dependencyCallback !== undefined) {
      dependencyCallback(ref);
    }

    try {
      const dirMeta = this.metaReader.getDirectiveMetadata(ref);
      if (dirMeta !== null) {
        if (!dirMeta.isComponent || !dirMeta.isStandalone) {
          return false;
        }

        if (dirMeta.assumedToExportProviders) {
          return true;
        }

        // If one of the imports contains providers, then so does this component.
        return (dirMeta.imports ?? []).some((importRef) =>
          this.mayExportProviders(importRef, dependencyCallback),
        );
      }

      const pipeMeta = this.metaReader.getPipeMetadata(ref);
      if (pipeMeta !== null) {
        return false;
      }

      const ngModuleMeta = this.metaReader.getNgModuleMetadata(ref);
      if (ngModuleMeta !== null) {
        if (ngModuleMeta.mayDeclareProviders) {
          return true;
        }

        // If one of the NgModule's imports may contain providers, then so does this NgModule.
        return ngModuleMeta.imports.some((importRef) =>
          this.mayExportProviders(importRef, dependencyCallback),
        );
      }

      return false;
    } finally {
      this.calculating.delete(ref.node);
    }
  }
}
