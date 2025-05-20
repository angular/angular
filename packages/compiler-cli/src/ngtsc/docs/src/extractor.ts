/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {MetadataReader} from '../../metadata';
import {isNamedClassDeclaration, TypeScriptReflectionHost} from '../../reflection';

import {extractClass, extractInterface} from './class_extractor';
import {extractConstant, isSyntheticAngularConstant} from './constant_extractor';
import {
  extractorDecorator,
  isDecoratorDeclaration,
  isDecoratorOptionsInterface,
} from './decorator_extractor';
import {DocEntry, DocEntryWithSourceInfo} from './entities';
import {extractEnum} from './enum_extractor';
import {isAngularPrivateName} from './filters';
import {FunctionExtractor} from './function_extractor';
import {
  extractInitializerApiFunction,
  isInitializerApiFunction,
} from './initializer_api_function_extractor';
import {extractTypeAlias} from './type_alias_extractor';
import {getImportedSymbols} from './import_extractor';

type DeclarationWithExportName = readonly [string, ts.Declaration];

/**
 * Extracts all information from a source file that may be relevant for generating
 * public API documentation.
 */
export class DocsExtractor {
  constructor(
    private typeChecker: ts.TypeChecker,
    private metadataReader: MetadataReader,
  ) {}

  /**
   * Gets the set of all documentable entries from a source file, including
   * declarations that are re-exported from this file as an entry-point.
   *
   * @param sourceFile The file from which to extract documentable entries.
   */
  extractAll(
    sourceFile: ts.SourceFile,
    rootDir: string,
    privateModules: Set<string>,
  ): {entries: DocEntry[]; symbols: Map<string, string>} {
    const entries: DocEntry[] = [];
    const symbols = new Map<string, string>();

    const exportedDeclarations = this.getExportedDeclarations(sourceFile);
    for (const [exportName, node] of exportedDeclarations) {
      // Skip any symbols with an Angular-internal name.
      if (isAngularPrivateName(exportName)) {
        continue;
      }

      const entry = this.extractDeclaration(node);
      if (entry && !isIgnoredDocEntry(entry)) {
        // The source file parameter is the package entry: the index.ts
        // We want the real source file of the declaration.
        const realSourceFile = node.getSourceFile();

        /**
         * The `sourceFile` from `extractAll` is the main entry-point file of a package.
         * Usually following a format like `export * from './public_api';`, simply re-exporting.
         * It is necessary to pick-up every import from the actual source files
         * where declarations are living, so that we can determine what symbols
         * are actually referenced in the context of that particular declaration
         * By doing this, the generation remains independent from other packages
         */
        const importedSymbols = getImportedSymbols(realSourceFile);
        importedSymbols.forEach((moduleName, symbolName) => {
          if (symbolName.startsWith('ɵ') || privateModules.has(moduleName)) {
            return;
          }

          if (symbols.has(symbolName) && symbols.get(symbolName) !== moduleName) {
            // If this ever throws, we need to improve the symbol extraction strategy
            throw new Error(
              `Ambigous symbol \`${symbolName}\` exported by both ${symbols.get(
                symbolName,
              )} & ${moduleName}`,
            );
          }

          symbols.set(symbolName, moduleName);
        });

        // Set the source code references for the extracted entry.
        (entry as DocEntryWithSourceInfo).source = {
          filePath: getRelativeFilePath(realSourceFile, rootDir),

          // Start & End are off by 1
          startLine: ts.getLineAndCharacterOfPosition(realSourceFile, node.getStart()).line + 1,
          endLine: ts.getLineAndCharacterOfPosition(realSourceFile, node.getEnd()).line + 1,
        };

        // The exported name of an API may be different from its declaration name, so
        // use the declaration name.
        entries.push({...entry, name: exportName});
      }
    }

    return {entries, symbols};
  }

  /** Extract the doc entry for a single declaration. */
  private extractDeclaration(node: ts.Declaration): DocEntry | null {
    // Ignore anonymous classes.
    if (isNamedClassDeclaration(node)) {
      return extractClass(node, this.metadataReader, this.typeChecker);
    }

    if (isInitializerApiFunction(node, this.typeChecker)) {
      return extractInitializerApiFunction(node, this.typeChecker);
    }

    if (ts.isInterfaceDeclaration(node) && !isIgnoredInterface(node)) {
      return extractInterface(node, this.typeChecker);
    }

    if (ts.isFunctionDeclaration(node)) {
      // Name is guaranteed to be set, because it's exported directly.
      const functionExtractor = new FunctionExtractor(node.name!.getText(), node, this.typeChecker);
      return functionExtractor.extract();
    }

    if (ts.isVariableDeclaration(node) && !isSyntheticAngularConstant(node)) {
      return isDecoratorDeclaration(node)
        ? extractorDecorator(node, this.typeChecker)
        : extractConstant(node, this.typeChecker);
    }

    if (ts.isTypeAliasDeclaration(node)) {
      return extractTypeAlias(node);
    }

    if (ts.isEnumDeclaration(node)) {
      return extractEnum(node, this.typeChecker);
    }

    return null;
  }

  /** Gets the list of exported declarations for doc extraction. */
  private getExportedDeclarations(sourceFile: ts.SourceFile): DeclarationWithExportName[] {
    // Use the reflection host to get all the exported declarations from this
    // source file entry point.
    const reflector = new TypeScriptReflectionHost(this.typeChecker, false, true);
    const exportedDeclarationMap = reflector.getExportsOfModule(sourceFile);

    // Augment each declaration with the exported name in the public API.
    let exportedDeclarations = Array.from(exportedDeclarationMap?.entries() ?? []).map(
      ([exportName, declaration]) => [exportName, declaration.node] as const,
    );

    // Sort the declaration nodes into declaration position because their order is lost in
    // reading from the export map. This is primarily useful for testing and debugging.
    return exportedDeclarations.sort(
      ([a, declarationA], [b, declarationB]) => declarationA.pos - declarationB.pos,
    );
  }
}

/** Gets whether an interface should be ignored for docs extraction. */
function isIgnoredInterface(node: ts.InterfaceDeclaration) {
  // We filter out all interfaces that end with "Decorator" because we capture their
  // types as part of the main decorator entry (which are declared as constants).
  // This approach to dealing with decorators is admittedly fuzzy, but this aspect of
  // the framework's source code is unlikely to change. We also filter out the interfaces
  // that contain the decorator options.
  return node.name.getText().endsWith('Decorator') || isDecoratorOptionsInterface(node);
}

/**
 * Whether the doc entry should be ignored.
 *
 * Note: We cannot check whether a node is marked as docs private
 * before extraction because the extractor may find the attached
 * JSDoc tags on different AST nodes. For example, a variable declaration
 * never has JSDoc tags attached, but rather the parent variable statement.
 */
function isIgnoredDocEntry(entry: DocEntry): boolean {
  const isDocsPrivate = entry.jsdocTags.find((e) => e.name === 'docsPrivate');
  if (isDocsPrivate !== undefined && isDocsPrivate.comment === '') {
    throw new Error(
      `Docs extraction: Entry "${entry.name}" is marked as ` +
        `"@docsPrivate" but without reasoning.`,
    );
  }

  return isDocsPrivate !== undefined;
}

function getRelativeFilePath(sourceFile: ts.SourceFile, rootDir: string): string {
  const fullPath = sourceFile.fileName;
  const relativePath = fullPath.replace(rootDir, '');

  return relativePath;
}
