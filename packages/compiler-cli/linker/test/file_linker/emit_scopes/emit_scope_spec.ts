/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as o from '@angular/compiler/src/output/output_ast';
import ts from 'typescript';

import {TypeScriptAstFactory} from '../../../../src/ngtsc/translator';
import {EmitScope} from '../../../src/file_linker/emit_scopes/emit_scope';
import {Translator} from '../../../src/file_linker/translator';
import {generate} from '../helpers';

describe('EmitScope', () => {
  describe('translateDefinition()', () => {
    it('should translate the given output AST into a TExpression', () => {
      const factory = new TypeScriptAstFactory(/* annotateForClosureCompiler */ false);
      const translator = new Translator<ts.Statement, ts.Expression>(factory);
      const ngImport = factory.createIdentifier('core');
      const emitScope = new EmitScope<ts.Statement, ts.Expression>(ngImport, translator, factory);

      const def = emitScope.translateDefinition({
        expression: o.fn([], [], null, null, 'foo'),
        statements: [],
      });
      expect(generate(def)).toEqual('function foo() { }');
    });

    it('should use an IIFE if the definition being emitted includes associated statements', () => {
      const factory = new TypeScriptAstFactory(/* annotateForClosureCompiler */ false);
      const translator = new Translator<ts.Statement, ts.Expression>(factory);
      const ngImport = factory.createIdentifier('core');
      const emitScope = new EmitScope<ts.Statement, ts.Expression>(ngImport, translator, factory);

      const def = emitScope.translateDefinition({
        expression: o.fn([], [], null, null, 'foo'),
        statements: [o.variable('testFn').callFn([]).toStmt()],
      });
      expect(generate(def)).toEqual('function () { testFn(); return function foo() { }; }()');
    });

    it('should use the `ngImport` identifier for imports when translating', () => {
      const factory = new TypeScriptAstFactory(/* annotateForClosureCompiler */ false);
      const translator = new Translator<ts.Statement, ts.Expression>(factory);
      const ngImport = factory.createIdentifier('core');
      const emitScope = new EmitScope<ts.Statement, ts.Expression>(ngImport, translator, factory);

      const coreImportRef = new o.ExternalReference('@angular/core', 'foo');
      const def = emitScope.translateDefinition({
        expression: o.importExpr(coreImportRef).prop('bar').callFn([]),
        statements: [],
      });
      expect(generate(def)).toEqual('core.foo.bar()');
    });

    it('should not emit any shared constants in the replacement expression', () => {
      const factory = new TypeScriptAstFactory(/* annotateForClosureCompiler */ false);
      const translator = new Translator<ts.Statement, ts.Expression>(factory);
      const ngImport = factory.createIdentifier('core');
      const emitScope = new EmitScope<ts.Statement, ts.Expression>(ngImport, translator, factory);

      const constArray = o.literalArr([o.literal('CONST')]);
      // We have to add the constant twice or it will not create a shared statement
      emitScope.constantPool.getConstLiteral(constArray);
      emitScope.constantPool.getConstLiteral(constArray);

      const def = emitScope.translateDefinition({
        expression: o.fn([], [], null, null, 'foo'),
        statements: [],
      });
      expect(generate(def)).toEqual('function foo() { }');
    });
  });

  describe('getConstantStatements()', () => {
    it('should return any constant statements that were added to the `constantPool`', () => {
      const factory = new TypeScriptAstFactory(/* annotateForClosureCompiler */ false);
      const translator = new Translator<ts.Statement, ts.Expression>(factory);
      const ngImport = factory.createIdentifier('core');
      const emitScope = new EmitScope<ts.Statement, ts.Expression>(ngImport, translator, factory);

      const constArray = o.literalArr([o.literal('CONST')]);
      // We have to add the constant twice or it will not create a shared statement
      emitScope.constantPool.getConstLiteral(constArray);
      emitScope.constantPool.getConstLiteral(constArray);

      const statements = emitScope.getConstantStatements();
      expect(statements.map(generate)).toEqual(['const _c0 = ["CONST"];']);
    });
  });
});
