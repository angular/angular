/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Ng1Token} from '@angular/upgrade/static/src/common/angular1';
import {compileFactory, injectorFactory, parseFactory, rootScopeFactory, setTempInjectorRef} from '@angular/upgrade/static/src/static/angular1_providers';

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
        const mockInjector = {get: () => {}, has: () => false};
        setTempInjectorRef(mockInjector);
        const injector = injectorFactory();
        expect(injector).toBe(mockInjector);
      });

      it('should throw if the injector value has not been set yet', () => {
        const mockInjector = {get: () => {}, has: () => false};
        expect(injectorFactory).toThrowError();
      });

      it('should unset the injector after the first call (to prevent memory leaks)', () => {
        const mockInjector = {get: () => {}, has: () => false};
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
