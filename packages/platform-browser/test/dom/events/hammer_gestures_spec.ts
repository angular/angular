/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {ApplicationRef, NgZone} from '@angular/core';
import {fakeAsync, inject, TestBed, tick} from '@angular/core/testing';
import {EventManager} from '../../../index';
import {HammerGestureConfig, HammerGesturesPlugin} from '../../../src/dom/events/hammer_gestures';
import {isNode} from '@angular/private/testing';

describe('HammerGesturesPlugin', () => {
  let plugin: HammerGesturesPlugin;

  if (isNode) {
    // Jasmine will throw if there are no tests.
    it('should pass', () => {});
    return;
  }

  describe('with no custom loader', () => {
    beforeEach(() => {
      plugin = new HammerGesturesPlugin(document, new HammerGestureConfig(), TestBed);
    });

    it('should warn user and do nothing when Hammer.js not loaded', () => {
      const warnSpy = spyOn(console, 'warn');
      expect(plugin.supports('swipe')).toBe(false);
      expect(warnSpy).toHaveBeenCalledWith(
        `The "swipe" event cannot be bound because Hammer.JS is not ` +
          `loaded and no custom loader has been specified.`,
      );
    });
  });

  describe('with a custom loader', () => {
    // Use a fake custom loader for tests, with helper functions to resolve or reject.
    let loader: () => Promise<void>;
    let resolveLoader: () => void;
    let failLoader: () => void;

    // Arbitrary element and listener for testing.
    let someElement: HTMLDivElement;
    let someListener: () => void;

    // Keep track of whatever value is in `window.Hammer` before the test so it can be
    // restored afterwards so that this test doesn't care whether Hammer is actually loaded.
    let originalHammerGlobal: any;

    // Fake Hammer instance ("mc") used to test the underlying event registration.
    let fakeHammerInstance: {on: jasmine.Spy; off: jasmine.Spy};

    // Inject the NgZone so that we can make it available to the plugin through a fake
    // EventManager.
    let ngZone: NgZone;
    beforeEach(inject([NgZone], (z: NgZone) => {
      ngZone = z;
    }));

    let loaderCalled = 0;
    let loaderIsCalledInAngularZone: boolean | null = null;

    beforeEach(() => {
      originalHammerGlobal = (window as any).Hammer;
      (window as any).Hammer = undefined;

      fakeHammerInstance = {
        on: jasmine.createSpy('mc.on'),
        off: jasmine.createSpy('mc.off'),
      };

      loader = () => {
        loaderCalled++;
        loaderIsCalledInAngularZone = NgZone.isInAngularZone();
        return new Promise((resolve, reject) => {
          resolveLoader = resolve;
          failLoader = reject;
        });
      };

      // Make the hammer config return a fake hammer instance
      const hammerConfig = new HammerGestureConfig();
      spyOn(hammerConfig, 'buildHammer').and.returnValue(fakeHammerInstance);

      plugin = new HammerGesturesPlugin(document, hammerConfig, TestBed, loader);

      // Use a fake EventManager that has access to the NgZone.
      plugin.manager = {getZone: () => ngZone} as EventManager;

      someElement = document.createElement('div');
      someListener = () => {};
    });

    afterEach(() => {
      loaderCalled = 0;
      (window as any).Hammer = originalHammerGlobal;
    });

    it('should call the loader provider only once', () => {
      plugin.addEventListener(someElement, 'swipe', () => {});
      plugin.addEventListener(someElement, 'panleft', () => {});
      plugin.addEventListener(someElement, 'panright', () => {});
      // Ensure that the loader is called only once, because previouly
      // it was called the same number of times as `addEventListener` was called.
      expect(loaderCalled).toEqual(1);
    });

    it('should not log a warning when HammerJS is not loaded', () => {
      const warnSpy = spyOn(console, 'warn');
      plugin.addEventListener(someElement, 'swipe', () => {});
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('should defer registering an event until Hammer is loaded', fakeAsync(() => {
      plugin.addEventListener(someElement, 'swipe', someListener);
      expect(fakeHammerInstance.on).not.toHaveBeenCalled();

      (window as any).Hammer = {};
      resolveLoader();
      tick();

      expect(fakeHammerInstance.on).toHaveBeenCalledWith('swipe', jasmine.any(Function));
    }));

    it('should cancel registration if an event is removed before being added', fakeAsync(() => {
      const deregister = plugin.addEventListener(someElement, 'swipe', someListener);
      deregister();

      (window as any).Hammer = {};
      resolveLoader();
      tick();

      expect(fakeHammerInstance.on).not.toHaveBeenCalled();
    }));

    it('should remove a listener after Hammer is loaded', fakeAsync(() => {
      const removeListener = plugin.addEventListener(someElement, 'swipe', someListener);

      (window as any).Hammer = {};
      resolveLoader();
      tick();

      removeListener();
      expect(fakeHammerInstance.off).toHaveBeenCalledWith('swipe', jasmine.any(Function));
    }));

    it('should log a warning when the loader fails', fakeAsync(() => {
      const warnSpy = spyOn(console, 'warn');

      plugin.addEventListener(someElement, 'swipe', () => {});
      failLoader();
      tick();

      expect(warnSpy).toHaveBeenCalledWith(
        `The "swipe" event cannot be bound because the custom Hammer.JS loader failed.`,
      );
    }));

    it('should load a warning if the loader resolves and Hammer is not present', fakeAsync(() => {
      const warnSpy = spyOn(console, 'warn');

      plugin.addEventListener(someElement, 'swipe', () => {});
      resolveLoader();
      tick();

      expect(warnSpy).toHaveBeenCalledWith(
        `The custom HAMMER_LOADER completed, but Hammer.JS is not present.`,
      );
    }));

    it('should call the loader outside of the Angular zone', fakeAsync(() => {
      const ngZone = TestBed.inject(NgZone);
      // Unit tests are being run in a ProxyZone, thus `addEventListener` is called within the
      // ProxyZone. In real apps, `addEventListener` is called within the Angular zone; we
      // mimic that behaviour by entering the Angular zone.
      ngZone.run(() => plugin.addEventListener(someElement, 'swipe', () => {}));

      const appRef = TestBed.inject(ApplicationRef);
      spyOn(appRef, 'tick');

      resolveLoader();
      tick();

      expect(appRef.tick).not.toHaveBeenCalled();
      expect(loaderIsCalledInAngularZone).toEqual(false);
    }));
  });
});
