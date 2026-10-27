/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ApplicationRef, PLATFORM_ID} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {Subject} from 'rxjs';
import {filter, take} from 'rxjs/operators';

import {ServiceWorkerModule} from '../src/module';
import {provideServiceWorker, SwRegistrationOptions} from '../src/provider';
import {SwUpdate} from '../src/update';

const provideServiceWorkerApi = 'provideServiceWorker';
const serviceWorkerModuleApi = 'ServiceWorkerModule';

async function waitForReadyToRegister() {
  // `readyToRegister` is a microtask (often via `Promise.race`), so we wait for it to execute by
  // scheduling microtasks before running expectations.
  await Promise.resolve();
  await Promise.resolve();
}

[provideServiceWorkerApi, serviceWorkerModuleApi].forEach((apiFnName: string) => {
  describe(apiFnName, () => {
    // Skip environments that don't support the minimum APIs needed to run these SW tests.
    if (typeof navigator === 'undefined' || typeof navigator.serviceWorker === 'undefined') {
      // Jasmine will throw if there are no tests.
      it('should pass', () => {});
      return;
    }

    let swRegisterSpy: jasmine.Spy;

    const untilStable = () => {
      return TestBed.inject(ApplicationRef).whenStable();
    };

    beforeEach(
      () =>
        (swRegisterSpy = spyOn(navigator.serviceWorker, 'register').and.returnValue(
          Promise.resolve(null as any),
        )),
    );

    describe('register', () => {
      const configTestBed = async (options: SwRegistrationOptions) => {
        if (apiFnName === provideServiceWorkerApi) {
          TestBed.configureTestingModule({
            providers: [
              provideServiceWorker('sw.js', options),
              {provide: PLATFORM_ID, useValue: 'browser'},
            ],
          });
        } else {
          TestBed.configureTestingModule({
            imports: [ServiceWorkerModule.register('sw.js', options)],
            providers: [{provide: PLATFORM_ID, useValue: 'browser'}],
          });
        }

        await untilStable();
        await waitForReadyToRegister();
      };

      it('sets the registration options', async () => {
        await configTestBed({enabled: true, scope: 'foo', updateViaCache: 'all', type: 'classic'});

        expect(TestBed.inject(SwRegistrationOptions)).toEqual({
          enabled: true,
          scope: 'foo',
          updateViaCache: 'all',
          type: 'classic',
        });
        expect(swRegisterSpy).toHaveBeenCalledWith('sw.js', {
          scope: 'foo',
          updateViaCache: 'all',
          type: 'classic',
        });
      });

      it('can disable the SW', async () => {
        await configTestBed({enabled: false});

        expect(TestBed.inject(SwUpdate).isEnabled).toBe(false);
        expect(swRegisterSpy).not.toHaveBeenCalled();
      });

      it('can enable the SW', async () => {
        await configTestBed({enabled: true});

        expect(TestBed.inject(SwUpdate).isEnabled).toBe(true);
        expect(swRegisterSpy).toHaveBeenCalledWith('sw.js', {
          scope: undefined,
          updateViaCache: undefined,
          type: undefined,
        });
      });

      it('can set updateViaCache', async () => {
        await configTestBed({enabled: true, updateViaCache: 'imports'});

        expect(TestBed.inject(SwUpdate).isEnabled).toBe(true);
        expect(swRegisterSpy).toHaveBeenCalledWith('sw.js', {
          scope: undefined,
          updateViaCache: 'imports',
          type: undefined,
        });
      });

      it('can set type', async () => {
        await configTestBed({enabled: true, type: 'module'});

        expect(TestBed.inject(SwUpdate).isEnabled).toBe(true);
        expect(swRegisterSpy).toHaveBeenCalledWith('sw.js', {
          scope: undefined,
          updateViaCache: undefined,
          type: 'module',
        });
      });

      it('defaults to enabling the SW', async () => {
        await configTestBed({});

        expect(TestBed.inject(SwUpdate).isEnabled).toBe(true);
        expect(swRegisterSpy).toHaveBeenCalledWith('sw.js', {
          scope: undefined,
          updateViaCache: undefined,
          type: undefined,
        });
      });

      it('catches and logs registration errors', async () => {
        const consoleErrorSpy = spyOn(console, 'error');
        swRegisterSpy.and.returnValue(Promise.reject('no reason'));

        await configTestBed({enabled: true, scope: 'foo'});
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'NG05604: Service worker registration failed with: no reason',
        );
      });
    });

    describe('SwRegistrationOptions', () => {
      const configTestBed = (
        providerOpts: SwRegistrationOptions,
        staticOpts?: SwRegistrationOptions,
      ) => {
        if (apiFnName === provideServiceWorkerApi) {
          TestBed.configureTestingModule({
            providers: [
              provideServiceWorker('sw.js', staticOpts || {scope: 'static', updateViaCache: 'all'}),
              {provide: PLATFORM_ID, useValue: 'browser'},
              {provide: SwRegistrationOptions, useFactory: () => providerOpts},
            ],
          });
        } else {
          TestBed.configureTestingModule({
            imports: [
              ServiceWorkerModule.register(
                'sw.js',
                staticOpts || {scope: 'static', updateViaCache: 'all'},
              ),
            ],
            providers: [
              {provide: PLATFORM_ID, useValue: 'browser'},
              {provide: SwRegistrationOptions, useFactory: () => providerOpts},
            ],
          });
        }
      };

      it('sets the registration options (and overwrites those set via `provideServiceWorker()`', async () => {
        configTestBed({
          enabled: true,
          scope: 'provider',
          updateViaCache: 'imports',
          type: 'module',
        });
        await untilStable();
        expect(TestBed.inject(SwRegistrationOptions)).toEqual({
          enabled: true,
          scope: 'provider',
          updateViaCache: 'imports',
          type: 'module',
        });
        await waitForReadyToRegister();
        expect(swRegisterSpy).toHaveBeenCalledWith('sw.js', {
          scope: 'provider',
          updateViaCache: 'imports',
          type: 'module',
        });
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
        await waitForReadyToRegister();
        expect(swRegisterSpy).toHaveBeenCalledWith('sw.js', {
          scope: undefined,
          updateViaCache: undefined,
          type: undefined,
        });
      });

      it('defaults to enabling the SW', async () => {
        configTestBed({}, {enabled: false});
        await untilStable();

        expect(TestBed.inject(SwUpdate).isEnabled).toBe(true);
        await waitForReadyToRegister();
        expect(swRegisterSpy).toHaveBeenCalledWith('sw.js', {
          scope: undefined,
          updateViaCache: undefined,
          type: undefined,
        });
      });

      describe('registrationStrategy', () => {
        beforeEach(() => jasmine.clock().install());
        afterEach(() => jasmine.clock().uninstall());

        const configTestBedWithMockedStability = (
          strategy?: SwRegistrationOptions['registrationStrategy'],
        ) => {
          const isStableSub = new Subject<boolean>();
          const whenStable = () =>
            new Promise<void>((resolve) =>
              isStableSub.pipe(filter(Boolean), take(1)).subscribe(() => resolve()),
            );

          if (apiFnName === provideServiceWorkerApi) {
            TestBed.configureTestingModule({
              providers: [
                provideServiceWorker('sw.js'),
                {
                  provide: ApplicationRef,
                  useValue: {
                    isStable: isStableSub.asObservable(),
                    whenStable,
                    afterTick: new Subject(),
                    onDestroy: () => {},
                  },
                },
                {provide: PLATFORM_ID, useValue: 'browser'},
                {
                  provide: SwRegistrationOptions,
                  useFactory: () => ({registrationStrategy: strategy}),
                },
              ],
            });
          } else {
            TestBed.configureTestingModule({
              imports: [ServiceWorkerModule.register('sw.js')],
              providers: [
                {
                  provide: ApplicationRef,
                  useValue: {
                    isStable: isStableSub.asObservable(),
                    whenStable,
                    afterTick: new Subject(),
                    onDestroy: () => {},
                  },
                },
                {provide: PLATFORM_ID, useValue: 'browser'},
                {
                  provide: SwRegistrationOptions,
                  useFactory: () => ({registrationStrategy: strategy}),
                },
              ],
            });
          }

          // Dummy `inject()` call to initialize the test "app".
          TestBed.inject(ApplicationRef);

          return isStableSub;
        };

        it('defaults to registering the SW when the app stabilizes (under 30s)', async () => {
          const isStableSub = configTestBedWithMockedStability();

          isStableSub.next(false);
          jasmine.clock().tick(20000);
          await waitForReadyToRegister();

          expect(swRegisterSpy).not.toHaveBeenCalled();

          isStableSub.next(true);
          await waitForReadyToRegister();

          expect(swRegisterSpy).toHaveBeenCalledWith('sw.js', {
            scope: undefined,
            updateViaCache: undefined,
            type: undefined,
          });
        });

        it('defaults to registering the SW after 30s if the app does not stabilize sooner', async () => {
          configTestBedWithMockedStability();
          jasmine.clock().tick(29999);
          await waitForReadyToRegister();
          expect(swRegisterSpy).not.toHaveBeenCalled();

          jasmine.clock().tick(1);
          await waitForReadyToRegister();
          expect(swRegisterSpy).toHaveBeenCalledWith('sw.js', {
            scope: undefined,
            updateViaCache: undefined,
            type: undefined,
          });
        });

        it('registers the SW when the app stabilizes with `registerWhenStable:<timeout>`', async () => {
          const isStableSub = configTestBedWithMockedStability('registerWhenStable:1000');

          isStableSub.next(false);
          isStableSub.next(false);
          await waitForReadyToRegister();

          expect(swRegisterSpy).not.toHaveBeenCalled();

          isStableSub.next(true);
          await waitForReadyToRegister();

          expect(swRegisterSpy).toHaveBeenCalledWith('sw.js', {
            scope: undefined,
            updateViaCache: undefined,
            type: undefined,
          });
        });

        it('registers the SW after `timeout` if the app does not stabilize with `registerWhenStable:<timeout>`', async () => {
          configTestBedWithMockedStability('registerWhenStable:1000');
          jasmine.clock().tick(999);
          await waitForReadyToRegister();
          expect(swRegisterSpy).not.toHaveBeenCalled();

          jasmine.clock().tick(1);
          await waitForReadyToRegister();
          expect(swRegisterSpy).toHaveBeenCalledWith('sw.js', {
            scope: undefined,
            updateViaCache: undefined,
            type: undefined,
          });
        });

        it('registers the SW asap (asynchronously) before the app stabilizes with `registerWhenStable:0`', async () => {
          configTestBedWithMockedStability('registerWhenStable:0');

          // Create a microtask.
          await waitForReadyToRegister();

          expect(swRegisterSpy).not.toHaveBeenCalled();

          jasmine.clock().tick(0);
          await waitForReadyToRegister();
          expect(swRegisterSpy).toHaveBeenCalledWith('sw.js', {
            scope: undefined,
            updateViaCache: undefined,
            type: undefined,
          });
        });

        it('registers the SW only when the app stabilizes with `registerWhenStable:`', async () => {
          const isStableSub = configTestBedWithMockedStability('registerWhenStable:');

          isStableSub.next(false);
          isStableSub.next(false);
          await waitForReadyToRegister();

          expect(swRegisterSpy).not.toHaveBeenCalled();

          isStableSub.next(true);
          await waitForReadyToRegister();

          expect(swRegisterSpy).toHaveBeenCalledWith('sw.js', {
            scope: undefined,
            updateViaCache: undefined,
            type: undefined,
          });
        });

        it('registers the SW only when the app stabilizes with `registerWhenStable`', async () => {
          const isStableSub = configTestBedWithMockedStability('registerWhenStable');

          isStableSub.next(false);
          isStableSub.next(false);
          await waitForReadyToRegister();

          expect(swRegisterSpy).not.toHaveBeenCalled();

          isStableSub.next(true);
          await waitForReadyToRegister();

          expect(swRegisterSpy).toHaveBeenCalledWith('sw.js', {
            scope: undefined,
            updateViaCache: undefined,
            type: undefined,
          });
        });

        it('registers the SW immediatelly (synchronously) with `registerImmediately`', async () => {
          configTestBedWithMockedStability('registerImmediately');
          await waitForReadyToRegister();
          expect(swRegisterSpy).toHaveBeenCalledWith('sw.js', {
            scope: undefined,
            updateViaCache: undefined,
            type: undefined,
          });
        });

        it('registers the SW after the specified delay with `registerWithDelay:<delay>`', async () => {
          configTestBedWithMockedStability('registerWithDelay:100000');

          jasmine.clock().tick(99999);
          await waitForReadyToRegister();
          expect(swRegisterSpy).not.toHaveBeenCalled();

          jasmine.clock().tick(1);
          await waitForReadyToRegister();
          expect(swRegisterSpy).toHaveBeenCalledWith('sw.js', {
            scope: undefined,
            updateViaCache: undefined,
            type: undefined,
          });
        });

        it('registers the SW asap (asynchronously) with `registerWithDelay:`', async () => {
          configTestBedWithMockedStability('registerWithDelay:');

          // Wait for microtasks.
          await waitForReadyToRegister();
          expect(swRegisterSpy).not.toHaveBeenCalled();

          jasmine.clock().tick(0);
          await waitForReadyToRegister();
          expect(swRegisterSpy).toHaveBeenCalledWith('sw.js', {
            scope: undefined,
            updateViaCache: undefined,
            type: undefined,
          });
        });

        it('registers the SW asap (asynchronously) with `registerWithDelay`', async () => {
          configTestBedWithMockedStability('registerWithDelay');

          // Wait for microtasks.
          await waitForReadyToRegister();
          expect(swRegisterSpy).not.toHaveBeenCalled();

          jasmine.clock().tick(0);
          await waitForReadyToRegister();
          expect(swRegisterSpy).toHaveBeenCalledWith('sw.js', {
            scope: undefined,
            updateViaCache: undefined,
            type: undefined,
          });
        });

        it('registers the SW on first emitted value with observable factory function', async () => {
          const registerSub = new Subject<void>();
          const isStableSub = configTestBedWithMockedStability(() => registerSub.asObservable());

          isStableSub.next(true);
          await waitForReadyToRegister();
          expect(swRegisterSpy).not.toHaveBeenCalled();

          registerSub.next();
          await waitForReadyToRegister();
          expect(swRegisterSpy).toHaveBeenCalledWith('sw.js', {
            scope: undefined,
            updateViaCache: undefined,
            type: undefined,
          });
        });

        it('throws an error with unknown strategy', () => {
          expect(() => configTestBedWithMockedStability('registerYesterday')).toThrowError(
            'NG05600: Unknown ServiceWorker registration strategy: registerYesterday',
          );
          expect(swRegisterSpy).not.toHaveBeenCalled();
        });

        it('should not register service worker if app was destroyed before it was ready to register', async () => {
          const registerSub = new Subject<void>();
          configTestBedWithMockedStability(() => registerSub);
          expect(swRegisterSpy).not.toHaveBeenCalled();
          // Given that the app is destroyed (e.g., by calling `ApplicationRef.destroy()`)
          // before the `readyToRegister` promise resolves and `serviceWorker.register(...)` is called.
          TestBed.resetTestingModule();
          await waitForReadyToRegister();
          expect(swRegisterSpy).not.toHaveBeenCalled();
        });
      });
    });
  });
});
