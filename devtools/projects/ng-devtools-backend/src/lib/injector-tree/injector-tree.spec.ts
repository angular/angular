/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Injector,
  ɵExternalCoreGlobalUtils,
  ɵProviderRecord as ProviderRecord,
  InjectionToken,
} from '@angular/core';
import {getInjectorFromElementNode, serializeProviderRecord} from './injector-tree';

type Ng = ɵExternalCoreGlobalUtils;

describe('injector-tree', () => {
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

  describe('serializeProviderRecord', () => {
    it('should return "internal" type for internal tokens', () => {
      const internalTokenNames = [
        'ElementRef',
        'Renderer2',
        'ViewContainerRef',
        'DestroyRef',
        'ChangeDetectorRef',
        'Injector',
      ];

      internalTokenNames.forEach((tokenName, index) => {
        const token = () => {};
        Object.defineProperty(token, 'name', {value: tokenName});
        const providerRecord: any = {
          provider: () => {},
          token,
          isViewProvider: false,
        };
        const result = serializeProviderRecord(providerRecord, index);
        expect(result.type).toBe('internal');
        expect(result.token).toBe(tokenName);
      });
    });

    it('should return "type" for non-internal function providers', () => {
      const token = () => {};
      Object.defineProperty(token, 'name', {value: 'MyCustomService'});
      const providerRecord: any = {
        provider: () => {},
        token,
        isViewProvider: false,
      };
      const result = serializeProviderRecord(providerRecord, 0);
      expect(result.type).toBe('type');
      expect(result.token).toBe('MyCustomService');
    });

    it('should handle injection tokens', () => {
      const result = serializeProviderRecord(
        {
          token: new InjectionToken('FOO'),
          isViewProvider: false,
        } as ProviderRecord,
        0,
      );

      expect(result.token).toBe('InjectionToken (FOO)');
    });
  });
});
