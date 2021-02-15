/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Expression, ExternalExpr} from '@angular/compiler';
import * as ts from 'typescript';

import {UnifiedModulesHost} from '../../core/api';
import {ClassDeclaration, ReflectionHost} from '../../reflection';

import {EmittedReference, ImportFlags, ReferenceEmitStrategy} from './emitter';
import {Reference} from './references';


// Escape anything that isn't alphanumeric, '/' or '_'.
const CHARS_TO_ESCAPE = /[^a-zA-Z0-9/_]/g;

/**
 * A host for the aliasing system, which allows for alternative exports/imports of directives/pipes.
 *
 * Given an import of an NgModule (e.g. `CommonModule`), the compiler must generate imports to the
 * directives and pipes exported by this module (e.g. `NgIf`) when they're used in a particular
 * template. In its default configuration, if the compiler is not directly able to import the
 * component from another file within the same project, it will attempt to import the component
 * from the same (absolute) path by which the module was imported. So in the above example if
 * `CommonModule` was imported from '@angular/common', the compiler will attempt to import `NgIf`
 * from '@angular/common' as well.
 *
 * The aliasing system interacts with the above logic in two distinct ways.
 *
 * 1) It can be used to create "alias" re-exports from different files, which can be used when the
 *    user hasn't exported the directive(s) from the ES module containing the NgModule. These re-
 *    exports can also be helpful when using a `UnifiedModulesHost`, which overrides the import
 *    logic described above.
 *
 * 2) It can be used to get an alternative import expression for a directive or pipe, instead of
 *    the import that the normal logic would apply. The alias used depends on the provenance of the
 *    `Reference` which was obtained for the directive/pipe, which is usually a property of how it
 *    came to be in a template's scope (e.g. by which NgModule).
 *
 * See the README.md for more information on how aliasing works within the compiler.
 */
export interface AliasingHost {
  /**
   * Controls whether any alias re-exports are rendered into .d.ts files.
   *
   * This is not always necessary for aliasing to function correctly, so this flag allows an
   * `AliasingHost` to avoid cluttering the .d.ts files if exports are not strictly needed.
   */
  readonly aliasExportsInDts: boolean;

  /**
   * Determine a name by which `decl` should be re-exported from `context`, depending on the
   * particular set of aliasing rules in place.
   *
   * `maybeAliasSymbolAs` can return `null`, in which case no alias export should be generated.
   *
   * @param ref a `Reference` to the directive/pipe to consider for aliasing.
   * @param context the `ts.SourceFile` in which the alias re-export might need to be generated.
   * @param ngModuleName the declared name of the `NgModule` within `context` for which the alias
   * would be generated.
   * @param isReExport whether the directive/pipe under consideration is re-exported from another
   * NgModule (as opposed to being declared by it directly).
   */
  maybeAliasSymbolAs(
      ref: Reference<ClassDeclaration>, context: ts.SourceFile, ngModuleName: string,
      isReExport: boolean): string|null;

  /**
   * Determine an `Expression` by which `decl` should be imported from `via` using an alias export
   * (which should have been previously created when compiling `via`).
   *
   * `getAliasIn` can return `null`, in which case no alias is needed to import `decl` from `via`
   * (and the normal import rules should be used).
   *
   * @param decl the declaration of the directive/pipe which is being imported, and which might be
   * aliased.
   * @param via the `ts.SourceFile` which might contain an alias to the
   */
  getAliasIn(decl: ClassDeclaration, via: ts.SourceFile, isReExport: boolean): Expression|null;
}

/**
 * An `AliasingHost` which generates and consumes alias re-exports when module names for each file
 * are determined by a `UnifiedModulesHost`.
 *
 * When using a `UnifiedModulesHost`, aliasing prevents issues with transitive dependencies. See the
 * README.md for more details.
 */
export class UnifiedModulesAliasingHost implements AliasingHost {
  constructor(private unifiedModulesHost: UnifiedModulesHost) {}

  /**
   * With a `UnifiedModulesHost`, aliases are chosen automatically without the need to look through
   * the exports present in a .d.ts file, so we can avoid cluttering the .d.ts files.
   */
  readonly aliasExportsInDts = false;

  maybeAliasSymbolAs(
      ref: Reference<ClassDeclaration>, context: ts.SourceFile, ngModuleName: string,
      isReExport: boolean): string|null {
    if (!isReExport) {
      // Aliasing is used with a UnifiedModulesHost to prevent transitive dependencies. Thus,
      // aliases
      // only need to be created for directives/pipes which are not direct declarations of an
      // NgModule which exports them.
      return null;
    }
    return this.aliasName(ref.node, context);
  }

  /**
   * Generates an `Expression` to import `decl` from `via`, assuming an export was added when `via`
   * was compiled per `maybeAliasSymbolAs` above.
   */
  getAliasIn(decl: ClassDeclaration, via: ts.SourceFile, isReExport: boolean): Expression|null {
    if (!isReExport) {
      // Directly exported directives/pipes don't require an alias, per the logic in
      // `maybeAliasSymbolAs`.
      return null;
    }
    // viaModule is the module it'll actually be imported from.
    const moduleName = this.unifiedModulesHost.fileNameToModuleName(via.fileName, via.fileName);
    return new ExternalExpr({moduleName, name: this.aliasName(decl, via)});
  }

  /**
   * Generates an alias name based on the full module name of the file which declares the aliased
   * directive/pipe.
   */
  private aliasName(decl: ClassDeclaration, context: ts.SourceFile): string {
    // The declared module is used to get the name of the alias.
    const declModule = this.unifiedModulesHost.fileNameToModuleName(
        decl.getSourceFile().fileName, context.fileName);

    const replaced = declModule.replace(CHARS_TO_ESCAPE, '_').replace(/\//g, '$');
    return 'ɵng$' + replaced + '$$' + decl.name.text;
  }
}

/**
 * An `AliasingHost` which exports directives from any file containing an NgModule in which they're
 * declared/exported, under a private symbol name.
 *
 * These exports support cases where an NgModule is imported deeply from an absolute module path
 * (that is, it's not part of an Angular Package Format entrypoint), and the compiler needs to
 * import any matched directives/pipes from the same path (to the NgModule file). See README.md for
 * more details.
 */
export class PrivateExportAliasingHost implements AliasingHost {
  constructor(private host: ReflectionHost) {}

  /**
   * Under private export aliasing, the `AbsoluteModuleStrategy` used for emitting references will
   * will select aliased exports that it finds in the .d.ts file for an NgModule's file. Thus,
   * emitting these exports in .d.ts is a requirement for the `PrivateExportAliasingHost` to
   * function correctly.
   */
  readonly aliasExportsInDts = true;

  maybeAliasSymbolAs(
      ref: Reference<ClassDeclaration>, context: ts.SourceFile, ngModuleName: string): string|null {
    if (ref.hasOwningModuleGuess) {
      // Skip nodes that already have an associated absolute module specifier, since they can be
      // safely imported from that specifier.
      return null;
    }
    // Look for a user-provided export of `decl` in `context`. If one exists, then an alias export
    // is not needed.
    // TODO(alxhub): maybe add a host method to check for the existence of an export without going
    // through the entire list of exports.
    const exports = this.host.getExportsOfModule(context);
    if (exports === null) {
      // Something went wrong, and no exports were available at all. Bail rather than risk creating
      // re-exports when they're not needed.
      throw new Error(`Could not determine the exports of: ${context.fileName}`);
    }
    let found: boolean = false;
    exports.forEach(value => {
      if (value.node === ref.node) {
        found = true;
      }
    });
    if (found) {
      // The module exports the declared class directly, no alias is necessary.
      return null;
    }
    return `ɵngExportɵ${ngModuleName}ɵ${ref.node.name.text}`;
  }

  /**
   * A `PrivateExportAliasingHost` only generates re-exports and does not direct the compiler to
   * directly consume the aliases it creates.
   *
   * Instead, they're consumed indirectly: `AbsoluteModuleStrategy` `ReferenceEmitterStrategy` will
   * select these alias exports automatically when looking for an export of the directive/pipe from
   * the same path as the NgModule was imported.
   *
   * Thus, `getAliasIn` always returns `null`.
   */
  getAliasIn(): null {
    return null;
  }
}

/**
 * A `ReferenceEmitStrategy` which will consume the alias attached to a particular `Reference` to a
 * directive or pipe, if it exists.
 */
export class AliasStrategy implements ReferenceEmitStrategy {
  emit(ref: Reference, context: ts.SourceFile, importMode: ImportFlags): EmittedReference|null {
    if (importMode & ImportFlags.NoAliasing || ref.alias === null) {
      return null;
    }

    return {expression: ref.alias, importedFile: 'unknown'};
  }
}
