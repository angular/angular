/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import ts from 'typescript';
import {createGenerateUniqueIdentifierHelper} from './check_unique_identifier_name';
import {createTsTransformForImportManager} from './import_typescript_transform';
import {attemptToReuseGeneratedImports, captureGeneratedImport} from './reuse_generated_imports';
import {attemptToReuseExistingSourceFileImports} from './reuse_source_file_imports';
/**
 * Preset configuration for forcing namespace imports.
 *
 * This preset is commonly used to avoid test differences to previous
 * versions of the `ImportManager`.
 */
export const presetImportManagerForceNamespaceImports = {
  // Forcing namespace imports also means no-reuse.
  // Re-using would otherwise become more complicated and we don't
  // expect re-usable namespace imports.
  disableOriginalSourceFileReuse: true,
  forceGenerateNamespacesForNewImports: true,
};
/**
 * Import manager that can be used to conveniently and efficiently generate
 * imports It efficiently re-uses existing source file imports, or previous
 * generated imports.
 *
 * These capabilities are important for efficient TypeScript transforms that
 * minimize structural changes to the dependency graph of source files, enabling
 * as much incremental re-use as possible.
 *
 * Those imports may be inserted via a TypeScript transform, or via manual string
 * manipulation using e.g. `magic-string`.
 */
export class ImportManager {
  /** List of new imports that will be inserted into given source files. */
  newImports = new Map();
  /**
   * Keeps track of imports marked for removal. The root-level key is the file from which the
   * import should be removed, the inner map key is the name of the module from which the symbol
   * is being imported. The value of the inner map is a set of symbol names that should be removed.
   * Note! the inner map tracks the original names of the imported symbols, not their local aliases.
   */
  removedImports = new Map();
  nextUniqueIndex = 0;
  config;
  reuseSourceFileImportsTracker;
  reuseGeneratedImportsTracker = {
    directReuseCache: new Map(),
    namespaceImportReuseCache: new Map(),
  };
  constructor(config = {}) {
    this.config = {
      shouldUseSingleQuotes: config.shouldUseSingleQuotes ?? (() => false),
      rewriter: config.rewriter ?? null,
      disableOriginalSourceFileReuse: config.disableOriginalSourceFileReuse ?? false,
      forceGenerateNamespacesForNewImports: config.forceGenerateNamespacesForNewImports ?? false,
      namespaceImportPrefix: config.namespaceImportPrefix ?? 'i',
      generateUniqueIdentifier:
        config.generateUniqueIdentifier ?? createGenerateUniqueIdentifierHelper(),
    };
    this.reuseSourceFileImportsTracker = {
      generateUniqueIdentifier: this.config.generateUniqueIdentifier,
      reusedAliasDeclarations: new Set(),
      updatedImports: new Map(),
    };
  }
  /** Adds a side-effect import for the given module. */
  addSideEffectImport(requestedFile, moduleSpecifier) {
    if (this.config.rewriter !== null) {
      moduleSpecifier = this.config.rewriter.rewriteSpecifier(
        moduleSpecifier,
        requestedFile.fileName,
      );
    }
    this._getNewImportsTrackerForFile(requestedFile).sideEffectImports.add(moduleSpecifier);
  }
  addImport(request) {
    if (this.config.rewriter !== null) {
      if (request.exportSymbolName !== null) {
        request.exportSymbolName = this.config.rewriter.rewriteSymbol(
          request.exportSymbolName,
          request.exportModuleSpecifier,
        );
      }
      request.exportModuleSpecifier = this.config.rewriter.rewriteSpecifier(
        request.exportModuleSpecifier,
        request.requestedFile.fileName,
      );
    }
    // Remove the newly-added import from the set of removed imports.
    if (request.exportSymbolName !== null && !request.asTypeReference) {
      this.removedImports
        .get(request.requestedFile)
        ?.get(request.exportModuleSpecifier)
        ?.delete(request.exportSymbolName);
    }
    // Attempt to re-use previous identical import requests.
    const previousGeneratedImportRef = attemptToReuseGeneratedImports(
      this.reuseGeneratedImportsTracker,
      request,
    );
    if (previousGeneratedImportRef !== null) {
      return createImportReference(!!request.asTypeReference, previousGeneratedImportRef);
    }
    // Generate a new one, and cache it.
    const resultImportRef = this._generateNewImport(request);
    captureGeneratedImport(request, this.reuseGeneratedImportsTracker, resultImportRef);
    return createImportReference(!!request.asTypeReference, resultImportRef);
  }
  /**
   * Marks all imported symbols with a specific name for removal.
   * Call `addImport` to undo this operation.
   * @param requestedFile File from which to remove the imports.
   * @param exportSymbolName Declared name of the symbol being removed.
   * @param moduleSpecifier Module from which the symbol is being imported.
   */
  removeImport(requestedFile, exportSymbolName, moduleSpecifier) {
    let moduleMap = this.removedImports.get(requestedFile);
    if (!moduleMap) {
      moduleMap = new Map();
      this.removedImports.set(requestedFile, moduleMap);
    }
    let removedSymbols = moduleMap.get(moduleSpecifier);
    if (!removedSymbols) {
      removedSymbols = new Set();
      moduleMap.set(moduleSpecifier, removedSymbols);
    }
    removedSymbols.add(exportSymbolName);
  }
  _generateNewImport(request) {
    const {requestedFile: sourceFile} = request;
    const disableOriginalSourceFileReuse = this.config.disableOriginalSourceFileReuse;
    const forceGenerateNamespacesForNewImports = this.config.forceGenerateNamespacesForNewImports;
    // If desired, attempt to re-use original source file imports as a base, or as much as possible.
    // This may involve updates to existing import named bindings.
    if (!disableOriginalSourceFileReuse) {
      const reuseResult = attemptToReuseExistingSourceFileImports(
        this.reuseSourceFileImportsTracker,
        sourceFile,
        request,
      );
      if (reuseResult !== null) {
        return reuseResult;
      }
    }
    // A new import needs to be generated.
    // No candidate existing import was found.
    const {namedImports, namespaceImports} = this._getNewImportsTrackerForFile(sourceFile);
    // If a namespace import is requested, or the symbol should be forcibly
    // imported through namespace imports:
    if (request.exportSymbolName === null || forceGenerateNamespacesForNewImports) {
      let namespaceImportName = `${this.config.namespaceImportPrefix}${this.nextUniqueIndex++}`;
      if (this.config.rewriter) {
        namespaceImportName = this.config.rewriter.rewriteNamespaceImportIdentifier(
          namespaceImportName,
          request.exportModuleSpecifier,
        );
      }
      const namespaceImport = ts.factory.createNamespaceImport(
        this.config.generateUniqueIdentifier(sourceFile, namespaceImportName) ??
          ts.factory.createIdentifier(namespaceImportName),
      );
      namespaceImports.set(request.exportModuleSpecifier, namespaceImport);
      // Capture the generated namespace import alone, to allow re-use.
      captureGeneratedImport(
        {...request, exportSymbolName: null},
        this.reuseGeneratedImportsTracker,
        namespaceImport.name,
      );
      if (request.exportSymbolName !== null) {
        return [namespaceImport.name, ts.factory.createIdentifier(request.exportSymbolName)];
      }
      return namespaceImport.name;
    }
    // Otherwise, an individual named import is requested.
    if (!namedImports.has(request.exportModuleSpecifier)) {
      namedImports.set(request.exportModuleSpecifier, []);
    }
    const exportSymbolName = ts.factory.createIdentifier(request.exportSymbolName);
    const fileUniqueName = request.unsafeAliasOverride
      ? null
      : this.config.generateUniqueIdentifier(sourceFile, request.exportSymbolName);
    let needsAlias;
    let specifierName;
    if (request.unsafeAliasOverride) {
      needsAlias = true;
      specifierName = ts.factory.createIdentifier(request.unsafeAliasOverride);
    } else if (fileUniqueName !== null) {
      needsAlias = true;
      specifierName = fileUniqueName;
    } else {
      needsAlias = false;
      specifierName = exportSymbolName;
    }
    namedImports
      .get(request.exportModuleSpecifier)
      .push(
        ts.factory.createImportSpecifier(
          false,
          needsAlias ? exportSymbolName : undefined,
          specifierName,
        ),
      );
    return specifierName;
  }
  /**
   * Finalizes the import manager by computing all necessary import changes
   * and returning them.
   *
   * Changes are collected once at the end, after all imports are requested,
   * because this simplifies building up changes to existing imports that need
   * to be updated, and allows more trivial re-use of previous generated imports.
   */
  finalize() {
    const affectedFiles = new Set();
    const updatedImportsResult = new Map();
    const newImportsResult = new Map();
    const deletedImports = new Set();
    const importDeclarationsPerFile = new Map();
    const addNewImport = (fileName, importDecl) => {
      affectedFiles.add(fileName);
      if (newImportsResult.has(fileName)) {
        newImportsResult.get(fileName).push(importDecl);
      } else {
        newImportsResult.set(fileName, [importDecl]);
      }
    };
    // Collect original source file imports that need to be updated.
    this.reuseSourceFileImportsTracker.updatedImports.forEach((expressions, importDecl) => {
      const sourceFile = importDecl.getSourceFile();
      const namedBindings = importDecl.importClause.namedBindings;
      const moduleName = importDecl.moduleSpecifier.text;
      const newElements = namedBindings.elements
        .concat(
          expressions.map(({propertyName, fileUniqueAlias}) =>
            ts.factory.createImportSpecifier(
              false,
              fileUniqueAlias !== null ? propertyName : undefined,
              fileUniqueAlias ?? propertyName,
            ),
          ),
        )
        .filter((specifier) => this._canAddSpecifier(sourceFile, moduleName, specifier));
      affectedFiles.add(sourceFile.fileName);
      if (newElements.length === 0) {
        deletedImports.add(importDecl);
      } else {
        updatedImportsResult.set(
          namedBindings,
          ts.factory.updateNamedImports(namedBindings, newElements),
        );
      }
    });
    this.removedImports.forEach((removeMap, sourceFile) => {
      if (removeMap.size === 0) {
        return;
      }
      let allImports = importDeclarationsPerFile.get(sourceFile);
      if (!allImports) {
        allImports = sourceFile.statements.filter(ts.isImportDeclaration);
        importDeclarationsPerFile.set(sourceFile, allImports);
      }
      for (const node of allImports) {
        if (
          !node.importClause?.namedBindings ||
          !ts.isNamedImports(node.importClause.namedBindings) ||
          this.reuseSourceFileImportsTracker.updatedImports.has(node) ||
          deletedImports.has(node)
        ) {
          continue;
        }
        const namedBindings = node.importClause.namedBindings;
        const moduleName = node.moduleSpecifier.text;
        const newImports = namedBindings.elements.filter((specifier) =>
          this._canAddSpecifier(sourceFile, moduleName, specifier),
        );
        if (newImports.length === 0) {
          affectedFiles.add(sourceFile.fileName);
          deletedImports.add(node);
        } else if (newImports.length !== namedBindings.elements.length) {
          affectedFiles.add(sourceFile.fileName);
          updatedImportsResult.set(
            namedBindings,
            ts.factory.updateNamedImports(namedBindings, newImports),
          );
        }
      }
    });
    // Collect all new imports to be added. Named imports, namespace imports or side-effects.
    this.newImports.forEach(({namedImports, namespaceImports, sideEffectImports}, sourceFile) => {
      const useSingleQuotes = this.config.shouldUseSingleQuotes(sourceFile);
      const fileName = sourceFile.fileName;
      sideEffectImports.forEach((moduleName) => {
        addNewImport(
          fileName,
          ts.factory.createImportDeclaration(
            undefined,
            undefined,
            ts.factory.createStringLiteral(moduleName),
          ),
        );
      });
      namespaceImports.forEach((namespaceImport, moduleName) => {
        const newImport = ts.factory.createImportDeclaration(
          undefined,
          ts.factory.createImportClause(false, undefined, namespaceImport),
          ts.factory.createStringLiteral(moduleName, useSingleQuotes),
        );
        // IMPORTANT: Set the original TS node to the `ts.ImportDeclaration`. This allows
        // downstream transforms such as tsickle to properly process references to this import.
        //
        // This operation is load-bearing in g3 as some imported modules contain special metadata
        // generated by clutz, which tsickle uses to transform imports and references to those
        // imports. See: `google3: node_modules/tsickle/src/googmodule.ts;l=637-640;rcl=615418148`
        ts.setOriginalNode(namespaceImport.name, newImport);
        addNewImport(fileName, newImport);
      });
      namedImports.forEach((specifiers, moduleName) => {
        const filteredSpecifiers = specifiers.filter((specifier) =>
          this._canAddSpecifier(sourceFile, moduleName, specifier),
        );
        if (filteredSpecifiers.length > 0) {
          const newImport = ts.factory.createImportDeclaration(
            undefined,
            ts.factory.createImportClause(
              false,
              undefined,
              ts.factory.createNamedImports(filteredSpecifiers),
            ),
            ts.factory.createStringLiteral(moduleName, useSingleQuotes),
          );
          addNewImport(fileName, newImport);
        }
      });
    });
    return {
      affectedFiles,
      newImports: newImportsResult,
      updatedImports: updatedImportsResult,
      reusedOriginalAliasDeclarations: this.reuseSourceFileImportsTracker.reusedAliasDeclarations,
      deletedImports,
    };
  }
  /**
   * Gets a TypeScript transform for the import manager.
   *
   * @param extraStatementsMap Additional set of statements to be inserted
   *   for given source files after their imports. E.g. top-level constants.
   */
  toTsTransform(extraStatementsMap) {
    return createTsTransformForImportManager(this, extraStatementsMap);
  }
  /**
   * Transforms a single file as a shorthand, using {@link toTsTransform}.
   *
   * @param extraStatementsMap Additional set of statements to be inserted
   *   for given source files after their imports. E.g. top-level constants.
   */
  transformTsFile(ctx, file, extraStatementsAfterImports) {
    const extraStatementsMap = extraStatementsAfterImports
      ? new Map([[file.fileName, extraStatementsAfterImports]])
      : undefined;
    return this.toTsTransform(extraStatementsMap)(ctx)(file);
  }
  _getNewImportsTrackerForFile(file) {
    if (!this.newImports.has(file)) {
      this.newImports.set(file, {
        namespaceImports: new Map(),
        namedImports: new Map(),
        sideEffectImports: new Set(),
      });
    }
    return this.newImports.get(file);
  }
  _canAddSpecifier(sourceFile, moduleSpecifier, specifier) {
    return !this.removedImports
      .get(sourceFile)
      ?.get(moduleSpecifier)
      ?.has((specifier.propertyName || specifier.name).text);
  }
}
/** Creates an import reference based on the given identifier, or nested access. */
function createImportReference(asTypeReference, ref) {
  if (asTypeReference) {
    return Array.isArray(ref) ? ts.factory.createQualifiedName(ref[0], ref[1]) : ref;
  } else {
    return Array.isArray(ref) ? ts.factory.createPropertyAccessExpression(ref[0], ref[1]) : ref;
  }
}
//# sourceMappingURL=import_manager.js.map
