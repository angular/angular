/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ɵFrameworkAgnosticGlobalUtils} from '@angular/core';
import {
  ngDebugDependencyInjectionApiIsSupported,
  ngDebugProfilerApiIsSupported,
  ngDebugRoutesApiIsSupported,
  ngDebugSignalGraphApiIsSupported,
  ngDebugSignalPropertiesInspectionApiIsSupported,
  ngDebugTransferStateApiIsSupported,
} from './ng-debug-api';
import {Framework} from '../component-tree/core-enums';

type Ng = ɵFrameworkAgnosticGlobalUtils;

/** Add a root element to the body. */
const mockRoot = () => {
  document.body.replaceChildren();
  const root = document.createElement('div');
  root.setAttribute('ng-version', '');
  document.body.appendChild(root);
};

/** Creates an `ng` object with a `getDirectiveMetadata` mock. */
const fakeNgGlobal = (framework: Framework): Partial<Ng> => {
  const base: Partial<Ng> = {
    getComponent<T>(_element: any): any {
      return {};
    },
    getDirectiveMetadata(_directiveOrComponentInstance: any): any {
      return {
        framework,
      };
    },
  };

  // Only Angular and ACX have route debug functions
  if (framework === Framework.Angular || framework === Framework.ACX) {
    return {
      ...base,
      ɵgetLoadedRoutes(route: any): any {
        return [];
      },
      ɵnavigateByUrl(router: any, url: string): any {},
      ɵgetRouterInstance(injector: any): any {
        return {};
      },
    };
  }

  // Wiz does not have route debug functions
  return base;
};

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

  describe('ngDebugProfilerApiIsSupported', () => {
    // Tests must be updated after the temporary solutions
    // are replaced in favor of the stable API.
    beforeEach(() => mockRoot());

    it('should support Profiler API', () => {
      (globalThis as any).ng = fakeNgGlobal(Framework.Angular);
      expect(ngDebugProfilerApiIsSupported()).toBeTrue();

      (globalThis as any).ng = fakeNgGlobal(Framework.ACX);
      expect(ngDebugProfilerApiIsSupported()).toBeTrue();
    });

    it('should NOT support Profiler API', () => {
      (globalThis as any).ng = fakeNgGlobal(Framework.Wiz);

      expect(ngDebugRoutesApiIsSupported()).toBeFalse();
    });
  });

  describe('ngDebugRoutesApiIsSupported', () => {
    // Tests must be updated after the temporary solutions
    // are replaced in favor of the stable API.
    beforeEach(() => mockRoot());

    it('should support Routes API', () => {
      (globalThis as any).ng = fakeNgGlobal(Framework.Angular);
      expect(ngDebugRoutesApiIsSupported()).toBeTrue();

      (globalThis as any).ng = fakeNgGlobal(Framework.ACX);
      expect(ngDebugRoutesApiIsSupported()).toBeTrue();
    });

    it('should NOT support Routes API', () => {
      (globalThis as any).ng = fakeNgGlobal(Framework.Wiz);

      expect(ngDebugRoutesApiIsSupported()).toBeFalse();
    });
  });

  describe('ngDebugSignalGraphIsSupported', () => {
    beforeEach(() => mockRoot());

    it('should support Signal Graph API with getSignalGraph', () => {
      (globalThis as any).ng = fakeNgGlobal(Framework.Angular);
      (globalThis as any).ng.ɵgetSignalGraph = () => {};
      expect(ngDebugSignalGraphApiIsSupported()).toBeTrue();
    });

    it('should not support Signal Graph API with no getSignalGraph', () => {
      (globalThis as any).ng = fakeNgGlobal(Framework.ACX);
      (globalThis as any).ng.ɵgetSignalGraph = 'not implemented';
      expect(ngDebugSignalGraphApiIsSupported()).toBeFalse();

      (globalThis as any).ng = fakeNgGlobal(Framework.ACX);
      (globalThis as any).ng.ɵgetSignalGraph = undefined;
      expect(ngDebugSignalGraphApiIsSupported()).toBeFalse();
    });
  });

  describe('ngDebugTransferStateApiIsSupported', () => {
    beforeEach(() => mockRoot());

    it('should support Transfer State API with getTransferState', () => {
      (globalThis as any).ng = fakeNgGlobal(Framework.Angular);
      (globalThis as any).ng.ɵgetTransferState = () => {};
      expect(ngDebugTransferStateApiIsSupported()).toBeTrue();
    });

    it('should not support Transfer State API with no getTransferState', () => {
      (globalThis as any).ng = fakeNgGlobal(Framework.ACX);
      (globalThis as any).ng.ɵgetTransferState = 'not implemented';
      expect(ngDebugTransferStateApiIsSupported()).toBeFalse();

      (globalThis as any).ng = fakeNgGlobal(Framework.ACX);
      (globalThis as any).ng.ɵgetTransferState = undefined;
      expect(ngDebugTransferStateApiIsSupported()).toBeFalse();
    });
  });

  describe('ngDebugSignalPropertiesInspectionApiIsSupported', () => {
    beforeEach(() => mockRoot());

    it('should support signal properties inspection API', () => {
      (globalThis as any).ng = fakeNgGlobal(Framework.Angular);
      expect(ngDebugSignalPropertiesInspectionApiIsSupported()).toBeTrue();
    });

    it('should NOT support signal properties inspection API', () => {
      (globalThis as any).ng = fakeNgGlobal(Framework.Wiz);
      expect(ngDebugSignalPropertiesInspectionApiIsSupported()).toBeFalse();

      (globalThis as any).ng = fakeNgGlobal(Framework.ACX);
      expect(ngDebugSignalPropertiesInspectionApiIsSupported()).toBeFalse();
    });
  });
});
