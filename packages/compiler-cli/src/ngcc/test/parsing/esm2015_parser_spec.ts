/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {Fesm2015ReflectionHost} from '../../src/host/fesm2015_host';
import {Esm2015FileParser} from '../../src/parsing/esm2015_parser';
import {makeProgram} from '../helpers/utils';

const BASIC_FILE = {
  name: '/primary.js',
  contents: `
  import {Directive} from '@angular/core';
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

  let D = class D {}
  D = tslib_1.__decorate([
    Directive({ selector: '[d]' }),
    OtherD()
  ], D);
  export {D};

  export { A, x, C };
  `
};

describe('Esm2015FileParser', () => {
  describe('parseFile()', () => {
    it('should return an array of object for each class that is exported and decorated', () => {
      const program = makeProgram(BASIC_FILE);
      const host = new Fesm2015ReflectionHost(false, program.getTypeChecker());
      const parser = new Esm2015FileParser(program, host);

      const parsedFiles = parser.parseFile(program.getSourceFile(BASIC_FILE.name) !);

      expect(parsedFiles.length).toEqual(1);
      const decoratedClasses = parsedFiles[0].decoratedClasses;
      expect(decoratedClasses.length).toEqual(2);

      const decoratedClassA = decoratedClasses.find(c => c.name === 'A') !;
      expect(decoratedClassA.decorators.map(decorator => decorator.name)).toEqual(['Directive']);
      expect(decoratedClassA.decorators.map(
                 decorator => decorator.args && decorator.args.map(arg => arg.getText())))
          .toEqual([[`{ selector: '[a]' }`]]);

      const decoratedClassD = decoratedClasses.find(c => c.name === 'D') !;
      expect(decoratedClassD.decorators.map(decorator => decorator.name)).toEqual(['Directive']);
      expect(decoratedClassD.decorators.map(
                 decorator => decorator.args && decorator.args.map(arg => arg.getText())))
          .toEqual([[`{ selector: '[d]' }`]]);
    });
  });
});