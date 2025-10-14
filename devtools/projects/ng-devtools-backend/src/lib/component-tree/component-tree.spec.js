/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {Injector} from '@angular/core';
import {getInjectorFromElementNode} from './component-tree';
describe('component-tree', () => {
  afterEach(() => {
    delete globalThis.ng;
  });
  describe('getInjectorFromElementNode', () => {
    it('returns injector', () => {
      const injector = Injector.create({
        providers: [],
      });
      const ng = {
        getInjector: jasmine.createSpy('getInjector').and.returnValue(injector),
      };
      globalThis.ng = ng;
      const el = document.createElement('div');
      expect(getInjectorFromElementNode(el)).toBe(injector);
      expect(ng.getInjector).toHaveBeenCalledOnceWith(el);
    });
    it('returns `null` when `getInjector` is not supported', () => {
      globalThis.ng = {};
      const el = document.createElement('div');
      expect(getInjectorFromElementNode(el)).toBeNull();
    });
  });
});
//# sourceMappingURL=component-tree.spec.js.map
