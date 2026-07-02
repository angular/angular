/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {destroyPlatform, NgModule, NgZone} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

import {
  getAngularJSGlobal,
  IAngularBootstrapConfig,
  module_,
} from '../../../src/common/src/angular1';
import {html, withEachNg1Version} from '../../../src/common/test/helpers/common_test_helpers';
import {UpgradeModule} from '../../index';

withEachNg1Version(() => {
  describe('UpgradeModule', () => {
    beforeEach(() => destroyPlatform());
    afterEach(() => destroyPlatform());

    describe('$injector', () => {
      it('should not be set initially', async () => {
        // Define `Ng2Module`.
        @NgModule({
          imports: [BrowserModule, UpgradeModule],
        })
        class Ng2Module {
          ngDoBootstrap() {}
        }

        // Bootstrap the ng2 app.
        const appRef = await platformBrowserDynamic().bootstrapModule(Ng2Module);
        const upgrade = appRef.injector.get(UpgradeModule);

        expect(upgrade.$injector).toBeUndefined();
      });

      it('should be set after calling `.bootstrap()`', async () => {
        // Define `ng1Module`.
        const ng1Module = module_('ng1Module', []).value('foo', 'ng1Foo');

        // Define `Ng2Module`.
        @NgModule({
          imports: [BrowserModule, UpgradeModule],
        })
        class Ng2Module {
          ngDoBootstrap() {}
        }

        // Bootstrap the ng2 app.
        const appRef = await platformBrowserDynamic().bootstrapModule(Ng2Module);
        const upgrade = appRef.injector.get(UpgradeModule);

        // Bootstrap the hybrid app.
        const element = html(`<ng2></ng2>`);
        upgrade.bootstrap(element, [ng1Module.name]);

        expect(upgrade.$injector).toBeDefined();
        expect(upgrade.$injector.get('foo')).toBe('ng1Foo');
      });
    });

    describe('injector', () => {
      it('should be set initially', async () => {
        // Define `Ng2Module`.
        @NgModule({
          imports: [BrowserModule, UpgradeModule],
          providers: [{provide: 'foo', useValue: 'ng2Foo'}],
        })
        class Ng2Module {
          ngDoBootstrap() {}
        }

        // Bootstrap the ng2 app.
        const appRef = await platformBrowserDynamic().bootstrapModule(Ng2Module);
        const upgrade = appRef.injector.get(UpgradeModule);

        expect(upgrade.injector).toBeDefined();
        expect(upgrade.injector.get('foo')).toBe('ng2Foo');
      });
    });

    describe('ngZone', () => {
      it('should be set initially', async () => {
        // Define `Ng2Module`.
        @NgModule({
          imports: [BrowserModule, UpgradeModule],
        })
        class Ng2Module {
          ngDoBootstrap() {}
        }

        // Bootstrap the ng2 app.
        const appRef = await platformBrowserDynamic().bootstrapModule(Ng2Module);
        const upgrade = appRef.injector.get(UpgradeModule);

        expect(upgrade.ngZone).toBeDefined();
        expect(upgrade.ngZone).toBe(appRef.injector.get(NgZone));
      });
    });

    describe('bootstrap()', () => {
      it('should call `angular.bootstrap()`', async () => {
        // Set up spies.
        const bootstrapSpy = spyOn(getAngularJSGlobal(), 'bootstrap').and.callThrough();

        // Define `Ng2Module`.
        @NgModule({
          imports: [BrowserModule, UpgradeModule],
        })
        class Ng2Module {
          ngDoBootstrap() {}
        }

        // Bootstrap the ng2 app.
        const appRef = await platformBrowserDynamic().bootstrapModule(Ng2Module);
        const upgrade = appRef.injector.get(UpgradeModule);

        // Bootstrap the hybrid app.
        const element = html(`<ng2></ng2>`);
        const config: IAngularBootstrapConfig = {strictDi: true};
        upgrade.bootstrap(element, [], config);

        expect(bootstrapSpy).toHaveBeenCalledOnceWith(element, jasmine.any(Array), config);
      });

      it('should forward the return value of `angular.bootstrap()`', async () => {
        // Set up spies.
        const bootstrapSpy = spyOn(getAngularJSGlobal(), 'bootstrap').and.callThrough();

        // Define `Ng2Module`.
        @NgModule({
          imports: [BrowserModule, UpgradeModule],
        })
        class Ng2Module {
          ngDoBootstrap() {}
        }

        // Bootstrap the ng2 app.
        const appRef = await platformBrowserDynamic().bootstrapModule(Ng2Module);
        const upgrade = appRef.injector.get(UpgradeModule);

        // Bootstrap the hybrid app.
        const retValue = upgrade.bootstrap(html(`<ng2></ng2>`), []);

        expect(retValue).toBe(bootstrapSpy.calls.mostRecent().returnValue);
        expect(retValue).toBe(upgrade.$injector); // In most cases, it will be the ng1 injector.
      });
    });
  });
});
