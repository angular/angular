/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {ShimGenerator} from './host';
import {isNonDeclarationTsFile} from './util';

export class SummaryGenerator implements ShimGenerator {
  private constructor(private map: Map<string, string>) {}

  getSummaryFileNames(): string[] { return Array.from(this.map.keys()); }

  getOriginalSourceOfShim(fileName: string): string|null { return this.map.get(fileName) || null; }

  generate(original: ts.SourceFile, genFilePath: string): ts.SourceFile {
    // Collect a list of classes that need to have factory types emitted for them. This list is
    // overly broad as at this point the ts.TypeChecker has not been created and so it can't be used
    // to semantically understand which decorators are Angular decorators. It's okay to output an
    // overly broad set of summary exports as the exports are no-ops anyway, and summaries are a
    // compatibility layer which will be removed after Ivy is enabled.
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

    const varLines = symbolNames.map(name => `export const ${name}NgSummary: any = null;`);

    if (varLines.length === 0) {
      // In the event there are no other exports, add an empty export to ensure the generated
      // summary file is still an ES module.
      varLines.push(`export const ɵempty = null;`);
    }
    const sourceText = varLines.join('\n');
    return ts.createSourceFile(
        genFilePath, sourceText, original.languageVersion, true, ts.ScriptKind.TS);
  }

  static forRootFiles(files: ReadonlyArray<string>): SummaryGenerator {
    const map = new Map<string, string>();
    files.filter(sourceFile => isNonDeclarationTsFile(sourceFile))
        .forEach(sourceFile => map.set(sourceFile.replace(/\.ts$/, '.ngsummary.ts'), sourceFile));
    return new SummaryGenerator(map);
  }
}

function isExported(decl: ts.Declaration): boolean {
  return decl.modifiers !== undefined &&
      decl.modifiers.some(mod => mod.kind == ts.SyntaxKind.ExportKeyword);
}
