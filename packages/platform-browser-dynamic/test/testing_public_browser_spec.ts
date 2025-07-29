/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ResourceLoader} from '@angular/compiler';
import {Compiler, Component, getPlatform, NgModule} from '@angular/core';
import {fakeAsync, inject, TestBed, tick, waitForAsync} from '@angular/core/testing';
import {ResourceLoaderImpl} from '../src/resource_loader/resource_loader_impl';
import {BrowserDynamicTestingModule, platformBrowserDynamicTesting} from '../testing';
import {BrowserTestingModule, platformBrowserTesting} from '@angular/platform-browser/testing';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {isBrowser} from '@angular/private/testing';

// Components for the tests.
class FancyService {
  value: string = 'real value';
  getAsyncValue() {
    return Promise.resolve('async value');
  }
  getTimeoutValue() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve('timeout value');
      }, 10);
    });
  }
}

// Tests for angular/testing bundle specific to the browser environment.
// For general tests, see test/testing/testing_public_spec.ts.
if (isBrowser) {
  describe('test APIs for the browser', () => {
    describe('using the async helper', () => {
      let actuallyDone: boolean;

      beforeEach(() => {
        actuallyDone = false;
      });

      afterEach(() => {
        expect(actuallyDone).toEqual(true);
      });

      it('should run async tests with ResourceLoaders', waitForAsync(() => {
        const resourceLoader = new ResourceLoaderImpl();
        resourceLoader.get('/packages/platform-browser/test/static_assets/test.html').then(() => {
          actuallyDone = true;
        });
      }), 10000); // Long timeout here because this test makes an actual ResourceLoader.
    });

    describe('using the test injector with the inject helper', () => {
      describe('setting up Providers', () => {
        beforeEach(() => {
          getPlatform()?.destroy();
          // We need to reset the test environment because
          // browser_tests.init.ts doesn't use platformBrowserDynamicTesting
          TestBed.resetTestEnvironment();
          TestBed.initTestEnvironment(
            [BrowserDynamicTestingModule],
            platformBrowserDynamicTesting(),
          );

          TestBed.configureTestingModule({
            providers: [{provide: FancyService, useValue: new FancyService()}],
          });
        });

        it('provides a real ResourceLoader instance', inject(
          [ResourceLoader],
          (resourceLoader: ResourceLoader) => {
            expect(resourceLoader instanceof ResourceLoaderImpl).toBeTruthy();
          },
        ));

        it('should allow the use of fakeAsync', fakeAsync(
          inject([FancyService], (service: FancyService) => {
            let value: string | undefined;
            service.getAsyncValue().then(function (val: string) {
              value = val;
            });
            tick();
            expect(value).toEqual('async value');
          }),
        ));

        afterEach(() => {
          getPlatform()?.destroy();

          // We're reset the test environment to their default values, cf browser_tests.init.ts
          TestBed.resetTestEnvironment();
          TestBed.initTestEnvironment(
            [BrowserTestingModule, NoopAnimationsModule],
            platformBrowserTesting(),
          );
        });
      });
    });

    describe('Compiler', () => {
      it('should return NgModule id when asked', () => {
        @NgModule({
          id: 'test-module',
        })
        class TestModule {}

        TestBed.configureTestingModule({
          imports: [TestModule],
        });
        const compiler = TestBed.inject(Compiler);
        expect(compiler.getModuleId(TestModule)).toBe('test-module');
      });
    });

    describe('errors', () => {
      describe('should fail when an ResourceLoader fails', () => {
        // TODO(alxhub): figure out why this is failing on saucelabs
        xit('should fail with an error from a promise', async () => {
          @Component({
            selector: 'bad-template-comp',
            templateUrl: 'non-existent.html',
            standalone: false,
          })
          class BadTemplateUrl {}

          TestBed.configureTestingModule({declarations: [BadTemplateUrl]});
          await expectAsync(TestBed.compileComponents()).toBeRejectedWith(
            'Failed to load non-existent.html',
          );
        }, 10000);
      });
    });

    describe('TestBed createComponent', function () {
      // TODO(alxhub): disable while we figure out how this should work
      xit('should allow an external templateUrl', waitForAsync(() => {
        @Component({
          selector: 'external-template-comp',
          templateUrl: '/base/angular/packages/platform-browser/test/static_assets/test.html',
          standalone: false,
        })
        class ExternalTemplateComp {}

        TestBed.configureTestingModule({declarations: [ExternalTemplateComp]});
        TestBed.compileComponents().then(() => {
          const componentFixture = TestBed.createComponent(ExternalTemplateComp);
          componentFixture.detectChanges();
          expect(componentFixture.nativeElement.textContent).toEqual('from external template');
        });
      }), 10000); // Long timeout here because this test makes an actual ResourceLoader
      // request, and is slow on Edge.
    });
  });
}
