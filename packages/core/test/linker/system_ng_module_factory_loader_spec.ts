/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Compiler, SystemJsNgModuleLoader} from '@angular/core';
import {global} from '@angular/core/src/util/global';
import {waitForAsync} from '@angular/core/testing';
import {afterEach, beforeEach, describe, expect, it} from '@angular/core/testing/src/testing_internal';
import {modifiedInIvy, onlyInIvy} from '@angular/private/testing';

function mockSystem(modules: {[module: string]: any}) {
  return {
    'import': (target: string) => {
      expect(modules[target]).not.toBe(undefined);
      return Promise.resolve(modules[target]);
    }
  };
}

describe('SystemJsNgModuleLoader', () => {
  let oldSystem: any = null;
  modifiedInIvy('only loads ngfactory shims in View Engine').describe('(View Engine)', () => {
    beforeEach(() => {
      oldSystem = global['System'];
      global['System'] = mockSystem({
        'test.ngfactory':
            {'default': 'test module factory', 'NamedNgFactory': 'test NamedNgFactory'},
        'prefixed/test/suffixed': {'NamedNgFactory': 'test module factory'}
      });
    });
    afterEach(() => {
      global['System'] = oldSystem;
    });

    it('loads a default factory by appending the factory suffix', waitForAsync(() => {
         const loader = new SystemJsNgModuleLoader(new Compiler());
         loader.load('test').then(contents => {
           expect(contents).toBe('test module factory' as any);
         });
       }));
    it('loads a named factory by appending the factory suffix', waitForAsync(() => {
         const loader = new SystemJsNgModuleLoader(new Compiler());
         loader.load('test#Named').then(contents => {
           expect(contents).toBe('test NamedNgFactory' as any);
         });
       }));
    it('loads a named factory with a configured prefix and suffix', waitForAsync(() => {
         const loader = new SystemJsNgModuleLoader(new Compiler(), {
           factoryPathPrefix: 'prefixed/',
           factoryPathSuffix: '/suffixed',
         });
         loader.load('test#Named').then(contents => {
           expect(contents).toBe('test module factory' as any);
         });
       }));
  });

  onlyInIvy('loads modules directly in Ivy').describe('(Ivy)', () => {
    beforeEach(() => {
      oldSystem = global['System'];
      global['System'] = mockSystem({
        'test': {'default': 'test module', 'NamedModule': 'test NamedModule'},
      });
    });
    afterEach(() => {
      global['System'] = oldSystem;
    });

    it('loads a default module', waitForAsync(() => {
         const loader = new SystemJsNgModuleLoader(new Compiler());
         loader.load('test').then(contents => {
           expect(contents.moduleType).toBe('test module' as any);
         });
       }));
    it('loads a named module', waitForAsync(() => {
         const loader = new SystemJsNgModuleLoader(new Compiler());
         loader.load('test#NamedModule').then(contents => {
           expect(contents.moduleType).toBe('test NamedModule' as any);
         });
       }));
  });
});
