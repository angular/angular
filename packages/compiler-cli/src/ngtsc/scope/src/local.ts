/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ExternalExpr} from '@angular/compiler';
import * as ts from 'typescript';

import {AliasGenerator, Reexport, Reference, ReferenceEmitter} from '../../imports';

import {ExportScope, ScopeData, ScopeDirective, ScopePipe} from './api';
import {DtsModuleScopeResolver} from './dependency';

export interface LocalNgModuleData {
  declarations: Reference<ts.Declaration>[];
  imports: Reference<ts.Declaration>[];
  exports: Reference<ts.Declaration>[];
}

export interface LocalModuleScope extends ExportScope {
  compilation: ScopeData;
  reexports: Reexport[]|null;
}

/**
 * A registry which collects information about NgModules, Directives, Components, and Pipes which
 * are local (declared in the ts.Program being compiled), and can produce `LocalModuleScope`s
 * which summarize the compilation scope of a component.
 *
 * This class implements the logic of NgModule declarations, imports, and exports and can produce,
 * for a given component, the set of directives and pipes which are "visible" in that component's
 * template.
 *
 * The `LocalModuleScopeRegistry` has two "modes" of operation. During analysis, data for each
 * individual NgModule, Directive, Component, and Pipe is added to the registry. No attempt is made
 * to traverse or validate the NgModule graph (imports, exports, etc). After analysis, one of
 * `getScopeOfModule` or `getScopeForComponent` can be called, which traverses the NgModule graph
 * and applies the NgModule logic to generate a `LocalModuleScope`, the full scope for the given
 * module or component.
 */
export class LocalModuleScopeRegistry {
  /**
   * Tracks whether the registry has been asked to produce scopes for a module or component. Once
   * this is true, the registry cannot accept registrations of new directives/pipes/modules as it
   * would invalidate the cached scope data.
   */
  private sealed = false;

  /**
   * Metadata for each local NgModule registered.
   */
  private ngModuleData = new Map<ts.Declaration, LocalNgModuleData>();

  /**
   * Metadata for each local directive registered.
   */
  private directiveData = new Map<ts.Declaration, ScopeDirective>();

  /**
   * Metadata for each local pipe registered.
   */
  private pipeData = new Map<ts.Declaration, ScopePipe>();

  /**
   * A map of components from the current compilation unit to the NgModule which declared them.
   *
   * As components and directives are not distinguished at the NgModule level, this map may also
   * contain directives. This doesn't cause any problems but isn't useful as there is no concept of
   * a directive's compilation scope.
   */
  private declarationToModule = new Map<ts.Declaration, ts.Declaration>();

  /**
   * A cache of calculated `LocalModuleScope`s for each NgModule declared in the current program.
   */
  private cache = new Map<ts.Declaration, LocalModuleScope>();

  /**
   * Tracks whether a given component requires "remote scoping".
   *
   * Remote scoping is when the set of directives which apply to a given component is set in the
   * NgModule's file instead of directly on the ngComponentDef (which is sometimes needed to get
   * around cyclic import issues). This is not used in calculation of `LocalModuleScope`s, but is
   * tracked here for convenience.
   */
  private remoteScoping = new Set<ts.Declaration>();

  constructor(
      private dependencyScopeReader: DtsModuleScopeResolver, private refEmitter: ReferenceEmitter,
      private aliasGenerator: AliasGenerator|null) {}

  /**
   * Add an NgModule's data to the registry.
   */
  registerNgModule(clazz: ts.Declaration, data: LocalNgModuleData): void {
    this.assertCollecting();
    this.ngModuleData.set(clazz, data);
    for (const decl of data.declarations) {
      this.declarationToModule.set(decl.node, clazz);
    }
  }

  registerDirective(directive: ScopeDirective): void {
    this.assertCollecting();
    this.directiveData.set(directive.ref.node, directive);
  }

  registerPipe(pipe: ScopePipe): void {
    this.assertCollecting();
    this.pipeData.set(pipe.ref.node, pipe);
  }

  getScopeForComponent(clazz: ts.ClassDeclaration): LocalModuleScope|null {
    if (!this.declarationToModule.has(clazz)) {
      return null;
    }
    return this.getScopeOfModule(this.declarationToModule.get(clazz) !);
  }

  /**
   * Collects registered data for a module and its directives/pipes and convert it into a full
   * `LocalModuleScope`.
   *
   * This method implements the logic of NgModule imports and exports.
   */
  getScopeOfModule(clazz: ts.Declaration): LocalModuleScope|null {
    // Seal the registry to protect the integrity of the `LocalModuleScope` cache.
    this.sealed = true;

    // Look for cached data if available.
    if (this.cache.has(clazz)) {
      return this.cache.get(clazz) !;
    }

    // `clazz` should be an NgModule previously added to the registry. If not, a scope for it
    // cannot be produced.
    if (!this.ngModuleData.has(clazz)) {
      return null;
    }
    const ngModule = this.ngModuleData.get(clazz) !;

    // At this point, the goal is to produce two distinct transitive sets:
    // - the directives and pipes which are visible to components declared in the NgModule.
    // - the directives and pipes which are exported to any NgModules which import this one.

    // Directives and pipes in the compilation scope.
    const compilationDirectives = new Map<ts.Declaration, ScopeDirective>();
    const compilationPipes = new Map<ts.Declaration, ScopePipe>();

    const declared = new Set<ts.Declaration>();
    const sourceFile = clazz.getSourceFile();

    // Directives and pipes exported to any importing NgModules.
    const exportDirectives = new Map<ts.Declaration, ScopeDirective>();
    const exportPipes = new Map<ts.Declaration, ScopePipe>();

    // The algorithm is as follows:
    // 1) Add directives/pipes declared in the NgModule to the compilation scope.
    // 2) Add all of the directives/pipes from each NgModule imported into the current one to the
    //    compilation scope. At this point, the compilation scope is complete.
    // 3) For each entry in the NgModule's exports:
    //    a) Attempt to resolve it as an NgModule with its own exported directives/pipes. If it is
    //       one, add them to the export scope of this NgModule.
    //    b) Otherwise, it should be a class in the compilation scope of this NgModule. If it is,
    //       add it to the export scope.
    //    c) If it's neither an NgModule nor a directive/pipe in the compilation scope, then this
    //       is an error.

    // 1) add declarations.
    for (const decl of ngModule.declarations) {
      if (this.directiveData.has(decl.node)) {
        const directive = this.directiveData.get(decl.node) !;
        compilationDirectives.set(
            decl.node, {...directive, ref: decl as Reference<ts.ClassDeclaration>});
      } else if (this.pipeData.has(decl.node)) {
        const pipe = this.pipeData.get(decl.node) !;
        compilationPipes.set(decl.node, {...pipe, ref: decl});
      } else {
        // TODO(alxhub): produce a ts.Diagnostic. This can't be an error right now since some
        // ngtools tests rely on analysis of broken components.
        continue;
      }

      declared.add(decl.node);
    }

    // 2) process imports.
    for (const decl of ngModule.imports) {
      const importScope = this.getExportedScope(decl);
      if (importScope === null) {
        // TODO(alxhub): produce a ts.Diagnostic
        throw new Error(`Unknown import: ${decl.debugName}`);
      }
      for (const directive of importScope.exported.directives) {
        compilationDirectives.set(directive.ref.node, directive);
      }
      for (const pipe of importScope.exported.pipes) {
        compilationPipes.set(pipe.ref.node, pipe);
      }
    }

    // 3) process exports.
    // Exports can contain modules, components, or directives. They're processed differently.
    // Modules are straightforward. Directives and pipes from exported modules are added to the
    // export maps. Directives/pipes are different - they might be exports of declared types or
    // imported types.
    for (const decl of ngModule.exports) {
      // Attempt to resolve decl as an NgModule.
      const importScope = this.getExportedScope(decl);
      if (importScope !== null) {
        // decl is an NgModule.
        for (const directive of importScope.exported.directives) {
          exportDirectives.set(directive.ref.node, directive);
        }
        for (const pipe of importScope.exported.pipes) {
          exportPipes.set(pipe.ref.node, pipe);
        }
      } else if (compilationDirectives.has(decl.node)) {
        // decl is a directive or component in the compilation scope of this NgModule.
        const directive = compilationDirectives.get(decl.node) !;
        exportDirectives.set(decl.node, directive);
      } else if (compilationPipes.has(decl.node)) {
        // decl is a pipe in the compilation scope of this NgModule.
        const pipe = compilationPipes.get(decl.node) !;
        exportPipes.set(decl.node, pipe);
      } else {
        // decl is an unknown export.
        // TODO(alxhub): produce a ts.Diagnostic
        throw new Error(`Unknown export: ${decl.debugName}`);
      }
    }

    const exported = {
      directives: Array.from(exportDirectives.values()),
      pipes: Array.from(exportPipes.values()),
    };

    let reexports: Reexport[]|null = null;
    if (this.aliasGenerator !== null) {
      reexports = [];
      const addReexport = (ref: Reference<ts.Declaration>) => {
        if (!declared.has(ref.node) && ref.node.getSourceFile() !== sourceFile) {
          const exportName = this.aliasGenerator !.aliasSymbolName(ref.node, sourceFile);
          if (ref.alias && ref.alias instanceof ExternalExpr) {
            reexports !.push({
              fromModule: ref.alias.value.moduleName !,
              symbolName: ref.alias.value.name !,
              asAlias: exportName,
            });
          } else {
            const expr = this.refEmitter.emit(ref.cloneWithNoIdentifiers(), sourceFile);
            if (!(expr instanceof ExternalExpr) || expr.value.moduleName === null ||
                expr.value.name === null) {
              throw new Error('Expected ExternalExpr');
            }
            reexports !.push({
              fromModule: expr.value.moduleName,
              symbolName: expr.value.name,
              asAlias: exportName,
            });
          }
        }
      };
      for (const {ref} of exported.directives) {
        addReexport(ref);
      }
      for (const {ref} of exported.pipes) {
        addReexport(ref);
      }
    }



    // Finally, produce the `LocalModuleScope` with both the compilation and export scopes.
    const scope = {
      compilation: {
        directives: Array.from(compilationDirectives.values()),
        pipes: Array.from(compilationPipes.values()),
      },
      exported,
      reexports,
    };
    this.cache.set(clazz, scope);
    return scope;
  }

  /**
   * Check whether a component requires remote scoping.
   */
  getRequiresRemoteScope(node: ts.Declaration): boolean { return this.remoteScoping.has(node); }

  /**
   * Set a component as requiring remote scoping.
   */
  setComponentAsRequiringRemoteScoping(node: ts.Declaration): void { this.remoteScoping.add(node); }

  /**
   * Look up the `ExportScope` of a given `Reference` to an NgModule.
   *
   * The NgModule in question may be declared locally in the current ts.Program, or it may be
   * declared in a .d.ts file.
   */
  private getExportedScope(ref: Reference<ts.Declaration>): ExportScope|null {
    if (ref.node.getSourceFile().isDeclarationFile) {
      // The NgModule is declared in a .d.ts file. Resolve it with the `DependencyScopeReader`.
      if (!ts.isClassDeclaration(ref.node)) {
        // TODO(alxhub): produce a ts.Diagnostic
        throw new Error(`Reference to an NgModule ${ref.debugName} which isn't a class?`);
      }
      return this.dependencyScopeReader.resolve(ref as Reference<ts.ClassDeclaration>);
    } else {
      // The NgModule is declared locally in the current program. Resolve it from the registry.
      return this.getScopeOfModule(ref.node);
    }
  }

  private assertCollecting(): void {
    if (this.sealed) {
      throw new Error(`Assertion: LocalModuleScopeRegistry is not COLLECTING`);
    }
  }
}
