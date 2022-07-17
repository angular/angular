/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {appIsAngular, appIsAngularInDevMode, appIsAngularIvy, appIsSupportedAngularVersion, getAngularVersion,} from './angular-check';

const setNgVersion = (version = '12.0.0'): void =>
    document.documentElement.setAttribute('ng-version', version);
const removeNgVersion = (): void => document.documentElement.removeAttribute('ng-version');

describe('angular-check', () => {
  afterEach(() => removeNgVersion());

  describe('getAngularVersion', () => {
    it('should return the angular version', () => {
      setNgVersion('11.1.1');
      expect(getAngularVersion()).toBe('11.1.1');
    });
  });

  describe('appIsSupportedAngularVersion', () => {
    it('should work with g3', () => {
      setNgVersion('0.0.0-placeholder');
      expect(appIsSupportedAngularVersion()).toBeTrue();
    });

    it('should work with new versions', () => {
      setNgVersion('12.0.0');
      expect(appIsSupportedAngularVersion()).toBeTrue();
    });

    it('should return false for older version', () => {
      setNgVersion('9.0.0');
      expect(appIsSupportedAngularVersion()).toBeFalse();
    });

    it('should return false for no version', () => {
      expect(appIsSupportedAngularVersion()).toBeFalse();
    });
  });

  describe('appIsAngular', () => {
    it('should return true for older version', () => {
      setNgVersion('8.0.0');
      expect(appIsAngular()).toBeTrue();
    });

    it('should return false for no version', () => {
      expect(appIsAngular()).toBeFalse();
    });
  });

  describe('appIsAngularIvy', () => {
    it('should not recognize VE apps', () => {
      (window as any).ng = {
        probe(): void{},
      };
      setNgVersion();
      expect(appIsAngularIvy()).toBeFalse();
    });

    it('should not recognize no Angular apps', () => {
      expect(appIsAngularIvy()).toBeFalse();
    });

    it('should recognize Ivy apps', () => {
      const el = document.createElement('div');
      el.setAttribute('ng-version', '0.0.0-PLACEHOLDER');
      (el as any).__ngContext__ = 0;
      document.body.append(el);
      expect(appIsAngularIvy()).toBeTrue();
      el.remove();
    });
  });

  describe('appIsAngularInDevMode', () => {
    afterEach(() => {
      delete (window as any).ng;
    });

    it('should detect VE apps', () => {
      (window as any).ng = {
        probe(): void{},
      };
      setNgVersion();

      expect(appIsAngularInDevMode()).toBeTrue();
    });

    it('should detect Ivy apps', () => {
      (window as any).ng = {
        getComponent(): void{},
      };
      setNgVersion();
      expect(appIsAngularInDevMode()).toBeTrue();
    });

    it('should not detect apps if `ng` is not an object with the right shape', () => {
      setNgVersion();
      (window as any).ng = {};
      expect(appIsAngularInDevMode()).toBeFalse();

      (window as any).ng = () => {};
      expect(appIsAngularInDevMode()).toBeFalse();
    });
  });
});
