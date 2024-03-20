/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

import {AliasImportDeclaration, ImportRewriter} from '../../../imports';
import {ImportGenerator, ImportRequest} from '../api/import_generator';

import {createGenerateUniqueIdentifierHelper} from './check_unique_identifier_name';
import {createTsTransformForImportManager} from './import_typescript_transform';
import {attemptToReuseGeneratedImports, captureGeneratedImport, ReuseGeneratedImportsTracker} from './reuse_generated_imports';
import {attemptToReuseExistingSourceFileImports, ReuseExistingSourceFileImportsTracker} from './reuse_source_file_imports';

/** Configuration for the import manager. */
export interface ImportManagerConfig {
  generateUniqueIdentifier(file: ts.SourceFile, baseName: string): ts.Identifier|null;
  shouldUseSingleQuotes(file: ts.SourceFile): boolean;
  rewriter: ImportRewriter|null;
  namespaceImportPrefix: string;
  disableOriginalSourceFileReuse: boolean;
  forceGenerateNamespacesForNewImports: boolean;
}

/**
 * Preset configuration for forcing namespace imports.
 *
 * This preset is commonly used to avoid test differences to previous
 * versions of the `ImportManager`.
 */
export const presetImportManagerForceNamespaceImports: Partial<ImportManagerConfig> = {
  // Forcing namespace imports also means no-reuse.
  // Re-using would otherwise become more complicated and we don't
  // expect re-usable namespace imports.
  disableOriginalSourceFileReuse: true,
  forceGenerateNamespacesForNewImports: true,
};

/** Branded string to identify a module name. */
export type ModuleName = string&{__moduleName: boolean};

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
export class ImportManager implements
    ImportGenerator<ts.SourceFile, ts.Identifier|ts.PropertyAccessExpression> {
  /** List of new imports that will be inserted into given source files. */
  private newImports: Map<ts.SourceFile, {
    namespaceImports: Map<ModuleName, ts.NamespaceImport>,
    namedImports: Map<ModuleName, ts.ImportSpecifier[]>,
    sideEffectImports: Set<ModuleName>,
  }> = new Map();

  private nextUniqueIndex = 0;
  private config: ImportManagerConfig;

  private reuseSourceFileImportsTracker: ReuseExistingSourceFileImportsTracker;
  private reuseGeneratedImportsTracker: ReuseGeneratedImportsTracker = {
    directReuseCache: new Map(),
    namespaceImportReuseCache: new Map(),
  };

  constructor(private _config: Partial<ImportManagerConfig> = {}) {
    this.config = {
      shouldUseSingleQuotes: () => false,
      rewriter: null,
      disableOriginalSourceFileReuse: false,
      forceGenerateNamespacesForNewImports: false,
      namespaceImportPrefix: 'i',
      generateUniqueIdentifier:
          this._config.generateUniqueIdentifier ?? createGenerateUniqueIdentifierHelper(),
      ...this._config,
    };
    this.reuseSourceFileImportsTracker = {
      generateUniqueIdentifier: this.config.generateUniqueIdentifier,
      reusedAliasDeclarations: new Set(),
      updatedImports: new Map(),
    };
  }

  /** Adds a side-effect import for the given module. */
  addSideEffectImport(requestedFile: ts.SourceFile, moduleSpecifier: string) {
    if (this.config.rewriter !== null) {
      moduleSpecifier =
          this.config.rewriter.rewriteSpecifier(moduleSpecifier, requestedFile.fileName);
    }

    this._getNewImportsTrackerForFile(requestedFile)
        .sideEffectImports.add(moduleSpecifier as ModuleName);
  }

  /**
   * Adds an import to the given source-file and returns a TypeScript
   * expression that can be used to access the newly imported symbol.
   */
  addImport(request: ImportRequest<ts.SourceFile>&{asTypeReference: true}): ts.Identifier
      |ts.QualifiedName;
  addImport(request: ImportRequest<ts.SourceFile>&{asTypeReference?: undefined}): ts.Identifier
      |ts.PropertyAccessExpression;
  addImport(request: ImportRequest<ts.SourceFile>&{asTypeReference?: boolean}): ts.Identifier
      |ts.PropertyAccessExpression|ts.QualifiedName {
    if (this.config.rewriter !== null) {
      if (request.exportSymbolName !== null) {
        request.exportSymbolName = this.config.rewriter.rewriteSymbol(
            request.exportSymbolName, request.exportModuleSpecifier);
      }

      request.exportModuleSpecifier = this.config.rewriter.rewriteSpecifier(
          request.exportModuleSpecifier, request.requestedFile.fileName);
    }

    // Attempt to re-use previous identical import requests.
    const previousGeneratedImportRef =
        attemptToReuseGeneratedImports(this.reuseGeneratedImportsTracker, request);
    if (previousGeneratedImportRef !== null) {
      return createImportReference(!!request.asTypeReference, previousGeneratedImportRef);
    }

    // Generate a new one, and cache it.
    const resultImportRef = this._generateNewImport(request);
    captureGeneratedImport(request, this.reuseGeneratedImportsTracker, resultImportRef);
    return createImportReference(!!request.asTypeReference, resultImportRef);
  }

  private _generateNewImport(request: ImportRequest<ts.SourceFile>): ts.Identifier
      |[ts.Identifier, ts.Identifier] {
    const {requestedFile: sourceFile} = request;
    const disableOriginalSourceFileReuse = this.config.disableOriginalSourceFileReuse;
    const forceGenerateNamespacesForNewImports = this.config.forceGenerateNamespacesForNewImports;

    // If desired, attempt to re-use original source file imports as a base, or as much as possible.
    // This may involve updates to existing import named bindings.
    if (!disableOriginalSourceFileReuse) {
      const reuseResult = attemptToReuseExistingSourceFileImports(
          this.reuseSourceFileImportsTracker, sourceFile, request);
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
      const namespaceImportName = `${this.config.namespaceImportPrefix}${this.nextUniqueIndex++}`;
      const namespaceImport = ts.factory.createNamespaceImport(
          this.config.generateUniqueIdentifier(sourceFile, namespaceImportName) ??
          ts.factory.createIdentifier(namespaceImportName));

      namespaceImports.set(request.exportModuleSpecifier as ModuleName, namespaceImport);

      // Capture the generated namespace import alone, to allow re-use.
      captureGeneratedImport(
          {...request, exportSymbolName: null}, this.reuseGeneratedImportsTracker,
          namespaceImport.name);

      if (request.exportSymbolName !== null) {
        return [namespaceImport.name, ts.factory.createIdentifier(request.exportSymbolName)];
      }
      return namespaceImport.name;
    }

    // Otherwise, an individual named import is requested.
    if (!namedImports.has(request.exportModuleSpecifier as ModuleName)) {
      namedImports.set(request.exportModuleSpecifier as ModuleName, []);
    }

    const exportSymbolName = ts.factory.createIdentifier(request.exportSymbolName);
    const fileUniqueName =
        this.config.generateUniqueIdentifier(sourceFile, request.exportSymbolName);
    const needsAlias = fileUniqueName !== null;
    const specifierName = needsAlias ? fileUniqueName : exportSymbolName;

    namedImports.get(request.exportModuleSpecifier as ModuleName)!.push(
        ts.factory.createImportSpecifier(
            false, needsAlias ? exportSymbolName : undefined, specifierName));

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
  finalize(): {
    affectedFiles: Set<string>,
    updatedImports: Map<ts.NamedImports, ts.NamedImports>,
    newImports: Map<string, ts.ImportDeclaration[]>,
    reusedOriginalAliasDeclarations: Set<AliasImportDeclaration>,
  } {
    const affectedFiles = new Set<string>();
    const updatedImportsResult = new Map<ts.NamedImports, ts.NamedImports>();
    const newImportsResult = new Map<string, ts.ImportDeclaration[]>();

    const addNewImport = (fileName: string, importDecl: ts.ImportDeclaration) => {
      affectedFiles.add(fileName);
      if (newImportsResult.has(fileName)) {
        newImportsResult.get(fileName)!.push(importDecl);
      } else {
        newImportsResult.set(fileName, [importDecl]);
      }
    };

    // Collect original source file imports that need to be updated.
    this.reuseSourceFileImportsTracker.updatedImports.forEach((expressions, importDecl) => {
      const namedBindings = importDecl.importClause!.namedBindings as ts.NamedImports;
      const newNamedBindings = ts.factory.updateNamedImports(
          namedBindings,
          namedBindings.elements.concat(expressions.map(
              ({propertyName, fileUniqueAlias}) => ts.factory.createImportSpecifier(
                  false, fileUniqueAlias !== null ? propertyName : undefined,
                  fileUniqueAlias ?? propertyName))));

      affectedFiles.add(importDecl.getSourceFile().fileName);
      updatedImportsResult.set(namedBindings, newNamedBindings);
    });

    // Collect all new imports to be added. Named imports, namespace imports or side-effects.
    this.newImports.forEach(({namedImports, namespaceImports, sideEffectImports}, sourceFile) => {
      const useSingleQuotes = this.config.shouldUseSingleQuotes(sourceFile);
      const fileName = sourceFile.fileName;

      sideEffectImports.forEach(moduleName => {
        addNewImport(
            fileName,
            ts.factory.createImportDeclaration(
                undefined, undefined, ts.factory.createStringLiteral(moduleName)));
      });

      namespaceImports.forEach((namespaceImport, moduleName) => {
        const newImport = ts.factory.createImportDeclaration(
            undefined, ts.factory.createImportClause(false, undefined, namespaceImport),
            ts.factory.createStringLiteral(moduleName, useSingleQuotes));

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
        const newImport = ts.factory.createImportDeclaration(
            undefined,
            ts.factory.createImportClause(
                false, undefined, ts.factory.createNamedImports(specifiers)),
            ts.factory.createStringLiteral(moduleName, useSingleQuotes));

        addNewImport(fileName, newImport);
      });
    });

    return {
      affectedFiles,
      newImports: newImportsResult,
      updatedImports: updatedImportsResult,
      reusedOriginalAliasDeclarations: this.reuseSourceFileImportsTracker.reusedAliasDeclarations,
    };
  }

  /**
   * Gets a TypeScript transform for the import manager.
   *
   * @param extraStatementsMap Additional set of statements to be inserted
   *   for given source files after their imports. E.g. top-level constants.
   */
  toTsTransform(extraStatementsMap?: Map<string, ts.Statement[]>):
      ts.TransformerFactory<ts.SourceFile> {
    return createTsTransformForImportManager(this, extraStatementsMap);
  }

  /**
   * Transforms a single file as a shorthand, using {@link toTsTransform}.
   *
   * @param extraStatementsMap Additional set of statements to be inserted
   *   for given source files after their imports. E.g. top-level constants.
   */
  transformTsFile(
      ctx: ts.TransformationContext, file: ts.SourceFile,
      extraStatementsAfterImports?: ts.Statement[]): ts.SourceFile {
    const extraStatementsMap = extraStatementsAfterImports ?
        new Map([[file.fileName, extraStatementsAfterImports]]) :
        undefined;
    return this.toTsTransform(extraStatementsMap)(ctx)(file);
  }

  private _getNewImportsTrackerForFile(file: ts.SourceFile):
      NonNullable<ReturnType<typeof this.newImports['get']>> {
    if (!this.newImports.has(file)) {
      this.newImports.set(file, {
        namespaceImports: new Map(),
        namedImports: new Map(),
        sideEffectImports: new Set(),
      });
    }
    return this.newImports.get(file)!;
  }
}

/** Creates an import reference based on the given identifier, or nested access. */
function createImportReference(
    asTypeReference: boolean, ref: ts.Identifier|[ts.Identifier, ts.Identifier]): ts.Identifier|
    ts.QualifiedName|ts.PropertyAccessExpression {
  if (asTypeReference) {
    return Array.isArray(ref) ? ts.factory.createQualifiedName(ref[0], ref[1]) : ref;
  } else {
    return Array.isArray(ref) ? ts.factory.createPropertyAccessExpression(ref[0], ref[1]) : ref;
  }
}
