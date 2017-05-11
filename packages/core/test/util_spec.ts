/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {getGlobal, global, stringify} from '../src/util';

{
  describe('getGlobal', () => {
    const _global: any = new Function('return this')();
    const originalWGSDescriptor = Object.getOwnPropertyDescriptor(_global, 'WorkerGlobalScope');
    const originalFunctionDescriptor = Object.getOwnPropertyDescriptor(_global, 'Function');
    const OriginalFunction = Function;
    let FunctionSpy: Function;

    beforeEach(() => {
      FunctionSpy = jasmine.createSpy('Function').and.callFake(function (...args) {
        return new OriginalFunction(...args);
      });
      _global.Function = FunctionSpy;
    });

    afterEach(() => {
      delete _global.Function;
      Object.defineProperty(_global, 'Function', originalFunctionDescriptor!);

      delete _global['WorkerGlobalScope'];
      if (originalWGSDescriptor) {
        Object.defineProperty(_global, 'WorkerGlobalScope', originalWGSDescriptor);
      }
    });

    it('should return evaluated this', () => {
      expect(getGlobal()).toBe(_global);
      expect(FunctionSpy).toHaveBeenCalledWith('return this');
    });

    it('should fall back to duck typed global when eval is restricted', () => {
      FunctionSpy.and.throwError(EvalError);
      expect(getGlobal).not.toThrow();
      expect(FunctionSpy).toHaveBeenCalledWith('return this');
    });

    if (isBrowser) {
      it('should fall back to self if it is an instance of WorkerGlobalScope in web worker', () => {
        FunctionSpy.and.throwError(EvalError);
        const wgsGetter = jasmine.createSpy('wgsGetter').and.returnValue(_global.constructor);
        Object.defineProperty(
            _global, 'WorkerGlobalScope', {get: wgsGetter, enumerable: true, configurable: true});
        expect(getGlobal()).toBe(_global);
        expect(wgsGetter).toHaveBeenCalled();
      });
      it('should fall back to window in browser', () => {
        FunctionSpy.and.throwError(new EvalError());
        expect(getGlobal()).toBe(_global);
      });
    } else {
      it('should not fall back in Node and return undefined', () => {
        FunctionSpy.and.throwError(new EvalError());
        expect(getGlobal()).toBe(undefined);
      });
    }
  });
  describe('global', () => {
    it('should get value from getGlobal()', () => { expect(global).toBe(getGlobal()); });
  });

  describe('stringify', () => {
    it('should return string undefined when toString returns undefined',
       () => expect(stringify({toString: (): any => undefined})).toBe('undefined'));

    it('should return string null when toString returns null',
       () => expect(stringify({toString: (): any => null})).toBe('null'));
  });
}
