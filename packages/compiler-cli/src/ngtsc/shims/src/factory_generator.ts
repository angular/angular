/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as path from 'path';
import * as ts from 'typescript';

import {relativePathBetween} from '../../util/src/path';

import {ShimGenerator} from './host';
import {isNonDeclarationTsFile} from './util';

const TS_DTS_SUFFIX = /(\.d)?\.ts$/;
const STRIP_NG_FACTORY = /(.*)NgFactory$/;

/**
 * Generates ts.SourceFiles which contain variable declarations for NgFactories for every exported
 * class of an input ts.SourceFile.
 */
export class FactoryGenerator implements ShimGenerator {
  private constructor(private map: Map<string, string>) {}

  get factoryFileMap(): Map<string, string> { return this.map; }

  getOriginalSourceOfShim(fileName: string): string|null { return this.map.get(fileName) || null; }

  generate(original: ts.SourceFile, genFilePath: string): ts.SourceFile {
    const relativePathToSource =
        './' + path.posix.basename(original.fileName).replace(TS_DTS_SUFFIX, '');
    // Collect a list of classes that need to have factory types emitted for them. This list is
    // overly broad as at this point the ts.TypeChecker hasn't been created, and can't be used to
    // semantically understand which decorated types are actually decorated with Angular decorators.
    //
    // The exports generated here are pruned in the factory transform during emit.
    const symbolNames = original
                            .statements
                            // Pick out top level class declarations...
                            .filter(ts.isClassDeclaration)
                            // which are named, exported, and have decorators.
                            .filter(
                                decl => isExported(decl) && decl.decorators !== undefined &&
                                    decl.name !== undefined)
                            // Grab the symbol name.
                            .map(decl => decl.name !.text);

    // For each symbol name, generate a constant export of the corresponding NgFactory.
    // This will encompass a lot of symbols which don't need factories, but that's okay
    // because it won't miss any that do.
    const varLines = symbolNames.map(
        name => `export const ${name}NgFactory = new i0.ɵNgModuleFactory(${name});`);
    const sourceText = [
      // This might be incorrect if the current package being compiled is Angular core, but it's
      // okay to leave in at type checking time. TypeScript can handle this reference via its path
      // mapping, but downstream bundlers can't. If the current package is core itself, this will be
      // replaced in the factory transformer before emit.
      `import * as i0 from '@angular/core';`,
      `import {${symbolNames.join(', ')}} from '${relativePathToSource}';`,
      ...varLines,
    ].join('\n');
    return ts.createSourceFile(
        genFilePath, sourceText, original.languageVersion, true, ts.ScriptKind.TS);
  }

  static forRootFiles(files: ReadonlyArray<string>): FactoryGenerator {
    const map = new Map<string, string>();
    files.filter(sourceFile => isNonDeclarationTsFile(sourceFile))
        .forEach(sourceFile => map.set(sourceFile.replace(/\.ts$/, '.ngfactory.ts'), sourceFile));
    return new FactoryGenerator(map);
  }
}

function isExported(decl: ts.Declaration): boolean {
  return decl.modifiers !== undefined &&
      decl.modifiers.some(mod => mod.kind == ts.SyntaxKind.ExportKeyword);
}

export interface FactoryInfo {
  sourceFilePath: string;
  moduleSymbolNames: Set<string>;
}

export function generatedFactoryTransform(
    factoryMap: Map<string, FactoryInfo>,
    coreImportsFrom: ts.SourceFile | null): ts.TransformerFactory<ts.SourceFile> {
  return (context: ts.TransformationContext): ts.Transformer<ts.SourceFile> => {
    return (file: ts.SourceFile): ts.SourceFile => {
      return transformFactorySourceFile(factoryMap, context, coreImportsFrom, file);
    };
  };
}

function transformFactorySourceFile(
    factoryMap: Map<string, FactoryInfo>, context: ts.TransformationContext,
    coreImportsFrom: ts.SourceFile | null, file: ts.SourceFile): ts.SourceFile {
  // If this is not a generated file, it won't have factory info associated with it.
  if (!factoryMap.has(file.fileName)) {
    // Don't transform non-generated code.
    return file;
  }

  const {moduleSymbolNames, sourceFilePath} = factoryMap.get(file.fileName) !;

  const clone = ts.getMutableClone(file);

  const transformedStatements = file.statements.map(stmt => {
    if (coreImportsFrom !== null && ts.isImportDeclaration(stmt) &&
        ts.isStringLiteral(stmt.moduleSpecifier) && stmt.moduleSpecifier.text === '@angular/core') {
      const path = relativePathBetween(sourceFilePath, coreImportsFrom.fileName);
      if (path !== null) {
        return ts.updateImportDeclaration(
            stmt, stmt.decorators, stmt.modifiers, stmt.importClause, ts.createStringLiteral(path));
      } else {
        return ts.createNotEmittedStatement(stmt);
      }
    } else if (ts.isVariableStatement(stmt) && stmt.declarationList.declarations.length === 1) {
      const decl = stmt.declarationList.declarations[0];
      if (ts.isIdentifier(decl.name)) {
        const match = STRIP_NG_FACTORY.exec(decl.name.text);
        if (match === null || !moduleSymbolNames.has(match[1])) {
          // Remove the given factory as it wasn't actually for an NgModule.
          return ts.createNotEmittedStatement(stmt);
        }
      }
      return stmt;
    } else {
      return stmt;
    }
  });
  if (!transformedStatements.some(ts.isVariableStatement)) {
    // If the resulting file has no factories, include an empty export to
    // satisfy closure compiler.
    transformedStatements.push(ts.createVariableStatement(
        [ts.createModifier(ts.SyntaxKind.ExportKeyword)],
        ts.createVariableDeclarationList(
            [ts.createVariableDeclaration('ɵNonEmptyModule', undefined, ts.createTrue())],
            ts.NodeFlags.Const)));
  }
  clone.statements = ts.createNodeArray(transformedStatements);
  return clone;
}
