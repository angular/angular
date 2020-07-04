/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ApplicationRef, PLATFORM_ID} from '@angular/core';
import {fakeAsync, flushMicrotasks, TestBed, tick} from '@angular/core/testing';
import {Subject} from 'rxjs';
import {filter, take} from 'rxjs/operators';

import {ServiceWorkerModule, SwRegistrationOptions} from '../src/module';
import {SwUpdate} from '../src/update';


describe('ServiceWorkerModule', () => {
  // Skip environments that don't support the minimum APIs needed to run these SW tests.
  if ((typeof navigator === 'undefined') || (typeof navigator.serviceWorker === 'undefined')) {
    return;
  }

  let swRegisterSpy: jasmine.Spy;

  const untilStable = () => {
    const appRef: ApplicationRef = TestBed.inject(ApplicationRef);
    return appRef.isStable.pipe(filter(Boolean), take(1)).toPromise();
  };

  beforeEach(
      () => swRegisterSpy =
          spyOn(navigator.serviceWorker, 'register').and.returnValue(Promise.resolve(null as any)));

  describe('register()', () => {
    const configTestBed = async (opts: SwRegistrationOptions) => {
      TestBed.configureTestingModule({
        imports: [ServiceWorkerModule.register('sw.js', opts)],
        providers: [{provide: PLATFORM_ID, useValue: 'browser'}],
      });

      await untilStable();
    };

    it('sets the registration options', async () => {
      await configTestBed({enabled: true, scope: 'foo'});

      expect(TestBed.inject(SwRegistrationOptions)).toEqual({enabled: true, scope: 'foo'});
      expect(swRegisterSpy).toHaveBeenCalledWith('sw.js', {scope: 'foo'});
    });

    it('can disable the SW', async () => {
      await configTestBed({enabled: false});

      expect(TestBed.inject(SwUpdate).isEnabled).toBe(false);
      expect(swRegisterSpy).not.toHaveBeenCalled();
    });

    it('can enable the SW', async () => {
      await configTestBed({enabled: true});

      expect(TestBed.inject(SwUpdate).isEnabled).toBe(true);
      expect(swRegisterSpy).toHaveBeenCalledWith('sw.js', {scope: undefined});
    });

    it('defaults to enabling the SW', async () => {
      await configTestBed({});

      expect(TestBed.inject(SwUpdate).isEnabled).toBe(true);
      expect(swRegisterSpy).toHaveBeenCalledWith('sw.js', {scope: undefined});
    });

    it('catches and a logs registration errors', async () => {
      const consoleErrorSpy = spyOn(console, 'error');
      swRegisterSpy.and.returnValue(Promise.reject('no reason'));

      await configTestBed({enabled: true, scope: 'foo'});
      expect(consoleErrorSpy)
          .toHaveBeenCalledWith('Service worker registration failed with:', 'no reason');
    });
  });

  describe('SwRegistrationOptions', () => {
    const configTestBed =
        (providerOpts: SwRegistrationOptions, staticOpts?: SwRegistrationOptions) => {
          TestBed.configureTestingModule({
            imports: [ServiceWorkerModule.register('sw.js', staticOpts || {scope: 'static'})],
            providers: [
              {provide: PLATFORM_ID, useValue: 'browser'},
              {provide: SwRegistrationOptions, useFactory: () => providerOpts},
            ],
          });
        };

    it('sets the registration options (and overwrites those set via `.register()`', async () => {
      configTestBed({enabled: true, scope: 'provider'});
      await untilStable();

      expect(TestBed.inject(SwRegistrationOptions)).toEqual({enabled: true, scope: 'provider'});
      expect(swRegisterSpy).toHaveBeenCalledWith('sw.js', {scope: 'provider'});
    });

    it('can disable the SW', async () => {
      configTestBed({enabled: false}, {enabled: true});
      await untilStable();

      expect(TestBed.inject(SwUpdate).isEnabled).toBe(false);
      expect(swRegisterSpy).not.toHaveBeenCalled();
    });

    it('can enable the SW', async () => {
      configTestBed({enabled: true}, {enabled: false});
      await untilStable();

      expect(TestBed.inject(SwUpdate).isEnabled).toBe(true);
      expect(swRegisterSpy).toHaveBeenCalledWith('sw.js', {scope: undefined});
    });

    it('defaults to enabling the SW', async () => {
      configTestBed({}, {enabled: false});
      await untilStable();

      expect(TestBed.inject(SwUpdate).isEnabled).toBe(true);
      expect(swRegisterSpy).toHaveBeenCalledWith('sw.js', {scope: undefined});
    });

    describe('registrationStrategy', () => {
      const configTestBedWithMockedStability =
          (strategy?: SwRegistrationOptions['registrationStrategy']) => {
            const isStableSub = new Subject<boolean>();

            TestBed.configureTestingModule({
              imports: [ServiceWorkerModule.register('sw.js')],
              providers: [
                {provide: ApplicationRef, useValue: {isStable: isStableSub.asObservable()}},
                {provide: PLATFORM_ID, useValue: 'browser'},
                {
                  provide: SwRegistrationOptions,
                  useFactory: () => ({registrationStrategy: strategy})
                },
              ],
            });

            // Dummy `inject()` call to initialize the test "app".
            TestBed.inject(ApplicationRef);

            return isStableSub;
          };

      it('defaults to registering the SW when the app stabilizes (under 30s)', fakeAsync(() => {
           const isStableSub = configTestBedWithMockedStability();

           isStableSub.next(false);
           isStableSub.next(false);

           tick();
           expect(swRegisterSpy).not.toHaveBeenCalled();

           tick(20000);
           expect(swRegisterSpy).not.toHaveBeenCalled();

           isStableSub.next(true);

           tick();
           expect(swRegisterSpy).toHaveBeenCalledWith('sw.js', {scope: undefined});
         }));

      it('defaults to registering the SW after 30s if the app does not stabilize sooner',
         fakeAsync(() => {
           const isStableSub = configTestBedWithMockedStability();

           tick(29999);
           expect(swRegisterSpy).not.toHaveBeenCalled();

           tick(1);
           expect(swRegisterSpy).toHaveBeenCalledWith('sw.js', {scope: undefined});
         }));

      it('registers the SW when the app stabilizes with `registerWhenStable:<timeout>`',
         fakeAsync(() => {
           const isStableSub = configTestBedWithMockedStability('registerWhenStable:1000');

           isStableSub.next(false);
           isStableSub.next(false);

           tick();
           expect(swRegisterSpy).not.toHaveBeenCalled();

           tick(500);
           expect(swRegisterSpy).not.toHaveBeenCalled();

           isStableSub.next(true);

           tick();
           expect(swRegisterSpy).toHaveBeenCalledWith('sw.js', {scope: undefined});
         }));

      it('registers the SW after `timeout` if the app does not stabilize with `registerWhenStable:<timeout>`',
         fakeAsync(() => {
           configTestBedWithMockedStability('registerWhenStable:1000');

           tick(999);
           expect(swRegisterSpy).not.toHaveBeenCalled();

           tick(1);
           expect(swRegisterSpy).toHaveBeenCalledWith('sw.js', {scope: undefined});
         }));

      it('registers the SW asap (asynchronously) before the app stabilizes with `registerWhenStable:0`',
         fakeAsync(() => {
           const isStableSub = configTestBedWithMockedStability('registerWhenStable:0');

           // Create a microtask.
           Promise.resolve();

           flushMicrotasks();
           expect(swRegisterSpy).not.toHaveBeenCalled();

           tick(0);
           expect(swRegisterSpy).toHaveBeenCalledWith('sw.js', {scope: undefined});
         }));

      it('registers the SW only when the app stabilizes with `registerWhenStable:`',
         fakeAsync(() => {
           const isStableSub = configTestBedWithMockedStability('registerWhenStable:');

           isStableSub.next(false);
           isStableSub.next(false);

           tick();
           expect(swRegisterSpy).not.toHaveBeenCalled();

           tick(60000);
           expect(swRegisterSpy).not.toHaveBeenCalled();

           isStableSub.next(true);

           tick();
           expect(swRegisterSpy).toHaveBeenCalledWith('sw.js', {scope: undefined});
         }));

      it('registers the SW only when the app stabilizes with `registerWhenStable`',
         fakeAsync(() => {
           const isStableSub = configTestBedWithMockedStability('registerWhenStable');

           isStableSub.next(false);
           isStableSub.next(false);

           tick();
           expect(swRegisterSpy).not.toHaveBeenCalled();

           tick(60000);
           expect(swRegisterSpy).not.toHaveBeenCalled();

           isStableSub.next(true);

           tick();
           expect(swRegisterSpy).toHaveBeenCalledWith('sw.js', {scope: undefined});
         }));

      it('registers the SW immediatelly (synchronously) with `registerImmediately`', () => {
        configTestBedWithMockedStability('registerImmediately');
        expect(swRegisterSpy).toHaveBeenCalledWith('sw.js', {scope: undefined});
      });

      it('registers the SW after the specified delay with `registerWithDelay:<delay>`',
         fakeAsync(() => {
           configTestBedWithMockedStability('registerWithDelay:100000');

           tick(99999);
           expect(swRegisterSpy).not.toHaveBeenCalled();

           tick(1);
           expect(swRegisterSpy).toHaveBeenCalledWith('sw.js', {scope: undefined});
         }));

      it('registers the SW asap (asynchronously) with `registerWithDelay:`', fakeAsync(() => {
           configTestBedWithMockedStability('registerWithDelay:');

           // Create a microtask.
           Promise.resolve();

           flushMicrotasks();
           expect(swRegisterSpy).not.toHaveBeenCalled();

           tick(0);
           expect(swRegisterSpy).toHaveBeenCalledWith('sw.js', {scope: undefined});
         }));

      it('registers the SW asap (asynchronously) with `registerWithDelay`', fakeAsync(() => {
           configTestBedWithMockedStability('registerWithDelay');

           // Create a microtask.
           Promise.resolve();

           flushMicrotasks();
           expect(swRegisterSpy).not.toHaveBeenCalled();

           tick(0);
           expect(swRegisterSpy).toHaveBeenCalledWith('sw.js', {scope: undefined});
         }));

      it('registers the SW on first emitted value with observable factory function',
         fakeAsync(() => {
           const registerSub = new Subject<void>();
           const isStableSub = configTestBedWithMockedStability(() => registerSub.asObservable());

           isStableSub.next(true);
           tick();
           expect(swRegisterSpy).not.toHaveBeenCalled();

           registerSub.next();
           expect(swRegisterSpy).toHaveBeenCalledWith('sw.js', {scope: undefined});
         }));

      it('throws an error with unknown strategy', () => {
        expect(() => configTestBedWithMockedStability('registerYesterday'))
            .toThrowError('Unknown ServiceWorker registration strategy: registerYesterday');
        expect(swRegisterSpy).not.toHaveBeenCalled();
      });
    });
  });
});
