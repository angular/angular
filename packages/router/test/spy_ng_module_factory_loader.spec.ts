/**
 * @license
 * Copyright Google LLC All Rights Reserved.
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
    expect(r.stubbedModules['one']).toBe(expected);
  });

  it('should return the created promise', () => {
    const expected: any = Promise.resolve('returned');
    const compiler: any = {compileModuleAsync: () => expected};

    const r = new SpyNgModuleFactoryLoader(<any>compiler);
    r.stubbedModules = {'one': 'someModule'};

    expect(r.load('one')).toBe(expected);
  });

  it('should return a rejected promise when given an invalid path', fakeAsync(() => {
       const r = new SpyNgModuleFactoryLoader(<any>null);

       let error: any = null;
       r.load('two').catch((e: any) => error = e);

       tick();

       expect(error).toEqual(new Error('Cannot find module two'));
     }));
});
