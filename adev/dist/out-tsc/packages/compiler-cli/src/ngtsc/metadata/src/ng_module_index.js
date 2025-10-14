/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {Reference} from '../../imports';
import {MetaKind} from './api';
/**
 * An index of all NgModules that export or re-export a given trait.
 */
export class NgModuleIndexImpl {
  metaReader;
  localReader;
  constructor(metaReader, localReader) {
    this.metaReader = metaReader;
    this.localReader = localReader;
  }
  // A map from an NgModule's Class Declaration to the "main" reference to that module, aka the one
  // present in the reader metadata object
  ngModuleAuthoritativeReference = new Map();
  // A map from a Directive/Pipe's class declaration to the class declarations of all re-exporting
  // NgModules
  typeToExportingModules = new Map();
  indexed = false;
  updateWith(cache, key, elem) {
    if (cache.has(key)) {
      cache.get(key).add(elem);
    } else {
      const set = new Set();
      set.add(elem);
      cache.set(key, set);
    }
  }
  index() {
    const seenTypesWithReexports = new Map();
    const locallyDeclaredDirsAndNgModules = [
      ...this.localReader.getKnown(MetaKind.NgModule),
      ...this.localReader.getKnown(MetaKind.Directive),
    ];
    for (const decl of locallyDeclaredDirsAndNgModules) {
      // Here it's safe to create a new Reference because these are known local types.
      this.indexTrait(new Reference(decl), seenTypesWithReexports);
    }
    this.indexed = true;
  }
  indexTrait(ref, seenTypesWithReexports) {
    if (seenTypesWithReexports.has(ref.node)) {
      // We've processed this type before.
      return;
    }
    seenTypesWithReexports.set(ref.node, new Set());
    const meta =
      this.metaReader.getDirectiveMetadata(ref) ?? this.metaReader.getNgModuleMetadata(ref);
    if (meta === null) {
      return;
    }
    // Component + NgModule: recurse into imports
    if (meta.imports !== null) {
      for (const childRef of meta.imports) {
        this.indexTrait(childRef, seenTypesWithReexports);
      }
    }
    if (meta.kind === MetaKind.NgModule) {
      if (!this.ngModuleAuthoritativeReference.has(ref.node)) {
        this.ngModuleAuthoritativeReference.set(ref.node, ref);
      }
      for (const childRef of meta.exports) {
        this.indexTrait(childRef, seenTypesWithReexports);
        const childMeta =
          this.metaReader.getDirectiveMetadata(childRef) ??
          this.metaReader.getPipeMetadata(childRef) ??
          this.metaReader.getNgModuleMetadata(childRef);
        if (childMeta === null) {
          continue;
        }
        switch (childMeta.kind) {
          case MetaKind.Directive:
          case MetaKind.Pipe:
            this.updateWith(this.typeToExportingModules, childRef.node, ref.node);
            this.updateWith(seenTypesWithReexports, ref.node, childRef.node);
            break;
          case MetaKind.NgModule:
            if (seenTypesWithReexports.has(childRef.node)) {
              for (const reexported of seenTypesWithReexports.get(childRef.node)) {
                this.updateWith(this.typeToExportingModules, reexported, ref.node);
                this.updateWith(seenTypesWithReexports, ref.node, reexported);
              }
            }
            break;
        }
      }
    }
  }
  getNgModulesExporting(directiveOrPipe) {
    if (!this.indexed) {
      this.index();
    }
    if (!this.typeToExportingModules.has(directiveOrPipe)) {
      return [];
    }
    const refs = [];
    for (const ngModule of this.typeToExportingModules.get(directiveOrPipe)) {
      if (this.ngModuleAuthoritativeReference.has(ngModule)) {
        refs.push(this.ngModuleAuthoritativeReference.get(ngModule));
      }
    }
    return refs;
  }
}
//# sourceMappingURL=ng_module_index.js.map
