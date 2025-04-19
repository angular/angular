/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injector, ɵGlobalDevModeUtils} from '@angular/core';
import {getInjectorFromElementNode} from './component-tree';

type Ng = ɵGlobalDevModeUtils['ng'];

describe('component-tree', () => {
  afterEach(() => {
    delete (globalThis as any).ng;
  });

  describe('getInjectorFromElementNode', () => {
    it('returns injector', () => {
      const injector = Injector.create({
        providers: [],
      });

      const ng: Partial<Ng> = {
        getInjector: jasmine.createSpy('getInjector').and.returnValue(injector),
      };
      (globalThis as any).ng = ng;

      const el = document.createElement('div');
      expect(getInjectorFromElementNode(el)).toBe(injector);
      expect(ng.getInjector).toHaveBeenCalledOnceWith(el);
    });

    it('returns `null` when `getInjector` is not supported', () => {
      (globalThis as any).ng = {};

      const el = document.createElement('div');
      expect(getInjectorFromElementNode(el)).toBeNull();
    });
  });
});
