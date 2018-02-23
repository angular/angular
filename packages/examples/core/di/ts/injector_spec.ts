/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {APP_ROOT_SCOPE, InjectFlags, InjectionToken, Injector, ReflectiveInjector, Type, inject, ɵsetCurrentInjector as setCurrentInjector} from '@angular/core';

class MockRootScopeInjector implements Injector {
  constructor(readonly parent: Injector) {}

  get<T>(
      token: Type<T>|InjectionToken<T>, defaultValue?: any,
      flags: InjectFlags = InjectFlags.Default): T {
    if ((token as any).ngInjectableDef && (token as any).ngInjectableDef.scope === APP_ROOT_SCOPE) {
      const old = setCurrentInjector(this);
      try {
        return (token as any).ngInjectableDef.factory();
      } finally {
        setCurrentInjector(old);
      }
    }
    return this.parent.get(token, defaultValue, flags);
  }
}

{
  describe('injector metadata examples', () => {
    it('works', () => {
      // #docregion Injector
      const injector: Injector =
          ReflectiveInjector.resolveAndCreate([{provide: 'validToken', useValue: 'Value'}]);
      expect(injector.get('validToken')).toEqual('Value');
      expect(() => injector.get('invalidToken')).toThrowError();
      expect(injector.get('invalidToken', 'notFound')).toEqual('notFound');
      // #enddocregion
    });

    it('injects injector', () => {
      // #docregion injectInjector
      const injector = ReflectiveInjector.resolveAndCreate([]);
      expect(injector.get(Injector)).toBe(injector);
      // #enddocregion
    });

    it('should infer type', () => {
      // #docregion InjectionToken
      const BASE_URL = new InjectionToken<string>('BaseUrl');
      const injector =
          ReflectiveInjector.resolveAndCreate([{provide: BASE_URL, useValue: 'http://localhost'}]);
      const url = injector.get(BASE_URL);
      // here `url` is inferred to be `string` because `BASE_URL` is `InjectionToken<string>`.
      expect(url).toBe('http://localhost');
      // #enddocregion
    });

    it('injects a tree-shaekable InjectionToken', () => {
      class MyDep {}
      const injector = new MockRootScopeInjector(ReflectiveInjector.resolveAndCreate([MyDep]));

      // #docregion ShakeableInjectionToken
      class MyService {
        constructor(readonly myDep: MyDep) {}
      }

      const MY_SERVICE_TOKEN = new InjectionToken<MyService>('Manually constructed MyService', {
        scope: APP_ROOT_SCOPE,
        factory: () => new MyService(inject(MyDep)),
      });

      const instance = injector.get(MY_SERVICE_TOKEN);
      expect(instance instanceof MyService).toBeTruthy();
      expect(instance.myDep instanceof MyDep).toBeTruthy();
      // #enddocregion
    });
  });
}
