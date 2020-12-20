/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Ng1Token} from '../../src/common/src/angular1';
import {compileFactory, injectorFactory, parseFactory, rootScopeFactory, setTempInjectorRef} from '../src/angular1_providers';

{
  describe('upgrade angular1_providers', () => {
    describe('compileFactory', () => {
      it('should retrieve and return `$compile`', () => {
        const services: {[key: string]: any} = {$compile: 'foo'};
        const mockInjector = {get: (name: Ng1Token): any => services[name], has: () => true};

        expect(compileFactory(mockInjector)).toBe('foo');
      });
    });

    describe('injectorFactory', () => {
      it('should return the injector value that was previously set', () => {
        const mockInjector = {get: () => undefined, has: () => false};
        setTempInjectorRef(mockInjector);
        const injector = injectorFactory();
        expect(injector).toBe(mockInjector);
      });

      it('should throw if the injector value is not set', () => {
        // Ensure the injector is not set. This shouldn't be necessary, but on CI there seems to be
        // some race condition with previous tests not being cleaned up properly.
        // Related:
        //   - https://github.com/angular/angular/pull/28045
        //   - https://github.com/angular/angular/pull/28181
        setTempInjectorRef(null as any);

        expect(injectorFactory).toThrowError();
      });

      it('should unset the injector after the first call (to prevent memory leaks)', () => {
        const mockInjector = {get: () => undefined, has: () => false};
        setTempInjectorRef(mockInjector);
        injectorFactory();
        expect(injectorFactory).toThrowError();  // ...because it has been unset
      });
    });

    describe('parseFactory', () => {
      it('should retrieve and return `$parse`', () => {
        const services: {[key: string]: any} = {$parse: 'bar'};
        const mockInjector = {get: (name: Ng1Token): any => services[name], has: () => true};

        expect(parseFactory(mockInjector)).toBe('bar');
      });
    });

    describe('rootScopeFactory', () => {
      it('should retrieve and return `$rootScope`', () => {
        const services: {[key: string]: any} = {$rootScope: 'baz'};
        const mockInjector = {get: (name: Ng1Token): any => services[name], has: () => true};

        expect(rootScopeFactory(mockInjector)).toBe('baz');
      });
    });
  });
}
