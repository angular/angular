/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {fakeAsync, tick} from '@angular/core/testing';
import {SpyNgModuleFactoryLoader} from '@angular/router/testing';

describe('SpyNgModuleFactoryLoader', () => {
  it('should invoke the compiler when the setter is called', () => {
    const expected = Promise.resolve('returned');
    const compiler: any = {compileModuleAsync: () => {}};
    spyOn(compiler, 'compileModuleAsync').and.returnValue(expected);

    const r = new SpyNgModuleFactoryLoader(<any>compiler);
    r.stubbedModules = {'one': 'someModule'};

    expect(compiler.compileModuleAsync).toHaveBeenCalledWith('someModule');
    expect(r.stubbedModules['one'].module).toBe(expected);
  });


  it('should the default load postFn function in return identity', () => {
    const compiler: any = {compileModuleAsync: (_: any) => _};
    const r = new SpyNgModuleFactoryLoader(<any>compiler);
    r.stubbedModules = {'one': 'someModule'};
    const expected = 'this';
    const postFn = r.stubbedModules['one'].postFn;
    expect(postFn(expected)).toBe(expected);
  });

  it('should return the created promise', () => {
    const expected: any = Promise.resolve('returned');
    const compiler: any = {compileModuleAsync: () => expected};

    const r = new SpyNgModuleFactoryLoader(<any>compiler);
    r.stubbedModules = {'one': 'someModule'};

    expect(r.load('one')).toBe(expected);
  });

  it('should return the created delayed promise', fakeAsync(() => {
       const expected: any = 'returned';
       const compiler: any = {compileModuleAsync: () => Promise.resolve(expected)};

       const r = new SpyNgModuleFactoryLoader(<any>compiler);
       r.stubbedModules = {'one#delay:3': 'someModule'};

       let result = false;
       const waitingPromise = r.load('one').then((_) => {
         expect(_).toBe(expected);
         result = true;
       });
       tick(2);
       expect(result).toBeFalsy();
       tick(2);
       expect(result).toBeTruthy();
     }));

  it('should return rejected promise when given an stubbedModules error', fakeAsync(() => {
       const expected: any = 'returned';
       const compiler: any = {compileModuleAsync: () => Promise.resolve(expected)};

       const r = new SpyNgModuleFactoryLoader(<any>compiler);
       r.stubbedModules = {'one#error:-1:load error': 'someModule'};


       let error: any = null;
       r.load('one').catch((e: any) => error = e);

       tick();

       expect(error).toEqual(new Error('load error'));
     }));

  it('should return rejected promise when given an stubbedModules error', fakeAsync(() => {
       const expected: any = 'returned';
       const compiler: any = {compileModuleAsync: () => Promise.resolve(expected)};

       const r = new SpyNgModuleFactoryLoader(<any>compiler);
       r.stubbedModules = {'one#error:1:load error': 'someModule'};


       let error: any = null;
       r.load('one').catch((e: any) => error = e);
       tick();
       expect(error).toEqual(new Error('load error'));

       error = null;
       r.load('one').then((r: any) => error = r).catch((e: any) => error = e);
       tick();
       expect(error).toEqual(expected);

    }));

  it('should return a rejected promise when given an invalid path', fakeAsync(() => {
       const r = new SpyNgModuleFactoryLoader(<any>null);

       let error: any = null;
       r.load('two').catch((e: any) => error = e);

       tick();

       expect(error).toEqual(new Error('Cannot find module two'));
     }));
});
