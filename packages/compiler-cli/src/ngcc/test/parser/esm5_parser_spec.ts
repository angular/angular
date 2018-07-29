/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {Esm5ReflectionHost} from '../../src/host/esm5_host';
import {Esm5FileParser} from '../../src/parsing/esm5_parser';
import {makeProgram} from '../helpers/utils';

const BASIC_FILE = {
  name: '/primary.js',
  contents: `
  var A = (function() {
    function A() {}
    A.decorators = [
      { type: Directive, args: [{ selector: '[a]' }] }
    ];
    return A;
  }());

  var B = (function() {
    function B() {}
    B.decorators = [
      { type: Directive, args: [{ selector: '[b]' }] }
    ];
    return B;
  }());

  function x() {}

  function y() {}

  var C = (function() {
    function C() {}
    return C;
  });

  export { A, x, C };
  `
};

describe('Esm5FileParser', () => {
  describe('getDecoratedClasses()', () => {
    it('should return an array of object for each class that is exported and decorated', () => {
      const program = makeProgram(BASIC_FILE);
      const host = new Esm5ReflectionHost(program.getTypeChecker());
      const parser = new Esm5FileParser(program, host);

      const parsedFiles = parser.parseFile(program.getSourceFile(BASIC_FILE.name) !);

      expect(parsedFiles.length).toEqual(1);
      const decoratedClasses = parsedFiles[0].decoratedClasses;
      expect(decoratedClasses.length).toEqual(1);
      const decoratedClass = decoratedClasses[0];
      expect(decoratedClass.name).toEqual('A');
      expect(decoratedClass.decorators.map(decorator => decorator.name)).toEqual(['Directive']);
    });
  });
});