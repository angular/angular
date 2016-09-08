/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Compiler, SystemJsNgModuleLoader} from '@angular/core';
import {async, tick} from '@angular/core/testing';
import {beforeEach, ddescribe, describe, expect, iit, it, xit} from '@angular/core/testing/testing_internal';

function mockSystem(module: string, contents: any) {
  return {
    'import': (target: string) => {
      expect(target).toBe(module);
      return Promise.resolve(contents);
    }
  };
}

export function main() {
  describe('SystemJsNgModuleLoader', () => {
    it('loads a default factory by appending the factory suffix', async(() => {
         let loader = new SystemJsNgModuleLoader(new Compiler());
         loader._system = () => mockSystem('test.ngfactory', {'default': 'test module factory'});
         loader.load('test').then(contents => { expect(contents).toBe('test module factory'); });
       }));
    it('loads a named factory by appending the factory suffix', async(() => {
         let loader = new SystemJsNgModuleLoader(new Compiler());
         loader._system = () =>
             mockSystem('test.ngfactory', {'NamedNgFactory': 'test module factory'});
         loader.load('test#Named').then(contents => {
           expect(contents).toBe('test module factory');
         });
       }));
    it('loads a named factory with a configured prefix and suffix', async(() => {
         let loader = new SystemJsNgModuleLoader(new Compiler(), {
           factoryPathPrefix: 'prefixed/',
           factoryPathSuffix: '/suffixed',
         });
         loader._system = () =>
             mockSystem('prefixed/test/suffixed', {'NamedNgFactory': 'test module factory'});
         loader.load('test#Named').then(contents => {
           expect(contents).toBe('test module factory');
         });
       }));
  });
};
