/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {ExternalExpr} from '@angular/compiler';
import {ImportFlags, ReferenceEmitKind} from './emitter';
// Escape anything that isn't alphanumeric, '/' or '_'.
const CHARS_TO_ESCAPE = /[^a-zA-Z0-9/_]/g;
/**
 * An `AliasingHost` which generates and consumes alias re-exports when module names for each file
 * are determined by a `UnifiedModulesHost`.
 *
 * When using a `UnifiedModulesHost`, aliasing prevents issues with transitive dependencies. See the
 * README.md for more details.
 */
export class UnifiedModulesAliasingHost {
  unifiedModulesHost;
  constructor(unifiedModulesHost) {
    this.unifiedModulesHost = unifiedModulesHost;
  }
  /**
   * With a `UnifiedModulesHost`, aliases are chosen automatically without the need to look through
   * the exports present in a .d.ts file, so we can avoid cluttering the .d.ts files.
   */
  aliasExportsInDts = false;
  maybeAliasSymbolAs(ref, context, ngModuleName, isReExport) {
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
  getAliasIn(decl, via, isReExport) {
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
  aliasName(decl, context) {
    // The declared module is used to get the name of the alias.
    const declModule = this.unifiedModulesHost.fileNameToModuleName(
      decl.getSourceFile().fileName,
      context.fileName,
    );
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
export class PrivateExportAliasingHost {
  host;
  constructor(host) {
    this.host = host;
  }
  /**
   * Under private export aliasing, the `AbsoluteModuleStrategy` used for emitting references will
   * will select aliased exports that it finds in the .d.ts file for an NgModule's file. Thus,
   * emitting these exports in .d.ts is a requirement for the `PrivateExportAliasingHost` to
   * function correctly.
   */
  aliasExportsInDts = true;
  maybeAliasSymbolAs(ref, context, ngModuleName) {
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
    let found = false;
    exports.forEach((value) => {
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
  getAliasIn() {
    return null;
  }
}
/**
 * A `ReferenceEmitStrategy` which will consume the alias attached to a particular `Reference` to a
 * directive or pipe, if it exists.
 */
export class AliasStrategy {
  emit(ref, context, importMode) {
    if (importMode & ImportFlags.NoAliasing || ref.alias === null) {
      return null;
    }
    return {
      kind: ReferenceEmitKind.Success,
      expression: ref.alias,
      importedFile: 'unknown',
    };
  }
}
//# sourceMappingURL=alias.js.map
