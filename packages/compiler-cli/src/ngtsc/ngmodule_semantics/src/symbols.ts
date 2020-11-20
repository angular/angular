/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AbsoluteFsPath} from '../../file_system';
import {ClassDeclaration} from '../../reflection';

import {Affects, DistributionContext, InvalidationFlags, SemanticSymbol, SymbolResolver} from './api';
import {isArrayEqual, isSetEqual, isSymbolEqual} from './util';

/**
 * Shared superclass for Angular declarations, i.e. pipes, directives and components.
 */
export abstract class DeclarationSymbol extends SemanticSymbol {
  /**
   * Records the NgModule symbols that declare this declaration.
   *
   * Note: this is restricted to a single NgModule but we track it in a Set to allow capturing
   * the error situation where a declaration is declared multiple times.
   */
  readonly declaredIn = new Set<NgModuleSymbol>();

  /**
   * Records the NgModule symbols that export this declaration.
   */
  readonly exportedBy = new Set<NgModuleSymbol>();

  distribute(affected: SemanticSymbol, affects: Affects, context: DistributionContext): void {
    // If this symbol is notified of the fact that the module scope is affected, the declaration
    // itself must be re-emitted and type-checked.
    if (affects & Affects.ModuleScope) {
      context.invalidate(this, InvalidationFlags.Emit | InvalidationFlags.TypeCheck);
    }

    if (affected !== this) {
      // This declaration is not itself affected, which means that we don't have to distribute
      // any further.
      return;
    }

    // If the symbol itself affects the module scope or remote scope, then distribute this fact to
    // the declaring NgModule.
    const ngModuleImpact = affects & (Affects.ModuleScope | Affects.RemoteScope);
    if (ngModuleImpact) {
      for (const ngModule of this.declaredIn) {
        context.distributeTo(ngModule, affected, ngModuleImpact);
      }
    }

    if (affects & Affects.ModuleScope) {
      // If the module scope is affected, then also distribute to all NgModules from which this
      // declaration is exported.
      for (const ngModule of this.exportedBy) {
        context.distributeTo(ngModule, affected, Affects.ModuleExports);
      }
    }
  }
}

/**
 * Represents an Angular pipe.
 */
export class PipeSymbol extends DeclarationSymbol {
  constructor(
      path: AbsoluteFsPath, decl: ClassDeclaration, symbolName: string|null,
      public readonly name: string) {
    super(path, decl, symbolName);
  }

  diff(previousSymbol: SemanticSymbol): Affects {
    if (!(previousSymbol instanceof PipeSymbol)) {
      return Affects.All;
    }

    let result = Affects.None;

    // The module scope is affected when the pipe is renamed.
    if (this.name !== previousSymbol.name) {
      result |= Affects.ModuleScope;
    }

    return result;
  }
}

/**
 * Represents both directives and components.
 */
export class DirectiveSymbol extends DeclarationSymbol {
  private isRemoteScoped!: boolean;

  constructor(
      path: AbsoluteFsPath, decl: ClassDeclaration, symbolName: string|null,
      public readonly isComponent: boolean, public readonly selector: string|null,
      public readonly inputs: string[], public readonly outputs: string[],
      public readonly exportAs: string[]|null) {
    super(path, decl, symbolName);
  }

  connect(resolve: SymbolResolver, remoteScoped: ReadonlySet<SemanticSymbol>): void {
    this.isRemoteScoped = remoteScoped.has(this);
  }

  diff(previousSymbol: SemanticSymbol): Affects {
    if (!(previousSymbol instanceof DirectiveSymbol)) {
      return Affects.All;
    }

    let result = Affects.None;

    // The module scope is affected if the public API surface of the declaration has changed.
    if (this.selector !== previousSymbol.selector ||
        !isArrayEqual(this.inputs, previousSymbol.inputs) ||
        !isArrayEqual(this.outputs, previousSymbol.outputs) ||
        !isArrayEqual(this.exportAs, previousSymbol.exportAs)) {
      result |= Affects.ModuleScope;
    }

    // The remote scoping feature is affected if remote scoping was either activated or deactivated
    // for this directive.
    if (this.isRemoteScoped !== previousSymbol.isRemoteScoped) {
      result |= Affects.RemoteScope;
    }

    // When a declaration is removed from an NgModule we need to re-emit components as their
    // compilation scope is affected, but there is no longer a dependency edge from the NgModule
    // to the component. As such, the component itself needs to identify this situation.
    if (this.isComponent &&
        !isSetEqual(this.declaredIn, previousSymbol.declaredIn, isSymbolEqual)) {
      result |= Affects.ModuleScope;
    }

    return result;
  }
}

/**
 * Represents an Angular NgModule.
 */
export class NgModuleSymbol extends SemanticSymbol {
  declarations!: ReadonlyArray<SemanticSymbol>;
  imports!: ReadonlyArray<SemanticSymbol>;
  exports!: ReadonlyArray<SemanticSymbol>;

  /**
   * Records all NgModule symbols that import this NgModule.
   */
  importedBy = new Set<NgModuleSymbol>();

  exportedBy = new Set<NgModuleSymbol>();

  constructor(
      path: AbsoluteFsPath, decl: ClassDeclaration, symbolName: string|null,
      private readonly rawDeclarations: ClassDeclaration[],
      private readonly rawImports: ClassDeclaration[],
      private readonly rawExports: ClassDeclaration[]) {
    super(path, decl, symbolName);
  }

  connect(resolve: SymbolResolver): void {
    this.declarations = this.rawDeclarations.map(resolve);
    this.imports = this.rawImports.map(resolve);
    this.exports = this.rawExports.map(resolve);

    for (const declaration of this.declarations) {
      if (declaration instanceof DeclarationSymbol) {
        declaration.declaredIn.add(this);
      }
    }

    for (const imported of this.imports) {
      if (imported instanceof NgModuleSymbol) {
        imported.importedBy.add(this);
      }
    }

    for (const exported of this.exports) {
      if (exported instanceof DeclarationSymbol) {
        exported.exportedBy.add(this);
      } else if (exported instanceof NgModuleSymbol) {
        exported.exportedBy.add(this);
      }
    }
  }

  diff(previousSymbol: SemanticSymbol): Affects {
    if (!(previousSymbol instanceof NgModuleSymbol)) {
      return Affects.All;
    }

    let result = Affects.None;

    // The own module scope is affected if the declarations have changed, or the imports have
    // changed.
    if (!isArrayEqual(this.declarations, previousSymbol.declarations, isSymbolEqual) ||
        !isArrayEqual(this.imports, previousSymbol.imports, isSymbolEqual)) {
      result |= Affects.ModuleScope;
    }

    // The module's exports have changed if the list of exports has changed.
    if (!isArrayEqual(this.exports, previousSymbol.exports, isSymbolEqual)) {
      result |= Affects.ModuleExports;
    }

    return result;
  }

  distribute(affected: SemanticSymbol, affects: Affects, context: DistributionContext): void {
    if (affects & Affects.RemoteScope && this.declarations.indexOf(affected) !== -1) {
      // The remote scope was affected and this NgModule declares the affected component, so
      // this NgModule must be re-emitted to introduce/remove the remote scoping instruction.
      context.invalidate(this, InvalidationFlags.Emit);
    }

    if (affects & Affects.ModuleScope) {
      // Notify all components of the fact that the module scope is affected.
      for (const declaration of this.declarations) {
        if (declaration instanceof DirectiveSymbol && declaration.isComponent) {
          context.distributeTo(declaration, affected, Affects.ModuleScope);
        }
      }
    }

    if (affects & Affects.ModuleExports || this.exports.indexOf(affected) !== -1) {
      // If the module exports are affected, or the affected symbol is exported from this module,
      // then we need to notify all importing modules as their scope is also affected.

      // Distribute the transitive impact to those NgModules that import this one.
      for (const ngModule of this.importedBy) {
        context.distributeTo(ngModule, ngModule, Affects.ModuleScope);
      }

      // The NgModules that export this module are not directly affected (exporting a module does
      // not add the module to the compilation scope), but the NgModules that import from these
      // NgModules are affected.
      for (const ngModule of this.exportedBy) {
        context.distributeTo(ngModule, ngModule, Affects.ModuleExports);
      }
    }
  }
}
