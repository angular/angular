/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {dirname, resolve} from 'path';
import ts from 'typescript';

/** Update recorder for managing imports. */
export interface ImportManagerUpdateRecorder {
  addNewImport(start: number, importText: string): void;
  updateExistingImport(namedBindings: ts.NamedImports, newNamedBindings: string): void;
}

/** Possible types of quotes for imports. */
const enum QuoteStyle {
  Single,
  Double,
}

/**
 * Import manager that can be used to add TypeScript imports to given source
 * files. The manager ensures that multiple transformations are applied properly
 * without shifted offsets and that similar existing import declarations are re-used.
 */
export class ImportManager {
  /** Map of import declarations that need to be updated to include the given symbols. */
  private updatedImports =
      new Map<ts.ImportDeclaration, {propertyName?: ts.Identifier, importName: ts.Identifier}[]>();
  /** Map of source-files and their previously used identifier names. */
  private usedIdentifierNames = new Map<ts.SourceFile, string[]>();
  /** Map of source files and the new imports that have to be added to them. */
  private newImports: Map<ts.SourceFile, {
    importStartIndex: number,
    defaultImports: Map<string, ts.Identifier>,
    namedImports: Map<string, ts.ImportSpecifier[]>,
  }> = new Map();
  /** Map between a file and the implied quote style for imports. */
  private quoteStyles: Record<string, QuoteStyle> = {};

  /**
   * Array of previously resolved symbol imports. Cache can be re-used to return
   * the same identifier without checking the source-file again.
   */
  private importCache: {
    sourceFile: ts.SourceFile,
    symbolName: string|null,
    alias: string|null,
    moduleName: string,
    identifier: ts.Identifier
  }[] = [];

  constructor(
      private getUpdateRecorder: (sf: ts.SourceFile) => ImportManagerUpdateRecorder,
      private printer: ts.Printer) {}

  /**
   * Adds an import to the given source-file and returns the TypeScript
   * identifier that can be used to access the newly imported symbol.
   */
  addImportToSourceFile(
      sourceFile: ts.SourceFile, symbolName: string|null, moduleName: string,
      alias: string|null = null, typeImport = false): ts.Expression {
    const sourceDir = dirname(sourceFile.fileName);
    let importStartIndex = 0;
    let existingImport: ts.ImportDeclaration|null = null;

    // In case the given import has been already generated previously, we just return
    // the previous generated identifier in order to avoid duplicate generated imports.
    const cachedImport = this.importCache.find(
        c => c.sourceFile === sourceFile && c.symbolName === symbolName &&
            c.moduleName === moduleName && c.alias === alias);
    if (cachedImport) {
      return cachedImport.identifier;
    }

    // Walk through all source-file top-level statements and search for import declarations
    // that already match the specified "moduleName" and can be updated to import the
    // given symbol. If no matching import can be found, the last import in the source-file
    // will be used as starting point for a new import that will be generated.
    for (let i = sourceFile.statements.length - 1; i >= 0; i--) {
      const statement = sourceFile.statements[i];

      if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier) ||
          !statement.importClause) {
        continue;
      }

      if (importStartIndex === 0) {
        importStartIndex = this._getEndPositionOfNode(statement);
      }

      const moduleSpecifier = statement.moduleSpecifier.text;

      if (moduleSpecifier.startsWith('.') &&
              resolve(sourceDir, moduleSpecifier) !== resolve(sourceDir, moduleName) ||
          moduleSpecifier !== moduleName) {
        continue;
      }

      if (statement.importClause.namedBindings) {
        const namedBindings = statement.importClause.namedBindings;

        // In case a "Type" symbol is imported, we can't use namespace imports
        // because these only export symbols available at runtime (no types)
        if (ts.isNamespaceImport(namedBindings) && !typeImport) {
          return ts.factory.createPropertyAccessExpression(
              ts.factory.createIdentifier(namedBindings.name.text),
              ts.factory.createIdentifier(alias || symbolName || 'default'));
        } else if (ts.isNamedImports(namedBindings) && symbolName) {
          const existingElement = namedBindings.elements.find(e => {
            // TODO(crisbeto): if an alias conflicts with an existing import, it may cause invalid
            // code to be generated. This is unlikely, but we may want to revisit it in the future.
            if (alias) {
              return e.propertyName && e.name.text === alias && e.propertyName.text === symbolName;
            }
            return e.propertyName ? e.propertyName.text === symbolName : e.name.text === symbolName;
          });

          if (existingElement) {
            return ts.factory.createIdentifier(existingElement.name.text);
          }

          // In case the symbol could not be found in an existing import, we
          // keep track of the import declaration as it can be updated to include
          // the specified symbol name without having to create a new import.
          existingImport = statement;
        }
      } else if (statement.importClause.name && !symbolName) {
        return ts.factory.createIdentifier(statement.importClause.name.text);
      }
    }

    if (existingImport) {
      const {propertyName, name} = this._getImportParts(sourceFile, symbolName!, alias);

      // Since it can happen that multiple classes need to be imported within the
      // specified source file and we want to add the identifiers to the existing
      // import declaration, we need to keep track of the updated import declarations.
      // We can't directly update the import declaration for each identifier as this
      // would throw off the recorder offsets. We need to keep track of the new identifiers
      // for the import and perform the import transformation as batches per source-file.
      this.updatedImports.set(
          existingImport,
          (this.updatedImports.get(existingImport) || []).concat({propertyName, importName: name}));

      // Keep track of all updated imports so that we don't generate duplicate
      // similar imports as these can't be statically analyzed in the source-file yet.
      this.importCache.push({sourceFile, moduleName, symbolName, alias, identifier: name});

      return name;
    }

    let identifier: ts.Identifier|null = null;

    if (!this.newImports.has(sourceFile)) {
      this.newImports.set(sourceFile, {
        importStartIndex,
        defaultImports: new Map(),
        namedImports: new Map(),
      });
    }

    if (symbolName) {
      const {propertyName, name} = this._getImportParts(sourceFile, symbolName, alias);
      const importMap = this.newImports.get(sourceFile)!.namedImports;
      identifier = name;

      if (!importMap.has(moduleName)) {
        importMap.set(moduleName, []);
      }

      importMap.get(moduleName)!.push(ts.factory.createImportSpecifier(false, propertyName, name));
    } else {
      const importMap = this.newImports.get(sourceFile)!.defaultImports;
      identifier = this._getUniqueIdentifier(sourceFile, 'defaultExport');
      importMap.set(moduleName, identifier);
    }

    // Keep track of all generated imports so that we don't generate duplicate
    // similar imports as these can't be statically analyzed in the source-file yet.
    this.importCache.push({sourceFile, symbolName, moduleName, alias, identifier});

    return identifier;
  }

  /**
   * Stores the collected import changes within the appropriate update recorders. The
   * updated imports can only be updated *once* per source-file because previous updates
   * could otherwise shift the source-file offsets.
   */
  recordChanges() {
    this.updatedImports.forEach((expressions, importDecl) => {
      const sourceFile = importDecl.getSourceFile();
      const recorder = this.getUpdateRecorder(sourceFile);
      const namedBindings = importDecl.importClause!.namedBindings as ts.NamedImports;
      const newNamedBindings = ts.factory.updateNamedImports(
          namedBindings,
          namedBindings.elements.concat(expressions.map(
              ({propertyName, importName}) =>
                  ts.factory.createImportSpecifier(false, propertyName, importName))));

      const newNamedBindingsText =
          this.printer.printNode(ts.EmitHint.Unspecified, newNamedBindings, sourceFile);
      recorder.updateExistingImport(namedBindings, newNamedBindingsText);
    });

    this.newImports.forEach(({importStartIndex, defaultImports, namedImports}, sourceFile) => {
      const recorder = this.getUpdateRecorder(sourceFile);
      const useSingleQuotes = this._getQuoteStyle(sourceFile) === QuoteStyle.Single;

      defaultImports.forEach((identifier, moduleName) => {
        const newImport = ts.factory.createImportDeclaration(
            undefined, ts.factory.createImportClause(false, identifier, undefined),
            ts.factory.createStringLiteral(moduleName, useSingleQuotes));

        recorder.addNewImport(
            importStartIndex, this._getNewImportText(importStartIndex, newImport, sourceFile));
      });

      namedImports.forEach((specifiers, moduleName) => {
        const newImport = ts.factory.createImportDeclaration(
            undefined,
            ts.factory.createImportClause(
                false, undefined, ts.factory.createNamedImports(specifiers)),
            ts.factory.createStringLiteral(moduleName, useSingleQuotes));

        recorder.addNewImport(
            importStartIndex, this._getNewImportText(importStartIndex, newImport, sourceFile));
      });
    });
  }

  /** Gets an unique identifier with a base name for the given source file. */
  private _getUniqueIdentifier(sourceFile: ts.SourceFile, baseName: string): ts.Identifier {
    if (this.isUniqueIdentifierName(sourceFile, baseName)) {
      this._recordUsedIdentifier(sourceFile, baseName);
      return ts.factory.createIdentifier(baseName);
    }

    let name = null;
    let counter = 1;
    do {
      name = `${baseName}_${counter++}`;
    } while (!this.isUniqueIdentifierName(sourceFile, name));

    this._recordUsedIdentifier(sourceFile, name!);
    return ts.factory.createIdentifier(name!);
  }

  /**
   * Checks whether the specified identifier name is used within the given
   * source file.
   */
  private isUniqueIdentifierName(sourceFile: ts.SourceFile, name: string) {
    if (this.usedIdentifierNames.has(sourceFile) &&
        this.usedIdentifierNames.get(sourceFile)!.indexOf(name) !== -1) {
      return false;
    }

    // Walk through the source file and search for an identifier matching
    // the given name. In that case, it's not guaranteed that this name
    // is unique in the given declaration scope and we just return false.
    const nodeQueue: ts.Node[] = [sourceFile];
    while (nodeQueue.length) {
      const node = nodeQueue.shift()!;
      if (ts.isIdentifier(node) && node.text === name &&
          // Identifiers that are aliased in an import aren't
          // problematic since they're used under a different name.
          (!ts.isImportSpecifier(node.parent) || node.parent.propertyName !== node)) {
        return false;
      }
      nodeQueue.push(...node.getChildren());
    }
    return true;
  }

  private _recordUsedIdentifier(sourceFile: ts.SourceFile, identifierName: string) {
    this.usedIdentifierNames.set(
        sourceFile, (this.usedIdentifierNames.get(sourceFile) || []).concat(identifierName));
  }

  /**
   * Determines the full end of a given node. By default the end position of a node is
   * before all trailing comments. This could mean that generated imports shift comments.
   */
  private _getEndPositionOfNode(node: ts.Node) {
    const nodeEndPos = node.getEnd();
    const commentRanges = ts.getTrailingCommentRanges(node.getSourceFile().text, nodeEndPos);
    if (!commentRanges || !commentRanges.length) {
      return nodeEndPos;
    }
    return commentRanges[commentRanges.length - 1]!.end;
  }

  /** Gets the text that should be added to the file for a newly-created import declaration. */
  private _getNewImportText(
      importStartIndex: number, newImport: ts.ImportDeclaration,
      sourceFile: ts.SourceFile): string {
    const text = this.printer.printNode(ts.EmitHint.Unspecified, newImport, sourceFile);

    // If the import is generated at the start of the source file, we want to add
    // a new-line after the import. Otherwise if the import is generated after an
    // existing import, we need to prepend a new-line so that the import is not on
    // the same line as the existing import anchor
    return importStartIndex === 0 ? `${text}\n` : `\n${text}`;
  }

  /**
   * Gets the different parts necessary to construct an import specifier.
   * @param sourceFile File in which the import is being inserted.
   * @param symbolName Name of the symbol.
   * @param alias Alias that the symbol may be available under.
   * @returns Object containing the different parts. E.g. `{name: 'alias', propertyName: 'name'}`
   * would correspond to `import {name as alias}` while `{name: 'name', propertyName: undefined}`
   * corresponds to `import {name}`.
   */
  private _getImportParts(sourceFile: ts.SourceFile, symbolName: string, alias: string|null) {
    const symbolIdentifier = ts.factory.createIdentifier(symbolName);
    const aliasIdentifier = alias ? ts.factory.createIdentifier(alias) : null;
    const generatedUniqueIdentifier = this._getUniqueIdentifier(sourceFile, alias || symbolName);
    const needsGeneratedUniqueName = generatedUniqueIdentifier.text !== (alias || symbolName);
    let propertyName: ts.Identifier|undefined;
    let name: ts.Identifier;

    if (needsGeneratedUniqueName) {
      propertyName = symbolIdentifier;
      name = generatedUniqueIdentifier;
    } else if (aliasIdentifier) {
      propertyName = symbolIdentifier;
      name = aliasIdentifier;
    } else {
      name = symbolIdentifier;
    }

    return {propertyName, name};
  }

  /** Gets the quote style that is used for a file's imports. */
  private _getQuoteStyle(sourceFile: ts.SourceFile): QuoteStyle {
    if (!this.quoteStyles.hasOwnProperty(sourceFile.fileName)) {
      let quoteStyle: QuoteStyle|undefined;

      // Walk through the top-level imports and try to infer the quotes.
      for (const statement of sourceFile.statements) {
        if (ts.isImportDeclaration(statement) &&
            ts.isStringLiteralLike(statement.moduleSpecifier)) {
          // Use `getText` instead of the actual text since it includes the quotes.
          quoteStyle = statement.moduleSpecifier.getText().trim().startsWith('"') ?
              QuoteStyle.Double :
              QuoteStyle.Single;
          break;
        }
      }

      // Otherwise fall back to single quotes.
      this.quoteStyles[sourceFile.fileName] = quoteStyle ?? QuoteStyle.Single;
    }

    return this.quoteStyles[sourceFile.fileName];
  }
}
