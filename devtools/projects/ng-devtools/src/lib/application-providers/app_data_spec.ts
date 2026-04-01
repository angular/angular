/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TestBed} from '@angular/core/testing';
import {APP_DATA, AppDataSignal} from './app_data';

describe('APP_DATA', () => {
  let appData: AppDataSignal;

  beforeEach(() => {
    appData = TestBed.inject(APP_DATA);
  });

  it('should throw an error if not initialized', () => {
    expect(() => appData()).toThrowError('DevTools APP_DATA is not initialized.');
  });

  it('should set the app data', () => {
    appData.init({
      devMode: true,
      hydration: false,
      ivy: true,
      version: '1.2.3',
    });

    expect(appData()).toEqual({
      fullVersion: '1.2.3',
      majorVersion: 1,
      minorVersion: 2,
      patchVersion: 3,
      devMode: true,
      hydration: false,
      ivy: true,
    });
  });

  it('should disallow initializing the app data more than once', () => {
    appData.init({
      devMode: true,
      hydration: false,
      ivy: true,
      version: '1.2.3',
    });

    expect(() => {
      appData.init({
        devMode: true,
        hydration: false,
        ivy: true,
        version: '1.2.3',
      });
    }).toThrowError('App data signal is already set.');
  });

  it('should gracefully handle an undefined version', () => {
    appData.init({
      devMode: true,
      hydration: false,
      ivy: true,
      version: undefined,
    });

    expect(appData()).toEqual({
      fullVersion: undefined,
      majorVersion: 0,
      minorVersion: 0,
      patchVersion: 0,
      devMode: true,
      hydration: false,
      ivy: true,
    });
  });

  it('should gracefully handle an incomplete version', () => {
    appData.init({
      devMode: true,
      hydration: false,
      ivy: true,
      version: '1.2',
    });

    expect(appData()).toEqual({
      fullVersion: '1.2',
      majorVersion: 1,
      minorVersion: 2,
      patchVersion: 0,
      devMode: true,
      hydration: false,
      ivy: true,
    });
  });
});
