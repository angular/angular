/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ParseLocation, ParseSourceFile} from '@angular/compiler';
import {StaticSymbol} from '@angular/compiler/src/aot/static_symbol';
import * as o from '@angular/compiler/src/output/output_ast';
import {SourceMap} from '@angular/compiler/src/output/source_map';
import {TypeScriptEmitter} from '@angular/compiler/src/output/ts_emitter';
import {ParseSourceSpan} from '@angular/compiler/src/parse_util';

import {extractSourceMap, originalPositionFor} from '@angular/compiler/testing/src/output/source_map_util';

const someGenFilePath = 'somePackage/someGenFile';

{
  // Not supported features of our OutputAst in TS:
  // - real `const` like in Dart
  // - final fields

  describe('TypeScriptEmitter', () => {
    let emitter: TypeScriptEmitter;
    let someVar: o.ReadVarExpr;

    beforeEach(() => {
      emitter = new TypeScriptEmitter();
      someVar = o.variable('someVar');
    });

    function emitSourceMap(stmt: o.Statement|o.Statement[], preamble?: string): SourceMap {
      const stmts = Array.isArray(stmt) ? stmt : [stmt];
      const source = emitter.emitStatements(someGenFilePath, stmts, preamble);
      return extractSourceMap(source)!;
    }

    describe('source maps', () => {
      it('should emit an inline source map', () => {
        const source = new ParseSourceFile(';;;var', 'in.js');
        const startLocation = new ParseLocation(source, 0, 0, 3);
        const endLocation = new ParseLocation(source, 7, 0, 6);
        const sourceSpan = new ParseSourceSpan(startLocation, endLocation);
        const someVar = o.variable('someVar', null, sourceSpan);
        const sm = emitSourceMap(someVar.toStmt(), '/* MyPreamble \n */');

        expect(sm.sources).toEqual([someGenFilePath, 'in.js']);
        expect(sm.sourcesContent).toEqual([' ', ';;;var']);
        expect(originalPositionFor(sm, {line: 3, column: 0}))
            .toEqual({line: 1, column: 3, source: 'in.js'});
      });
    });
  });
}
