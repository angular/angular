/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TestBed} from '@angular/core/testing';
import {SUPPORTED_APIS, SupportedApisSignal} from './supported_apis';

describe('SUPPORTED_APIS', () => {
  let supportedApis: SupportedApisSignal;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    supportedApis = TestBed.inject(SUPPORTED_APIS);
  });

  it('should have all APIs disabled by default', () => {
    for (const api of Object.values(supportedApis())) {
      expect(api).toBeFalse();
    }
  });

  it('should set APIs', () => {
    supportedApis.init({
      dependencyInjection: false,
      profiler: true,
      routes: false,
      signals: true,
      signalPropertiesInspection: false,
      transferState: true,
    });

    expect(supportedApis()).toEqual({
      dependencyInjection: false,
      profiler: true,
      routes: false,
      signals: true,
      signalPropertiesInspection: false,
      transferState: true,
    });
  });

  it('should disallow initializing the APIs more than once', () => {
    supportedApis.init({
      dependencyInjection: true,
      profiler: true,
      routes: true,
      signals: true,
      signalPropertiesInspection: true,
      transferState: true,
    });

    expect(() => {
      supportedApis.init({
        dependencyInjection: true,
        profiler: true,
        routes: true,
        signals: true,
        signalPropertiesInspection: true,
        transferState: true,
      });
    }).toThrowError();
  });
});
