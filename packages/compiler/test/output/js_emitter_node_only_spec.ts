/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {StaticSymbol} from '@angular/compiler/src/aot/static_symbol';
import {CompileIdentifierMetadata} from '@angular/compiler/src/compile_metadata';
import {JavaScriptEmitter} from '@angular/compiler/src/output/js_emitter';
import * as o from '@angular/compiler/src/output/output_ast';
import {ImportResolver} from '@angular/compiler/src/output/path_util';
import {SourceMap} from '@angular/compiler/src/output/source_map';
import {ParseLocation, ParseSourceFile, ParseSourceSpan} from '@angular/compiler/src/parse_util';

import {extractSourceMap, originalPositionFor} from './source_map_util';

const someGenFilePath = 'somePackage/someGenFile';
const someSourceFilePath = 'somePackage/someSourceFile';

class SimpleJsImportGenerator implements ImportResolver {
  fileNameToModuleName(importedUrlStr: string, moduleUrlStr: string): string {
    return importedUrlStr;
  }
  getImportAs(symbol: StaticSymbol): StaticSymbol|null { return null; }
  getTypeArity(symbol: StaticSymbol): number|null { return null; }
}

export function main() {
  describe('JavaScriptEmitter', () => {
    let importResolver: ImportResolver;
    let emitter: JavaScriptEmitter;
    let someVar: o.ReadVarExpr;

    beforeEach(() => {
      importResolver = new SimpleJsImportGenerator();
      emitter = new JavaScriptEmitter(importResolver);
    });

    function emitSourceMap(
        stmt: o.Statement | o.Statement[], exportedVars: string[] | null = null,
        preamble?: string): SourceMap {
      const stmts = Array.isArray(stmt) ? stmt : [stmt];
      const source = emitter.emitStatements(
          someSourceFilePath, someGenFilePath, stmts, exportedVars || [], preamble);
      return extractSourceMap(source) !;
    }

    describe('source maps', () => {
      it('should emit an inline source map', () => {
        const source = new ParseSourceFile(';;;var', 'in.js');
        const startLocation = new ParseLocation(source, 0, 0, 3);
        const endLocation = new ParseLocation(source, 7, 0, 6);
        const sourceSpan = new ParseSourceSpan(startLocation, endLocation);
        const someVar = o.variable('someVar', null, sourceSpan);
        const sm = emitSourceMap(someVar.toStmt(), [], '/* MyPreamble \n */');

        expect(sm.sources).toEqual([someSourceFilePath, 'in.js']);
        expect(sm.sourcesContent).toEqual([' ', ';;;var']);
        expect(originalPositionFor(sm, {line: 3, column: 0}))
            .toEqual({line: 1, column: 3, source: 'in.js'});
      });
    });
  });
}
