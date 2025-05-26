/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {outputAst as o} from '@angular/compiler';
import {TypeScriptAstFactory} from '../../../src/ngtsc/translator';
import ts from 'typescript';

import {Translator} from '../../src/file_linker/translator';
import {LinkerImportGenerator} from '../../src/linker_import_generator';

import {generate} from './helpers';

describe('Translator', () => {
  const ngImport = ts.factory.createIdentifier('ngImport');
  let factory: TypeScriptAstFactory;
  let importGenerator: LinkerImportGenerator<ts.Statement, ts.Expression>;

  beforeEach(() => {
    factory = new TypeScriptAstFactory(/* annotateForClosureCompiler */ false);
    importGenerator = new LinkerImportGenerator<ts.Statement, ts.Expression>(factory, ngImport);
  });

  describe('translateExpression()', () => {
    it('should generate expression specific output', () => {
      const translator = new Translator<ts.Statement, ts.Expression>(factory);
      const outputAst = o.variable('foo').set(o.literal(42));
      const translated = translator.translateExpression(outputAst, importGenerator);
      expect(generate(translated)).toEqual('foo = 42');
    });
  });

  describe('translateStatement()', () => {
    it('should generate statement specific output', () => {
      const translator = new Translator<ts.Statement, ts.Expression>(factory);
      const outputAst = new o.ExpressionStatement(o.variable('foo').set(o.literal(42)));
      const translated = translator.translateStatement(outputAst, importGenerator);
      expect(generate(translated)).toEqual('foo = 42;');
    });
  });
});
