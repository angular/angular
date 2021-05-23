import {
  appIsAngularInDevMode,
  appIsAngularIvy,
  appIsAngular,
  appIsSupportedAngularVersion,
  getAngularVersion,
} from './angular-check';

const setNgVersion = (version = '12.0.0') => document.documentElement.setAttribute('ng-version', version);
const removeNgVersion = () => document.documentElement.removeAttribute('ng-version');

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
      setNgVersion('9.0.0');
      expect(appIsSupportedAngularVersion()).toBeTrue();
    });

    it('should return false for older version', () => {
      setNgVersion('8.0.0');
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
        probe() {},
      };
      setNgVersion();
      expect(appIsAngularIvy()).toBeFalse();
    });

    it('should not recognize no Angular apps', () => {
      expect(appIsAngularIvy()).toBeFalse();
    });

    it('should recognize Ivy apps', () => {
      (window as any).getAllAngularRootElements = () => {
        const el = document.createElement('div');
        (el as any).__ngContext__ = 0;
        return [el];
      };
      expect(appIsAngularIvy()).toBeTrue();
      delete (window as any).getAllAngularRootElements;
    });
  });

  describe('appIsAngularInDevMode', () => {
    afterEach(() => {
      delete (window as any).ng;
    });

    it('should detect VE apps', () => {
      (window as any).ng = {
        probe() {},
      };
      setNgVersion();

      expect(appIsAngularInDevMode()).toBeTrue();
    });

    it('should detect Ivy apps', () => {
      (window as any).ng = {
        getComponent() {},
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
