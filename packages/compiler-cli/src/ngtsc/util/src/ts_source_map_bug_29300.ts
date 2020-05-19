/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';

let _tsSourceMapBug29300Fixed: boolean|undefined;

/**
 * Test the current version of TypeScript to see if it has fixed the external SourceMap
 * file bug: https://github.com/Microsoft/TypeScript/issues/29300.
 *
 * The bug is fixed in TS 3.3+ but this check avoid us having to rely upon the version number,
 * and allows us to gracefully fail if the TS version still has the bug.
 *
 * We check for the bug by compiling a very small program `a;` and transforming it to `b;`,
 * where we map the new `b` identifier to an external source file, which has different lines to
 * the original source file.  If the bug is fixed then the output SourceMap should contain
 * mappings that correspond ot the correct line/col pairs for this transformed node.
 *
 * @returns true if the bug is fixed.
 */
export function tsSourceMapBug29300Fixed() {
  if (_tsSourceMapBug29300Fixed === undefined) {
    let writtenFiles: {[filename: string]: string} = {};
    const sourceFile =
        ts.createSourceFile('test.ts', 'a;', ts.ScriptTarget.ES2015, true, ts.ScriptKind.TS);
    const host = {
      getSourceFile(): ts.SourceFile |
          undefined {
            return sourceFile;
          },
      fileExists(): boolean {
        return true;
      },
      readFile(): string |
          undefined {
            return '';
          },
      writeFile(fileName: string, data: string) {
        writtenFiles[fileName] = data;
      },
      getDefaultLibFileName(): string {
        return '';
      },
      getCurrentDirectory(): string {
        return '';
      },
      getDirectories(): string[] {
        return [];
      },
      getCanonicalFileName(): string {
        return '';
      },
      useCaseSensitiveFileNames(): boolean {
        return true;
      },
      getNewLine(): string {
        return '\n';
      },
    };

    const transform = (context: ts.TransformationContext) => {
      return (node: ts.SourceFile) => ts.visitNode(node, visitor);
      function visitor(node: ts.Node): ts.Node {
        if (ts.isIdentifier(node) && node.text === 'a') {
          const newNode = ts.createIdentifier('b');
          ts.setSourceMapRange(newNode, {
            pos: 16,
            end: 16,
            source: ts.createSourceMapSource('test.html', 'abc\ndef\nghi\njkl\nmno\npqr')
          });
          return newNode;
        }
        return ts.visitEachChild(node, visitor, context);
      }
    };

    const program = ts.createProgram(['test.ts'], {sourceMap: true}, host);
    program.emit(sourceFile, undefined, undefined, undefined, {after: [transform]});
    // The first two mappings in the source map should look like:
    // [0,1,4,0] col 0 => source file 1, row 4, column 0)
    // [1,0,0,0] col 1 => source file 1, row 4, column 0)
    _tsSourceMapBug29300Fixed = /ACIA,CAAA/.test(writtenFiles['test.js.map']);
  }
  return _tsSourceMapBug29300Fixed;
}
