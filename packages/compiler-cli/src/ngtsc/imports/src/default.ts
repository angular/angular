/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {getSourceFile} from '../../util/src/typescript';

/**
 * Registers and records usages of `ts.Identifer`s that came from default import statements.
 *
 * See `DefaultImportTracker` for details.
 */
export interface DefaultImportRecorder {
  /**
   * Record an association between a `ts.Identifier` which might be emitted and the
   * `ts.ImportDeclaration` from which it came.
   *
   * Alone, this method has no effect as the `ts.Identifier` might not be used in the output.
   * The identifier must later be marked as used with `recordUsedIdentifier` in order for its
   * import to be preserved.
   */
  recordImportedIdentifier(id: ts.Identifier, decl: ts.ImportDeclaration): void;

  /**
   * Record the fact that the given `ts.Identifer` will be emitted, and thus its
   * `ts.ImportDeclaration`, if it was a previously registered default import, must be preserved.
   *
   * This method can be called safely for any `ts.Identifer`, regardless of its origin. It will only
   * have an effect if the identifier came from a `ts.ImportDeclaration` default import which was
   * previously registered with `recordImportedIdentifier`.
   */
  recordUsedIdentifier(id: ts.Identifier): void;
}

/**
 * An implementation of `DefaultImportRecorder` which does nothing.
 *
 * This is useful when default import tracking isn't required, such as when emitting .d.ts code
 * or for ngcc.
 */
export const NOOP_DEFAULT_IMPORT_RECORDER: DefaultImportRecorder = {
  recordImportedIdentifier: (id: ts.Identifier) => void{},
  recordUsedIdentifier: (id: ts.Identifier) => void{},
};

/**
 * TypeScript has trouble with generating default imports inside of transformers for some module
 * formats. The issue is that for the statement:
 *
 * import X from 'some/module';
 * console.log(X);
 *
 * TypeScript will not use the "X" name in generated code. For normal user code, this is fine
 * because references to X will also be renamed. However, if both the import and any references are
 * added in a transformer, TypeScript does not associate the two, and will leave the "X" references
 * dangling while renaming the import variable. The generated code looks something like:
 *
 * const module_1 = require('some/module');
 * console.log(X); // now X is a dangling reference.
 *
 * Therefore, we cannot synthetically add default imports, and must reuse the imports that users
 * include. Doing this poses a challenge for imports that are only consumed in the type position in
 * the user's code. If Angular reuses the imported symbol in a value position (for example, we
 * see a constructor parameter of type Foo and try to write "inject(Foo)") we will also end up with
 * a dangling reference, as TS will elide the import because it was only used in the type position
 * originally.
 *
 * To avoid this, the compiler must "touch" the imports with `ts.getMutableClone`, and should
 * only do this for imports which are actually consumed. The `DefaultImportTracker` keeps track of
 * these imports as they're encountered and emitted, and implements a transform which can correctly
 * flag the imports as required.
 *
 * This problem does not exist for non-default imports as the compiler can easily insert
 * "import * as X" style imports for those, and the "X" identifier survives transformation.
 */
export class DefaultImportTracker implements DefaultImportRecorder {
  /**
   * A `Map` which tracks the `Map` of default import `ts.Identifier`s to their
   * `ts.ImportDeclaration`s. These declarations are not guaranteed to be used.
   */
  private sourceFileToImportMap =
      new Map<ts.SourceFile, Map<ts.Identifier, ts.ImportDeclaration>>();

  /**
   * A `Map` which tracks the `Set` of `ts.ImportDeclaration`s for default imports that were used in
   * a given `ts.SourceFile` and need to be preserved.
   */
  private sourceFileToUsedImports = new Map<ts.SourceFile, Set<ts.ImportDeclaration>>();
  recordImportedIdentifier(id: ts.Identifier, decl: ts.ImportDeclaration): void {
    const sf = getSourceFile(id);
    if (!this.sourceFileToImportMap.has(sf)) {
      this.sourceFileToImportMap.set(sf, new Map<ts.Identifier, ts.ImportDeclaration>());
    }
    this.sourceFileToImportMap.get(sf)!.set(id, decl);
  }

  recordUsedIdentifier(id: ts.Identifier): void {
    const sf = getSourceFile(id);
    if (!this.sourceFileToImportMap.has(sf)) {
      // The identifier's source file has no registered default imports at all.
      return;
    }
    const identiferToDeclaration = this.sourceFileToImportMap.get(sf)!;
    if (!identiferToDeclaration.has(id)) {
      // The identifier isn't from a registered default import.
      return;
    }
    const decl = identiferToDeclaration.get(id)!;

    // Add the default import declaration to the set of used import declarations for the file.
    if (!this.sourceFileToUsedImports.has(sf)) {
      this.sourceFileToUsedImports.set(sf, new Set<ts.ImportDeclaration>());
    }
    this.sourceFileToUsedImports.get(sf)!.add(decl);
  }

  /**
   * Get a `ts.TransformerFactory` which will preserve default imports that were previously marked
   * as used.
   *
   * This transformer must run after any other transformers which call `recordUsedIdentifier`.
   */
  importPreservingTransformer(): ts.TransformerFactory<ts.SourceFile> {
    return (context: ts.TransformationContext) => {
      return (sf: ts.SourceFile) => {
        return this.transformSourceFile(sf);
      };
    };
  }

  /**
   * Process a `ts.SourceFile` and replace any `ts.ImportDeclaration`s.
   */
  private transformSourceFile(sf: ts.SourceFile): ts.SourceFile {
    const originalSf = ts.getOriginalNode(sf) as ts.SourceFile;
    // Take a fast path if no import declarations need to be preserved in the file.
    if (!this.sourceFileToUsedImports.has(originalSf)) {
      return sf;
    }

    // There are declarations that need to be preserved.
    const importsToPreserve = this.sourceFileToUsedImports.get(originalSf)!;

    // Generate a new statement list which preserves any imports present in `importsToPreserve`.
    const statements = sf.statements.map(stmt => {
      if (ts.isImportDeclaration(stmt) && importsToPreserve.has(stmt)) {
        // Preserving an import that's marked as unreferenced (type-only) is tricky in TypeScript.
        //
        // Various approaches have been tried, with mixed success:
        //
        // 1. Using `ts.updateImportDeclaration` does not cause the import to be retained.
        //
        // 2. Using `ts.createImportDeclaration` with the same `ts.ImportClause` causes the import
        //    to correctly be retained, but when emitting CommonJS module format code, references
        //    to the imported value will not match the import variable.
        //
        // 3. Emitting "import * as" imports instead generates the correct import variable, but
        //    references are missing the ".default" access. This happens to work for tsickle code
        //    with goog.module transformations as tsickle strips the ".default" anyway.
        //
        // 4. It's possible to trick TypeScript by setting `ts.NodeFlag.Synthesized` on the import
        //    declaration. This causes the import to be correctly retained and generated, but can
        //    violate invariants elsewhere in the compiler and cause crashes.
        //
        // 5. Using `ts.getMutableClone` seems to correctly preserve the import and correctly
        //    generate references to the import variable across all module types.
        //
        // Therefore, option 5 is the one used here. It seems to be implemented as the correct way
        // to perform option 4, which preserves all the compiler's invariants.
        //
        // TODO(alxhub): discuss with the TypeScript team and determine if there's a better way to
        // deal with this issue.
        stmt = ts.getMutableClone(stmt);
      }
      return stmt;
    });

    // Save memory - there's no need to keep these around once the transform has run for the given
    // file.
    this.sourceFileToImportMap.delete(originalSf);
    this.sourceFileToUsedImports.delete(originalSf);

    return ts.updateSourceFileNode(sf, statements);
  }
}
