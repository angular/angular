/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {AbsoluteFsPath, absoluteFrom} from '../../file_system';
import {isNonDeclarationTsPath} from '../../util/src/typescript';

import {ShimGenerator} from './host';
import {generatedModuleName} from './util';

export class SummaryGenerator implements ShimGenerator {
  private constructor(private map: Map<AbsoluteFsPath, string>) {}

  getSummaryFileNames(): string[] { return Array.from(this.map.keys()); }

  recognize(fileName: AbsoluteFsPath): boolean { return this.map.has(fileName); }

  generate(genFilePath: AbsoluteFsPath, readFile: (fileName: string) => ts.SourceFile | null):
      ts.SourceFile|null {
    const originalPath = this.map.get(genFilePath) !;
    const original = readFile(originalPath);
    if (original === null) {
      return null;
    }

    // Collect a list of classes that need to have factory types emitted for them. This list is
    // overly broad as at this point the ts.TypeChecker has not been created and so it can't be used
    // to semantically understand which decorators are Angular decorators. It's okay to output an
    // overly broad set of summary exports as the exports are no-ops anyway, and summaries are a
    // compatibility layer which will be removed after Ivy is enabled.
    const symbolNames: string[] = [];
    for (const stmt of original.statements) {
      if (ts.isClassDeclaration(stmt)) {
        // If the class isn't exported, or if it's not decorated, then skip it.
        if (!isExported(stmt) || stmt.decorators === undefined || stmt.name === undefined) {
          continue;
        }
        symbolNames.push(stmt.name.text);
      } else if (ts.isExportDeclaration(stmt)) {
        // Look for an export statement of the form "export {...};". If it doesn't match that, then
        // skip it.
        if (stmt.exportClause === undefined || stmt.moduleSpecifier !== undefined) {
          continue;
        }

        for (const specifier of stmt.exportClause.elements) {
          // At this point, there is no guarantee that specifier here refers to a class declaration,
          // but that's okay.

          // Use specifier.name as that's guaranteed to be the exported name, regardless of whether
          // specifier.propertyName is set.
          symbolNames.push(specifier.name.text);
        }
      }
    }

    const varLines = symbolNames.map(name => `export const ${name}NgSummary: any = null;`);

    if (varLines.length === 0) {
      // In the event there are no other exports, add an empty export to ensure the generated
      // summary file is still an ES module.
      varLines.push(`export const ɵempty = null;`);
    }
    const sourceText = varLines.join('\n');
    const genFile = ts.createSourceFile(
        genFilePath, sourceText, original.languageVersion, true, ts.ScriptKind.TS);
    if (original.moduleName !== undefined) {
      genFile.moduleName =
          generatedModuleName(original.moduleName, original.fileName, '.ngsummary');
    }
    return genFile;
  }

  static forRootFiles(files: ReadonlyArray<AbsoluteFsPath>): SummaryGenerator {
    const map = new Map<AbsoluteFsPath, string>();
    files.filter(sourceFile => isNonDeclarationTsPath(sourceFile))
        .forEach(
            sourceFile =>
                map.set(absoluteFrom(sourceFile.replace(/\.ts$/, '.ngsummary.ts')), sourceFile));
    return new SummaryGenerator(map);
  }
}

function isExported(decl: ts.Declaration): boolean {
  return decl.modifiers !== undefined &&
      decl.modifiers.some(mod => mod.kind == ts.SyntaxKind.ExportKeyword);
}
