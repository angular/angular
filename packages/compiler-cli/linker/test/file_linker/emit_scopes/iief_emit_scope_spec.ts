/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as o from '@angular/compiler/src/output/output_ast';
import * as ts from 'typescript';

import {TypeScriptAstFactory} from '../../../../src/ngtsc/translator';
import {IifeEmitScope} from '../../../src/file_linker/emit_scopes/iife_emit_scope';
import {Translator} from '../../../src/file_linker/translator';
import {generate} from '../helpers';

describe('IifeEmitScope', () => {
  describe('translateDefinition()', () => {
    it('should translate the given output AST into a TExpression, wrapped in an IIFE', () => {
      const factory = new TypeScriptAstFactory(/* annotateForClosureCompiler */ false);
      const translator = new Translator<ts.Statement, ts.Expression>(factory);
      const ngImport = factory.createIdentifier('core');
      const emitScope =
          new IifeEmitScope<ts.Statement, ts.Expression>(ngImport, translator, factory);

      const def = emitScope.translateDefinition(o.fn([], [], null, null, 'foo'));
      expect(generate(def)).toEqual('function () { return function foo() { }; }()');
    });

    it('should use the `ngImport` idenfifier for imports when translating', () => {
      const factory = new TypeScriptAstFactory(/* annotateForClosureCompiler */ false);
      const translator = new Translator<ts.Statement, ts.Expression>(factory);
      const ngImport = factory.createIdentifier('core');
      const emitScope =
          new IifeEmitScope<ts.Statement, ts.Expression>(ngImport, translator, factory);

      const coreImportRef = new o.ExternalReference('@angular/core', 'foo');
      const def = emitScope.translateDefinition(o.importExpr(coreImportRef).callMethod('bar', []));
      expect(generate(def)).toEqual('function () { return core.foo.bar(); }()');
    });

    it('should emit any shared constants in the replacement expression IIFE', () => {
      const factory = new TypeScriptAstFactory(/* annotateForClosureCompiler */ false);
      const translator = new Translator<ts.Statement, ts.Expression>(factory);
      const ngImport = factory.createIdentifier('core');
      const emitScope =
          new IifeEmitScope<ts.Statement, ts.Expression>(ngImport, translator, factory);

      const constArray = o.literalArr([o.literal('CONST')]);
      // We have to add the constant twice or it will not create a shared statement
      emitScope.constantPool.getConstLiteral(constArray);
      emitScope.constantPool.getConstLiteral(constArray);

      const def = emitScope.translateDefinition(o.fn([], [], null, null, 'foo'));
      expect(generate(def))
          .toEqual('function () { const _c0 = ["CONST"]; return function foo() { }; }()');
    });
  });

  describe('getConstantStatements()', () => {
    it('should throw an error', () => {
      const factory = new TypeScriptAstFactory(/* annotateForClosureCompiler */ false);
      const translator = new Translator<ts.Statement, ts.Expression>(factory);
      const ngImport = factory.createIdentifier('core');
      const emitScope =
          new IifeEmitScope<ts.Statement, ts.Expression>(ngImport, translator, factory);
      expect(() => emitScope.getConstantStatements()).toThrowError();
    });
  });
});
