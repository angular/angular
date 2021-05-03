/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {LinkerImportGenerator} from '../src/linker_import_generator';

const ngImport = {
  ngImport: true
};

describe('LinkerImportGenerator<TExpression>', () => {
  describe('generateNamespaceImport()', () => {
    it('should error if the import is not `@angular/core`', () => {
      const generator = new LinkerImportGenerator(ngImport);
      expect(() => generator.generateNamespaceImport('other/import'))
          .toThrowError(`Unable to import from anything other than '@angular/core'`);
    });

    it('should return the ngImport expression for `@angular/core`', () => {
      const generator = new LinkerImportGenerator(ngImport);
      expect(generator.generateNamespaceImport('@angular/core')).toBe(ngImport);
    });
  });

  describe('generateNamedImport()', () => {
    it('should error if the import is not `@angular/core`', () => {
      const generator = new LinkerImportGenerator(ngImport);
      expect(() => generator.generateNamedImport('other/import', 'someSymbol'))
          .toThrowError(`Unable to import from anything other than '@angular/core'`);
    });

    it('should return a `NamedImport` object containing the ngImport expression', () => {
      const generator = new LinkerImportGenerator(ngImport);
      expect(generator.generateNamedImport('@angular/core', 'someSymbol'))
          .toEqual({moduleImport: ngImport, symbol: 'someSymbol'});
    });
  });
});
