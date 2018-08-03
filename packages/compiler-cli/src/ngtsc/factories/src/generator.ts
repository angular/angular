/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as path from 'path';
import * as ts from 'typescript';

const TS_DTS_SUFFIX = /(\.d)?\.ts$/;

/**
 * Generates ts.SourceFiles which contain variable declarations for NgFactories for every exported
 * class of an input ts.SourceFile.
 */
export class FactoryGenerator {
  factoryFor(original: ts.SourceFile, genFilePath: string): ts.SourceFile {
    const relativePathToSource =
        './' + path.posix.basename(original.fileName).replace(TS_DTS_SUFFIX, '');
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

  computeFactoryFileMap(files: ReadonlyArray<string>): Map<string, string> {
    const map = new Map<string, string>();
    files.filter(sourceFile => !sourceFile.endsWith('.d.ts'))
        .forEach(sourceFile => map.set(sourceFile.replace(/\.ts$/, '.ngfactory.ts'), sourceFile));
    return map;
  }
}

function isExported(decl: ts.Declaration): boolean {
  return decl.modifiers !== undefined &&
      decl.modifiers.some(mod => mod.kind == ts.SyntaxKind.ExportKeyword);
}
