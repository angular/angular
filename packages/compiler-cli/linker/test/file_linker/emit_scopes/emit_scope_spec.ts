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
import {TypeScriptAstHost} from '../../../src/ast/typescript/typescript_ast_host';
import {EmitScope} from '../../../src/file_linker/emit_scopes/emit_scope';
import {LinkerEnvironment} from '../../../src/file_linker/linker_environment';
import {DEFAULT_LINKER_OPTIONS} from '../../../src/file_linker/linker_options';
import {generate} from '../helpers';

describe('EmitScope', () => {
  describe('translateDefinition()', () => {
    it('should translate the given output AST into a TExpression', () => {
      const factory = new TypeScriptAstFactory();
      const linkerEnvironment = LinkerEnvironment.create<ts.Statement, ts.Expression>(
          new TypeScriptAstHost(), factory, DEFAULT_LINKER_OPTIONS);
      const ngImport = factory.createIdentifier('core');
      const emitScope = new EmitScope<ts.Statement, ts.Expression>(ngImport, linkerEnvironment);

      const def = emitScope.translateDefinition(o.fn([], [], null, null, 'foo'));
      expect(generate(def)).toEqual('function foo() { }');
    });

    it('should use the `ngImport` idenfifier for imports when translating', () => {
      const factory = new TypeScriptAstFactory();
      const linkerEnvironment = LinkerEnvironment.create<ts.Statement, ts.Expression>(
          new TypeScriptAstHost(), factory, DEFAULT_LINKER_OPTIONS);
      const ngImport = factory.createIdentifier('core');
      const emitScope = new EmitScope<ts.Statement, ts.Expression>(ngImport, linkerEnvironment);

      const coreImportRef = new o.ExternalReference('@angular/core', 'foo');
      const def = emitScope.translateDefinition(o.importExpr(coreImportRef).callMethod('bar', []));
      expect(generate(def)).toEqual('core.foo.bar()');
    });

    it('should not emit any shared constants in the replacement expression', () => {
      const factory = new TypeScriptAstFactory();
      const linkerEnvironment = LinkerEnvironment.create<ts.Statement, ts.Expression>(
          new TypeScriptAstHost(), factory, DEFAULT_LINKER_OPTIONS);
      const ngImport = factory.createIdentifier('core');
      const emitScope = new EmitScope<ts.Statement, ts.Expression>(ngImport, linkerEnvironment);

      const constArray = o.literalArr([o.literal('CONST')]);
      // We have to add the constant twice or it will not create a shared statement
      emitScope.constantPool.getConstLiteral(constArray);
      emitScope.constantPool.getConstLiteral(constArray);

      const def = emitScope.translateDefinition(o.fn([], [], null, null, 'foo'));
      expect(generate(def)).toEqual('function foo() { }');
    });
  });

  describe('getConstantStatements()', () => {
    it('should return any constant statements that were added to the `constantPool`', () => {
      const factory = new TypeScriptAstFactory();
      const linkerEnvironment = LinkerEnvironment.create<ts.Statement, ts.Expression>(
          new TypeScriptAstHost(), factory, DEFAULT_LINKER_OPTIONS);
      const ngImport = factory.createIdentifier('core');
      const emitScope = new EmitScope<ts.Statement, ts.Expression>(ngImport, linkerEnvironment);

      const constArray = o.literalArr([o.literal('CONST')]);
      // We have to add the constant twice or it will not create a shared statement
      emitScope.constantPool.getConstLiteral(constArray);
      emitScope.constantPool.getConstLiteral(constArray);

      const statements = emitScope.getConstantStatements();
      expect(statements.map(generate)).toEqual(['const _c0 = ["CONST"];']);
    });
  });
});
