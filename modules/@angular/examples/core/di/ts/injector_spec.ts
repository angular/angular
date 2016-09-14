/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector, ReflectiveInjector} from '@angular/core';

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
  });
}
