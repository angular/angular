/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';
import { makeProgram } from '../helpers/utils';
import { Esm2015ReflectionHost } from '../../src/host/esm2015_host';
import { Esm2015PackageParser } from '../../src/parser/esm2015_parser';

const BASIC_FILE = {
  name: '/primary.js',
  contents: `
  class A {}
  A.decorators = [
    { type: Directive, args: [{ selector: '[a]' }] }
  ];

  class B {}
  B.decorators = [
    { type: Directive, args: [{ selector: '[b]' }] }
  ];

  function x() {}

  function y() {}

  class C {}

  export { A, x, C };
  `
};

describe('Esm2015PackageParser', () => {
  describe('getDecoratedClasses()', () => {
    it('should return an array of object for each class that is exported and decorated', () => {
      const program = makeProgram(BASIC_FILE);
      const host = new Esm2015ReflectionHost(program.getTypeChecker());
      const parser = new Esm2015PackageParser(program, host);

      const decoratedClasses = parser.getDecoratedExportedClasses(program.getSourceFile(BASIC_FILE.name)!);

      expect(decoratedClasses.length).toEqual(1);
      const decoratedClass = decoratedClasses[0];
      expect(decoratedClass.name).toEqual('A');
      expect(ts.isClassDeclaration(decoratedClass.declaration)).toBeTruthy();
      expect(decoratedClass.decorators.map(decorator => decorator.name)).toEqual(['Directive']);
    });
  });
});