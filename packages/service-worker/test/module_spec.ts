/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ApplicationRef, PLATFORM_ID} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {filter, take} from 'rxjs/operators';

import {ServiceWorkerModule, SwRegistrationOptions} from '../src/module';
import {SwUpdate} from '../src/update';


describe('ServiceWorkerModule', () => {
  // Skip environments that don't support the minimum APIs needed to run these SW tests.
  if ((typeof navigator === 'undefined') || (typeof navigator.serviceWorker === 'undefined')) {
    return;
  }

  let swRegisterSpy: jasmine.Spy;

  beforeEach(() => swRegisterSpy = spyOn(navigator.serviceWorker, 'register'));

  describe('register()', () => {
    const configTestBed = async(opts: SwRegistrationOptions) => {
      TestBed.configureTestingModule({
        imports: [ServiceWorkerModule.register('sw.js', opts)],
        providers: [{provide: PLATFORM_ID, useValue: 'browser'}],
      });

      const appRef: ApplicationRef = TestBed.get(ApplicationRef);
      await appRef.isStable.pipe(filter(Boolean), take(1)).toPromise();
    };

    it('sets the registration options', async() => {
      await configTestBed({enabled: true, scope: 'foo'});

      expect(TestBed.get(SwRegistrationOptions)).toEqual({enabled: true, scope: 'foo'});
      expect(swRegisterSpy).toHaveBeenCalledWith('sw.js', {scope: 'foo'});
    });

    it('can disable the SW', async() => {
      await configTestBed({enabled: false});

      expect(TestBed.get(SwUpdate).isEnabled).toBe(false);
      expect(swRegisterSpy).not.toHaveBeenCalled();
    });

    it('can enable the SW', async() => {
      await configTestBed({enabled: true});

      expect(TestBed.get(SwUpdate).isEnabled).toBe(true);
      expect(swRegisterSpy).toHaveBeenCalledWith('sw.js', {scope: undefined});
    });

    it('defaults to enabling the SW', async() => {
      await configTestBed({});
      expect(TestBed.get(SwUpdate).isEnabled).toBe(true);
      expect(swRegisterSpy).toHaveBeenCalledWith('sw.js', {scope: undefined});
    });
  });

  describe('SwRegistrationOptions', () => {
    const configTestBed =
        async(providerOpts: SwRegistrationOptions, staticOpts?: SwRegistrationOptions) => {
      TestBed.configureTestingModule({
        imports: [ServiceWorkerModule.register('sw.js', staticOpts || {scope: 'static'})],
        providers: [
          {provide: PLATFORM_ID, useValue: 'browser'},
          {provide: SwRegistrationOptions, useFactory: () => providerOpts},
        ],
      });

      const appRef: ApplicationRef = TestBed.get(ApplicationRef);
      await appRef.isStable.pipe(filter(Boolean), take(1)).toPromise();
    };

    it('sets the registration options (and overwrites those set via `.register()`', async() => {
      await configTestBed({enabled: true, scope: 'provider'});

      expect(TestBed.get(SwRegistrationOptions)).toEqual({enabled: true, scope: 'provider'});
      expect(swRegisterSpy).toHaveBeenCalledWith('sw.js', {scope: 'provider'});
    });

    it('can disable the SW', async() => {
      await configTestBed({enabled: false}, {enabled: true});

      expect(TestBed.get(SwUpdate).isEnabled).toBe(false);
      expect(swRegisterSpy).not.toHaveBeenCalled();
    });

    it('can enable the SW', async() => {
      await configTestBed({enabled: true}, {enabled: false});

      expect(TestBed.get(SwUpdate).isEnabled).toBe(true);
      expect(swRegisterSpy).toHaveBeenCalledWith('sw.js', {scope: undefined});
    });

    it('defaults to enabling the SW', async() => {
      await configTestBed({}, {enabled: false});

      expect(TestBed.get(SwUpdate).isEnabled).toBe(true);
      expect(swRegisterSpy).toHaveBeenCalledWith('sw.js', {scope: undefined});
    });
  });
});
