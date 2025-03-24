/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ɵGlobalDevModeUtils} from '@angular/core';
import {ngDebugDependencyInjectionApiIsSupported} from './ng-debug-api';

type Ng = ɵGlobalDevModeUtils['ng'];

describe('ng-debug-api', () => {
  afterEach(() => {
    delete (globalThis as any).ng;
  });

  describe('ngDebugDependencyInjectionApiIsSupported', () => {
    const goldenNg: Partial<Record<keyof Ng, () => void>> = {
      getInjector() {},
      ɵgetInjectorResolutionPath() {},
      ɵgetDependenciesFromInjectable() {},
      ɵgetInjectorProviders() {},
      ɵgetInjectorMetadata() {},
    };

    it('returns true when required APIs are supported', () => {
      (globalThis as any).ng = goldenNg;

      expect(ngDebugDependencyInjectionApiIsSupported()).toBeTrue();
    });

    it('returns false when any required API is missing', () => {
      (globalThis as any).ng = {...goldenNg, getInjector: undefined};
      expect(ngDebugDependencyInjectionApiIsSupported()).toBeFalse();

      (globalThis as any).ng = {...goldenNg, ɵgetInjectorResolutionPath: undefined};
      expect(ngDebugDependencyInjectionApiIsSupported()).toBeFalse();

      (globalThis as any).ng = {...goldenNg, ɵgetDependenciesFromInjectable: undefined};
      expect(ngDebugDependencyInjectionApiIsSupported()).toBeFalse();

      (globalThis as any).ng = {...goldenNg, ɵgetInjectorProviders: undefined};
      expect(ngDebugDependencyInjectionApiIsSupported()).toBeFalse();

      (globalThis as any).ng = {...goldenNg, ɵgetInjectorMetadata: undefined};
      expect(ngDebugDependencyInjectionApiIsSupported()).toBeFalse();
    });
  });
});
