/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as o from '@angular/compiler';
import {ImportGenerator, NamedImport, TypeScriptAstFactory} from '@angular/compiler-cli/src/ngtsc/translator';
import * as ts from 'typescript';

import {Translator} from '../../src/file_linker/translator';
import {generate} from './helpers';

describe('Translator', () => {
  let factory: TypeScriptAstFactory;
  beforeEach(() => factory = new TypeScriptAstFactory(/* annotateForClosureCompiler */ false));

  describe('translateExpression()', () => {
    it('should generate expression specific output', () => {
      const translator = new Translator<ts.Statement, ts.Expression>(factory);
      const outputAst = new o.WriteVarExpr('foo', new o.LiteralExpr(42));
      const translated = translator.translateExpression(outputAst, new MockImportGenerator());
      expect(generate(translated)).toEqual('(foo = 42)');
    });
  });

  describe('translateStatement()', () => {
    it('should generate statement specific output', () => {
      const translator = new Translator<ts.Statement, ts.Expression>(factory);
      const outputAst = new o.ExpressionStatement(new o.WriteVarExpr('foo', new o.LiteralExpr(42)));
      const translated = translator.translateStatement(outputAst, new MockImportGenerator());
      expect(generate(translated)).toEqual('foo = 42;');
    });
  });
  class MockImportGenerator implements ImportGenerator<ts.Expression> {
    generateNamespaceImport(moduleName: string): ts.Expression {
      return factory.createLiteral(moduleName);
    }
    generateNamedImport(moduleName: string, originalSymbol: string): NamedImport<ts.Expression> {
      return {
        moduleImport: factory.createLiteral(moduleName),
        symbol: originalSymbol,
      };
    }
  }
});
