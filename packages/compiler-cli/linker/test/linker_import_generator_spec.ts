/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import ts from 'typescript';

import {TypeScriptAstFactory} from '../../src/ngtsc/translator';
import {LinkerImportGenerator} from '../src/linker_import_generator';

const ngImport = ts.factory.createIdentifier('ngImport');

describe('LinkerImportGenerator<TExpression>', () => {
  describe('generateNamespaceImport()', () => {
    it('should error if the import is not `@angular/core`', () => {
      const generator = new LinkerImportGenerator<ts.Statement, ts.Expression>(
        new TypeScriptAstFactory(false),
        ngImport,
      );

      expect(() =>
        generator.addImport({
          exportModuleSpecifier: 'other/import',
          exportSymbolName: null,
          requestedFile: null,
        }),
      ).toThrowError(`Unable to import from anything other than '@angular/core'`);
    });

    it('should return the ngImport expression for `@angular/core`', () => {
      const generator = new LinkerImportGenerator<ts.Statement, ts.Expression>(
        new TypeScriptAstFactory(false),
        ngImport,
      );

      expect(
        generator.addImport({
          exportModuleSpecifier: '@angular/core',
          exportSymbolName: null,
          requestedFile: null,
        }),
      ).toBe(ngImport);
    });
  });

  describe('generateNamedImport()', () => {
    it('should error if the import is not `@angular/core`', () => {
      const generator = new LinkerImportGenerator<ts.Statement, ts.Expression>(
        new TypeScriptAstFactory(false),
        ngImport,
      );

      expect(() =>
        generator.addImport({
          exportModuleSpecifier: 'other/import',
          exportSymbolName: 'someSymbol',
          requestedFile: null,
        }),
      ).toThrowError(`Unable to import from anything other than '@angular/core'`);
    });

    it('should return a `NamedImport` object containing the ngImport expression', () => {
      const generator = new LinkerImportGenerator<ts.Statement, ts.Expression>(
        new TypeScriptAstFactory(false),
        ngImport,
      );

      const result = generator.addImport({
        exportModuleSpecifier: '@angular/core',
        exportSymbolName: 'someSymbol',
        requestedFile: null,
      });

      expect(ts.isPropertyAccessExpression(result)).toBe(true);
      expect((result as ts.PropertyAccessExpression).name.text).toBe('someSymbol');
      expect((result as ts.PropertyAccessExpression).expression).toBe(ngImport);
    });
  });
});
