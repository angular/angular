/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {ConstantPool, outputAst as o} from '@angular/compiler';
import ts from 'typescript';

import {TypeScriptAstFactory} from '../../../../src/ngtsc/translator';
import {LocalEmitScope} from '../../../src/file_linker/emit_scopes/local_emit_scope';
import {Translator} from '../../../src/file_linker/translator';
import {generate} from '../helpers';

describe('LocalEmitScope', () => {
  describe('translateDefinition()', () => {
    it('should translate the given output AST into a TExpression, wrapped in an IIFE', () => {
      const factory = new TypeScriptAstFactory(/* annotateForClosureCompiler */ false);
      const translator = new Translator<ts.Statement, ts.Expression>(factory);
      const ngImport = factory.createIdentifier('core');
      const emitScope = new LocalEmitScope<ts.Statement, ts.Expression>(
        ngImport,
        translator,
        factory,
      );
      addSharedStatement(emitScope.constantPool);

      const def = emitScope.translateDefinition({
        expression: o.fn([], [], null, null, 'foo'),
        statements: [],
      });
      expect(generate(def)).toEqual(
        'function () { const _c0 = ["CONST"]; return function foo() { }; }()',
      );
    });

    it('should use the `ngImport` identifier for imports when translating', () => {
      const factory = new TypeScriptAstFactory(/* annotateForClosureCompiler */ false);
      const translator = new Translator<ts.Statement, ts.Expression>(factory);
      const ngImport = factory.createIdentifier('core');
      const emitScope = new LocalEmitScope<ts.Statement, ts.Expression>(
        ngImport,
        translator,
        factory,
      );
      addSharedStatement(emitScope.constantPool);

      const coreImportRef = new o.ExternalReference('@angular/core', 'foo');
      const def = emitScope.translateDefinition({
        expression: o.importExpr(coreImportRef).prop('bar').callFn([]),
        statements: [],
      });
      expect(generate(def)).toEqual(
        'function () { const _c0 = ["CONST"]; return core.foo.bar(); }()',
      );
    });

    it('should not emit an IIFE if there are no shared constants', () => {
      const factory = new TypeScriptAstFactory(/* annotateForClosureCompiler */ false);
      const translator = new Translator<ts.Statement, ts.Expression>(factory);
      const ngImport = factory.createIdentifier('core');
      const emitScope = new LocalEmitScope<ts.Statement, ts.Expression>(
        ngImport,
        translator,
        factory,
      );

      const def = emitScope.translateDefinition({
        expression: o.fn([], [], null, null, 'foo'),
        statements: [],
      });
      expect(generate(def)).toEqual('function foo() { }');
    });
  });

  describe('getConstantStatements()', () => {
    it('should throw an error', () => {
      const factory = new TypeScriptAstFactory(/* annotateForClosureCompiler */ false);
      const translator = new Translator<ts.Statement, ts.Expression>(factory);
      const ngImport = factory.createIdentifier('core');
      const emitScope = new LocalEmitScope<ts.Statement, ts.Expression>(
        ngImport,
        translator,
        factory,
      );
      expect(() => emitScope.getConstantStatements()).toThrowError();
    });
  });
});

function addSharedStatement(constantPool: ConstantPool): void {
  const constArray = o.literalArr([o.literal('CONST')]);
  // We have to add the constant twice or it will not create a shared statement
  constantPool.getConstLiteral(constArray);
  constantPool.getConstLiteral(constArray);
}
