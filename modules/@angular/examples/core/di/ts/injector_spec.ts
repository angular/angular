/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InjectionToken, Injector, ReflectiveInjector} from '@angular/core';

export function main() {
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
  });
}
