/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ExternalExpr} from '@angular/compiler';
import * as ts from 'typescript';

import {ErrorCode, makeDiagnostic} from '../../diagnostics';
import {AliasGenerator, Reexport, Reference, ReferenceEmitter} from '../../imports';
import {DirectiveMeta, LocalMetadataRegistry, MetadataReader, MetadataRegistry, NgModuleMeta, PipeMeta} from '../../metadata';
import {ClassDeclaration} from '../../reflection';
import {identifierOfNode, nodeNameForError} from '../../util/src/typescript';

import {ExportScope, ScopeData} from './api';
import {DtsModuleScopeResolver} from './dependency';

export interface LocalNgModuleData {
  declarations: Reference<ClassDeclaration>[];
  imports: Reference<ClassDeclaration>[];
  exports: Reference<ClassDeclaration>[];
}

export interface LocalModuleScope extends ExportScope {
  compilation: ScopeData;
  reexports: Reexport[]|null;
}

/**
 * Information about the compilation scope of a registered declaration.
 */
export interface CompilationScope extends ScopeData {
  /** The declaration whose compilation scope is described here. */
  declaration: ClassDeclaration;
  /** The declaration of the NgModule that declares this `declaration`. */
  ngModule: ClassDeclaration;
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
 *
 * The `LocalModuleScopeRegistry` is also capable of producing `ts.Diagnostic` errors when Angular
 * semantics are violated.
 */
export class LocalModuleScopeRegistry implements MetadataRegistry {
  /**
   * Tracks whether the registry has been asked to produce scopes for a module or component. Once
   * this is true, the registry cannot accept registrations of new directives/pipes/modules as it
   * would invalidate the cached scope data.
   */
  private sealed = false;

  /**
   * A map of components from the current compilation unit to the NgModule which declared them.
   *
   * As components and directives are not distinguished at the NgModule level, this map may also
   * contain directives. This doesn't cause any problems but isn't useful as there is no concept of
   * a directive's compilation scope.
   */
  private declarationToModule = new Map<ClassDeclaration, ClassDeclaration>();

  private moduleToRef = new Map<ClassDeclaration, Reference<ClassDeclaration>>();

  /**
   * A cache of calculated `LocalModuleScope`s for each NgModule declared in the current program.
   *
   * A value of `undefined` indicates the scope was invalid and produced errors (therefore,
   * diagnostics should exist in the `scopeErrors` map).
   */
  private cache = new Map<ClassDeclaration, LocalModuleScope|undefined|null>();

  /**
   * Tracks whether a given component requires "remote scoping".
   *
   * Remote scoping is when the set of directives which apply to a given component is set in the
   * NgModule's file instead of directly on the ngComponentDef (which is sometimes needed to get
   * around cyclic import issues). This is not used in calculation of `LocalModuleScope`s, but is
   * tracked here for convenience.
   */
  private remoteScoping = new Set<ClassDeclaration>();

  /**
   * Tracks errors accumulated in the processing of scopes for each module declaration.
   */
  private scopeErrors = new Map<ClassDeclaration, ts.Diagnostic[]>();

  constructor(
      private localReader: MetadataReader, private dependencyScopeReader: DtsModuleScopeResolver,
      private refEmitter: ReferenceEmitter, private aliasGenerator: AliasGenerator|null) {}

  /**
   * Add an NgModule's data to the registry.
   */
  registerNgModuleMetadata(data: NgModuleMeta): void {
    this.assertCollecting();
    this.moduleToRef.set(data.ref.node, data.ref);
    for (const decl of data.declarations) {
      this.declarationToModule.set(decl.node, data.ref.node);
    }
  }

  registerDirectiveMetadata(directive: DirectiveMeta): void {}

  registerPipeMetadata(pipe: PipeMeta): void {}

  getScopeForComponent(clazz: ClassDeclaration): LocalModuleScope|null {
    if (!this.declarationToModule.has(clazz)) {
      return null;
    }
    return this.getScopeOfModule(this.declarationToModule.get(clazz) !);
  }

  /**
   * Collects registered data for a module and its directives/pipes and convert it into a full
   * `LocalModuleScope`.
   *
   * This method implements the logic of NgModule imports and exports. It returns the
   * `LocalModuleScope` for the given NgModule if one can be produced, and `null` if no scope is
   * available or the scope contains errors.
   */
  getScopeOfModule(clazz: ClassDeclaration): LocalModuleScope|null {
    const scope = this.moduleToRef.has(clazz) ?
        this.getScopeOfModuleReference(this.moduleToRef.get(clazz) !) :
        null;
    // Translate undefined -> null.
    return scope !== undefined ? scope : null;
  }

  /**
   * Retrieves any `ts.Diagnostic`s produced during the calculation of the `LocalModuleScope` for
   * the given NgModule, or `null` if no errors were present.
   */
  getDiagnosticsOfModule(clazz: ClassDeclaration): ts.Diagnostic[]|null {
    // Required to ensure the errors are populated for the given class. If it has been processed
    // before, this will be a no-op due to the scope cache.
    this.getScopeOfModule(clazz);

    if (this.scopeErrors.has(clazz)) {
      return this.scopeErrors.get(clazz) !;
    } else {
      return null;
    }
  }

  /**
   * Returns a collection of the compilation scope for each registered declaration.
   */
  getCompilationScopes(): CompilationScope[] {
    const scopes: CompilationScope[] = [];
    this.declarationToModule.forEach((ngModule, declaration) => {
      const scope = this.getScopeOfModule(ngModule);
      if (scope !== null) {
        scopes.push({declaration, ngModule, ...scope.compilation});
      }
    });
    return scopes;
  }

  /**
   * Implementation of `getScopeOfModule` which accepts a reference to a class and differentiates
   * between:
   *
   * * no scope being available (returns `null`)
   * * a scope being produced with errors (returns `undefined`).
   */
  private getScopeOfModuleReference(ref: Reference<ClassDeclaration>): LocalModuleScope|null
      |undefined {
    if (this.cache.has(ref.node)) {
      return this.cache.get(ref.node);
    }

    // Seal the registry to protect the integrity of the `LocalModuleScope` cache.
    this.sealed = true;

    // `ref` should be an NgModule previously added to the registry. If not, a scope for it
    // cannot be produced.
    const ngModule = this.localReader.getNgModuleMetadata(ref);
    if (ngModule === null) {
      this.cache.set(ref.node, null);
      return null;
    }

    // Errors produced during computation of the scope are recorded here. At the end, if this array
    // isn't empty then `undefined` will be cached and returned to indicate this scope is invalid.
    const diagnostics: ts.Diagnostic[] = [];

    // At this point, the goal is to produce two distinct transitive sets:
    // - the directives and pipes which are visible to components declared in the NgModule.
    // - the directives and pipes which are exported to any NgModules which import this one.

    // Directives and pipes in the compilation scope.
    const compilationDirectives = new Map<ts.Declaration, DirectiveMeta>();
    const compilationPipes = new Map<ts.Declaration, PipeMeta>();

    const declared = new Set<ts.Declaration>();
    const sourceFile = ref.node.getSourceFile();

    // Directives and pipes exported to any importing NgModules.
    const exportDirectives = new Map<ts.Declaration, DirectiveMeta>();
    const exportPipes = new Map<ts.Declaration, PipeMeta>();

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
      const directive = this.localReader.getDirectiveMetadata(decl);
      const pipe = this.localReader.getPipeMetadata(decl);
      if (directive !== null) {
        compilationDirectives.set(decl.node, {...directive, ref: decl});
      } else if (pipe !== null) {
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
      const importScope = this.getExportedScope(decl, diagnostics, ref.node, 'import');
      if (importScope === null) {
        // An import wasn't an NgModule, so record an error.
        diagnostics.push(invalidRef(ref.node, decl, 'import'));
        continue;
      } else if (importScope === undefined) {
        // An import was an NgModule but contained errors of its own. Record this as an error too,
        // because this scope is always going to be incorrect if one of its imports could not be
        // read.
        diagnostics.push(invalidTransitiveNgModuleRef(ref.node, decl, 'import'));
        continue;
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
      const importScope = this.getExportedScope(decl, diagnostics, ref.node, 'export');
      if (importScope === undefined) {
        // An export was an NgModule but contained errors of its own. Record this as an error too,
        // because this scope is always going to be incorrect if one of its exports could not be
        // read.
        diagnostics.push(invalidTransitiveNgModuleRef(ref.node, decl, 'export'));
        continue;
      } else if (importScope !== null) {
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
        if (this.localReader.getDirectiveMetadata(decl) !== null ||
            this.localReader.getPipeMetadata(decl) !== null) {
          diagnostics.push(invalidReexport(ref.node, decl));
        } else {
          diagnostics.push(invalidRef(ref.node, decl, 'export'));
        }
        continue;
      }
    }

    const exported = {
      directives: Array.from(exportDirectives.values()),
      pipes: Array.from(exportPipes.values()),
    };

    let reexports: Reexport[]|null = null;
    if (this.aliasGenerator !== null) {
      reexports = [];
      const addReexport = (ref: Reference<ClassDeclaration>) => {
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

    // Check if this scope had any errors during production.
    if (diagnostics.length > 0) {
      // Cache undefined, to mark the fact that the scope is invalid.
      this.cache.set(ref.node, undefined);

      // Save the errors for retrieval.
      this.scopeErrors.set(ref.node, diagnostics);

      // Return undefined to indicate the scope is invalid.
      this.cache.set(ref.node, undefined);
      return undefined;
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
    this.cache.set(ref.node, scope);
    return scope;
  }

  /**
   * Check whether a component requires remote scoping.
   */
  getRequiresRemoteScope(node: ClassDeclaration): boolean { return this.remoteScoping.has(node); }

  /**
   * Set a component as requiring remote scoping.
   */
  setComponentAsRequiringRemoteScoping(node: ClassDeclaration): void {
    this.remoteScoping.add(node);
  }

  /**
   * Look up the `ExportScope` of a given `Reference` to an NgModule.
   *
   * The NgModule in question may be declared locally in the current ts.Program, or it may be
   * declared in a .d.ts file.
   *
   * @returns `null` if no scope could be found, or `undefined` if an invalid scope
   * was found.
   *
   * May also contribute diagnostics of its own by adding to the given `diagnostics`
   * array parameter.
   */
  private getExportedScope(
      ref: Reference<ClassDeclaration>, diagnostics: ts.Diagnostic[],
      ownerForErrors: ts.Declaration, type: 'import'|'export'): ExportScope|null|undefined {
    if (ref.node.getSourceFile().isDeclarationFile) {
      // The NgModule is declared in a .d.ts file. Resolve it with the `DependencyScopeReader`.
      if (!ts.isClassDeclaration(ref.node)) {
        // The NgModule is in a .d.ts file but is not declared as a ts.ClassDeclaration. This is an
        // error in the .d.ts metadata.
        const code = type === 'import' ? ErrorCode.NGMODULE_INVALID_IMPORT :
                                         ErrorCode.NGMODULE_INVALID_EXPORT;
        diagnostics.push(makeDiagnostic(
            code, identifierOfNode(ref.node) || ref.node,
            `Appears in the NgModule.${type}s of ${nodeNameForError(ownerForErrors)}, but could not be resolved to an NgModule`));
        return undefined;
      }
      return this.dependencyScopeReader.resolve(ref);
    } else {
      // The NgModule is declared locally in the current program. Resolve it from the registry.
      return this.getScopeOfModuleReference(ref);
    }
  }

  private assertCollecting(): void {
    if (this.sealed) {
      throw new Error(`Assertion: LocalModuleScopeRegistry is not COLLECTING`);
    }
  }
}

/**
 * Produce a `ts.Diagnostic` for an invalid import or export from an NgModule.
 */
function invalidRef(
    clazz: ts.Declaration, decl: Reference<ts.Declaration>,
    type: 'import' | 'export'): ts.Diagnostic {
  const code =
      type === 'import' ? ErrorCode.NGMODULE_INVALID_IMPORT : ErrorCode.NGMODULE_INVALID_EXPORT;
  const resolveTarget = type === 'import' ? 'NgModule' : 'NgModule, Component, Directive, or Pipe';
  return makeDiagnostic(
      code, identifierOfNode(decl.node) || decl.node,
      `Appears in the NgModule.${type}s of ${nodeNameForError(clazz)}, but could not be resolved to an ${resolveTarget} class`);
}

/**
 * Produce a `ts.Diagnostic` for an import or export which itself has errors.
 */
function invalidTransitiveNgModuleRef(
    clazz: ts.Declaration, decl: Reference<ts.Declaration>,
    type: 'import' | 'export'): ts.Diagnostic {
  const code =
      type === 'import' ? ErrorCode.NGMODULE_INVALID_IMPORT : ErrorCode.NGMODULE_INVALID_EXPORT;
  return makeDiagnostic(
      code, identifierOfNode(decl.node) || decl.node,
      `Appears in the NgModule.${type}s of ${nodeNameForError(clazz)}, but itself has errors`);
}

/**
 * Produce a `ts.Diagnostic` for an exported directive or pipe which was not declared or imported
 * by the NgModule in question.
 */
function invalidReexport(clazz: ts.Declaration, decl: Reference<ts.Declaration>): ts.Diagnostic {
  return makeDiagnostic(
      ErrorCode.NGMODULE_INVALID_REEXPORT, identifierOfNode(decl.node) || decl.node,
      `Present in the NgModule.exports of ${nodeNameForError(clazz)} but neither declared nor imported`);
}
