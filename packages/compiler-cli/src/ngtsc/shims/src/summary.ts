/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {ShimGenerator} from './host';

export class SummaryGenerator implements ShimGenerator {
  private constructor(private map: Map<string, string>) {}

  getSummaryFileNames(): string[] { return Array.from(this.map.keys()); }

  recognize(fileName: string): string|null { return this.map.get(fileName) || null; }

  generate(original: ts.SourceFile, genFilePath: string): ts.SourceFile {
    // Collect a list of classes that need to have factory types emitted for them.
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
    varLines.push(`export const ɵempty = null;`);
    const sourceText = varLines.join('\n');
    return ts.createSourceFile(
        genFilePath, sourceText, original.languageVersion, true, ts.ScriptKind.TS);
  }

  static forRootFiles(files: ReadonlyArray<string>): SummaryGenerator {
    const map = new Map<string, string>();
    files.filter(sourceFile => !sourceFile.endsWith('.d.ts'))
        .forEach(sourceFile => map.set(sourceFile.replace(/\.ts$/, '.ngsummary.ts'), sourceFile));
    return new SummaryGenerator(map);
  }
}

function isExported(decl: ts.Declaration): boolean {
  return decl.modifiers !== undefined &&
      decl.modifiers.some(mod => mod.kind == ts.SyntaxKind.ExportKeyword);
}
