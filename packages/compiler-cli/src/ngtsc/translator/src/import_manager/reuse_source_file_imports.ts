/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {AliasImportDeclaration} from '../../../imports';
import {ImportRequest} from '../api/import_generator';

/**
 * Tracker necessary for enabling re-use of original source file imports.
 *
 * The tracker holds information about original source file imports that
 * need to be updated, or import declarations/specifiers that are now
 * referenced due to the import manager.
 */
export interface ReuseExistingSourceFileImportsTracker {
  /**
   * Map of import declarations that need to be updated to include the
   * given symbols.
   */
  updatedImports: Map<
    ts.ImportDeclaration,
    {propertyName: ts.Identifier; fileUniqueAlias: ts.Identifier | null}[]
  >;

  /**
   * Set of re-used alias import declarations.
   *
   * These are captured so that we can tell TypeScript to not elide these source file
   * imports as we introduced references to them. More details: {@link AliasImportDeclaration}.
   */
  reusedAliasDeclarations: Set<AliasImportDeclaration>;

  /** Generates a unique identifier for a name in the given file. */
  generateUniqueIdentifier(file: ts.SourceFile, symbolName: string): ts.Identifier | null;
}

/** Attempts to re-use original source file imports for the given request. */
export function attemptToReuseExistingSourceFileImports(
  tracker: ReuseExistingSourceFileImportsTracker,
  sourceFile: ts.SourceFile,
  request: ImportRequest<ts.SourceFile>,
): ts.Identifier | [ts.Identifier, ts.Identifier] | null {
  // Walk through all source-file top-level statements and search for import declarations
  // that already match the specified "moduleName" and can be updated to import the
  // given symbol. If no matching import can be found, the last import in the source-file
  // will be used as starting point for a new import that will be generated.
  let candidateImportToBeUpdated: ts.ImportDeclaration | null = null;

  for (let i = sourceFile.statements.length - 1; i >= 0; i--) {
    const statement = sourceFile.statements[i];

    if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) {
      continue;
    }

    // Side-effect imports are ignored, or type-only imports.
    // TODO: Consider re-using type-only imports efficiently.
    if (!statement.importClause || statement.importClause.isTypeOnly) {
      continue;
    }

    const moduleSpecifier = statement.moduleSpecifier.text;
    // If the import does not match the module name, or requested target file, continue.
    // Note: In the future, we may consider performing better analysis here. E.g. resolve paths,
    // or try to detect re-usable symbols via type-checking.
    if (moduleSpecifier !== request.exportModuleSpecifier) {
      continue;
    }

    if (statement.importClause.namedBindings) {
      const namedBindings = statement.importClause.namedBindings;

      // A namespace import can be reused.
      if (ts.isNamespaceImport(namedBindings)) {
        tracker.reusedAliasDeclarations.add(namedBindings);

        if (request.exportSymbolName === null) {
          return namedBindings.name;
        }

        return [namedBindings.name, ts.factory.createIdentifier(request.exportSymbolName)];
      }

      // Named imports can be re-used if a specific symbol is requested.
      if (ts.isNamedImports(namedBindings) && request.exportSymbolName !== null) {
        const existingElement = namedBindings.elements.find((e) => {
          // TODO: Consider re-using type-only imports efficiently.
          let nameMatches: boolean;

          if (request.unsafeAliasOverride) {
            // If a specific alias is passed, both the original name and alias have to match.
            nameMatches =
              e.propertyName?.text === request.exportSymbolName &&
              e.name.text === request.unsafeAliasOverride;
          } else {
            nameMatches = e.propertyName
              ? e.propertyName.text === request.exportSymbolName
              : e.name.text === request.exportSymbolName;
          }

          return !e.isTypeOnly && nameMatches;
        });

        if (existingElement !== undefined) {
          tracker.reusedAliasDeclarations.add(existingElement);
          return existingElement.name;
        }

        // In case the symbol could not be found in an existing import, we
        // keep track of the import declaration as it can be updated to include
        // the specified symbol name without having to create a new import.
        candidateImportToBeUpdated = statement;
      }
    }
  }

  if (candidateImportToBeUpdated === null || request.exportSymbolName === null) {
    return null;
  }

  // We have a candidate import. Update it to import what we need.
  if (!tracker.updatedImports.has(candidateImportToBeUpdated)) {
    tracker.updatedImports.set(candidateImportToBeUpdated, []);
  }
  const symbolsToBeImported = tracker.updatedImports.get(candidateImportToBeUpdated)!;
  const propertyName = ts.factory.createIdentifier(request.exportSymbolName);
  const fileUniqueAlias = request.unsafeAliasOverride
    ? ts.factory.createIdentifier(request.unsafeAliasOverride)
    : tracker.generateUniqueIdentifier(sourceFile, request.exportSymbolName);

  // Since it can happen that multiple classes need to be imported within the
  // specified source file and we want to add the identifiers to the existing
  // import declaration, we need to keep track of the updated import declarations.
  // We can't directly update the import declaration for each identifier as this
  // would not be reflected in the AST— or would throw of update recording offsets.
  symbolsToBeImported.push({
    propertyName,
    fileUniqueAlias,
  });

  return fileUniqueAlias ?? propertyName;
}
