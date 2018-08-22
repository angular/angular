/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as fs from 'fs';
import * as ts from 'typescript';

import {DtsMapper} from '../../src/host/dts_mapper';
import {Esm2015ReflectionHost} from '../../src/host/esm2015_host';
import {getDeclaration, makeProgram} from '../helpers/utils';

const CLASSES = [
  {
    name: '/src/class.js',
    contents: `
      export class NoTypeParam {}
      export class OneTypeParam {}
      export class TwoTypeParams {}
    `,
  },
  {
    name: '/typings/class.d.ts',
    contents: `
      export class NoTypeParam {}
      export class OneTypeParam<T> {}
      export class TwoTypeParams<T, K> {}
    `,
  },
];

describe('Esm2015ReflectionHost', () => {
  describe('getGenericArityOfClass()', () => {
    it('should properly count type parameters', () => {
      // Mock out reading the `d.ts` file from disk
      const readFileSyncSpy = spyOn(fs, 'readFileSync').and.returnValue(CLASSES[1].contents);
      const program = makeProgram(CLASSES[0]);

      const dtsMapper = new DtsMapper('/src', '/typings');
      const host = new Esm2015ReflectionHost(program.getTypeChecker(), dtsMapper);
      const noTypeParamClass =
          getDeclaration(program, '/src/class.js', 'NoTypeParam', ts.isClassDeclaration);
      expect(host.getGenericArityOfClass(noTypeParamClass)).toBe(0);
      const oneTypeParamClass =
          getDeclaration(program, '/src/class.js', 'OneTypeParam', ts.isClassDeclaration);
      expect(host.getGenericArityOfClass(oneTypeParamClass)).toBe(1);
      const twoTypeParamsClass =
          getDeclaration(program, '/src/class.js', 'TwoTypeParams', ts.isClassDeclaration);
      expect(host.getGenericArityOfClass(twoTypeParamsClass)).toBe(2);
    });
  });
});
