/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {createEnvironmentInjector, EnvironmentInjector, inject, Injectable} from '../../src/core';
import {ProviderScopeToken} from '../../src/di/provider_scope_token';

describe('ProviderScopeToken', () => {
  describe('basic class', () => {
    it('has a readable description', () => {
      const token = new ProviderScopeToken('myScope');
      expect(token.toString()).toBe('ProviderScopeToken(myScope)');
    });

    it('has the expected ngMetadataName', () => {
      const token = new ProviderScopeToken('test');
      expect(token.ngMetadataName).toBe('ProviderScopeToken');
    });

    it('two tokens with the same description are distinct', () => {
      const a = new ProviderScopeToken('same');
      const b = new ProviderScopeToken('same');
      expect(a).not.toBe(b);
    });
  });

  describe('with environment injectors', () => {
    let rootInjector: EnvironmentInjector;

    beforeEach(() => {
      rootInjector = createEnvironmentInjector([], null as any);
    });

    afterEach(() => {
      rootInjector.destroy();
    });

    it('provides a service in the scoped injector that declares the scope token', () => {
      const myScope = new ProviderScopeToken('myScope');

      @Injectable({providedIn: myScope})
      class ScopedService {}

      const scopedInjector = createEnvironmentInjector([myScope], rootInjector);

      const instance = scopedInjector.get(ScopedService);
      expect(instance).toBeInstanceOf(ScopedService);

      scopedInjector.destroy();
    });

    it('does not provide a scoped service in an injector that lacks the scope token', () => {
      const myScope = new ProviderScopeToken('myScope');

      @Injectable({providedIn: myScope})
      class ScopedService {}

      // rootInjector does NOT have myScope registered
      expect(() => rootInjector.get(ScopedService)).toThrow();
    });

    it('provides distinct instances for two independent injectors with the same scope token', () => {
      const myScope = new ProviderScopeToken('myScope');

      @Injectable({providedIn: myScope})
      class ScopedService {}

      const injectorA = createEnvironmentInjector([myScope], rootInjector);
      const injectorB = createEnvironmentInjector([myScope], rootInjector);

      const instanceA = injectorA.get(ScopedService);
      const instanceB = injectorB.get(ScopedService);

      expect(instanceA).toBeInstanceOf(ScopedService);
      expect(instanceB).toBeInstanceOf(ScopedService);
      expect(instanceA).not.toBe(instanceB);

      injectorA.destroy();
      injectorB.destroy();
    });

    it('provides the same instance on repeated calls within the same injector', () => {
      const myScope = new ProviderScopeToken('myScope');

      @Injectable({providedIn: myScope})
      class ScopedService {}

      const scopedInjector = createEnvironmentInjector([myScope], rootInjector);

      const first = scopedInjector.get(ScopedService);
      const second = scopedInjector.get(ScopedService);
      expect(first).toBe(second);

      scopedInjector.destroy();
    });

    it('resolves to the nearest ancestor injector that has the scope token', () => {
      const myScope = new ProviderScopeToken('myScope');

      @Injectable({providedIn: myScope})
      class ScopedService {}

      const middleInjector = createEnvironmentInjector([myScope], rootInjector);
      const childInjector = createEnvironmentInjector([], middleInjector);

      // Request from child injector – the instance should live in middleInjector
      const instance = childInjector.get(ScopedService);
      expect(instance).toBeInstanceOf(ScopedService);
      // Same instance when requested directly from the scope boundary
      expect(middleInjector.get(ScopedService)).toBe(instance);

      middleInjector.destroy();
    });

    it('supports multiple independent scope tokens on the same injector', () => {
      const scopeA = new ProviderScopeToken('A');
      const scopeB = new ProviderScopeToken('B');

      @Injectable({providedIn: scopeA})
      class ServiceA {}

      @Injectable({providedIn: scopeB})
      class ServiceB {}

      const injector = createEnvironmentInjector([scopeA, scopeB], rootInjector);

      expect(injector.get(ServiceA)).toBeInstanceOf(ServiceA);
      expect(injector.get(ServiceB)).toBeInstanceOf(ServiceB);

      injector.destroy();
    });

    it('a scoped service can inject other services from the same scope', () => {
      const myScope = new ProviderScopeToken('myScope');

      @Injectable({providedIn: myScope})
      class InnerService {}

      @Injectable({providedIn: myScope})
      class OuterService {
        readonly inner = inject(InnerService);
      }

      const scopedInjector = createEnvironmentInjector([myScope], rootInjector);

      const outer = scopedInjector.get(OuterService);
      expect(outer.inner).toBeInstanceOf(InnerService);

      scopedInjector.destroy();
    });
  });
});
