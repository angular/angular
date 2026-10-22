/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {getSupportedApis} from './supported-apis';

describe('supported-apis', () => {
  afterEach(() => {
    delete (globalThis as any).ng;
  });

  describe('getSupportedApis', () => {
    it('should return every flag as false when no debug API is available', () => {
      (globalThis as any).ng = {};

      const supported = getSupportedApis();

      expect(Object.keys(supported).sort()).toEqual([
        'dependencyInjection',
        'profiler',
        'routes',
        'signalPropertiesInspection',
        'signalWatch',
        'signals',
        'transferState',
      ]);
      expect(Object.values(supported).every((value) => value === false)).toBeTrue();
    });

    it('should only report signals when the signal graph API is available', () => {
      (globalThis as any).ng = {ɵgetSignalGraph: () => {}};

      const supported = getSupportedApis();

      expect(supported.signals).toBeTrue();
      expect(supported.dependencyInjection).toBeFalse();
      expect(supported.profiler).toBeFalse();
      expect(supported.routes).toBeFalse();
      expect(supported.signalPropertiesInspection).toBeFalse();
      expect(supported.signalWatch).toBeFalse();
      expect(supported.transferState).toBeFalse();
    });

    it('should only report signalWatch when toggleWatchSignal API is available', () => {
      (globalThis as any).ng = {toggleWatchSignal: () => {}};

      const supported = getSupportedApis();

      expect(supported.signalWatch).toBeTrue();
      expect(supported.signals).toBeFalse();
      expect(supported.dependencyInjection).toBeFalse();
      expect(supported.profiler).toBeFalse();
      expect(supported.routes).toBeFalse();
      expect(supported.signalPropertiesInspection).toBeFalse();
      expect(supported.transferState).toBeFalse();
    });
  });
});
