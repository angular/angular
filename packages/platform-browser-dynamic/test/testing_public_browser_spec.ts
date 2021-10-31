/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ResourceLoader} from '@angular/compiler';
import {Compiler, Component, NgModule} from '@angular/core';
import {fakeAsync, inject, TestBed, tick, waitForAsync} from '@angular/core/testing';
import {ResourceLoaderImpl} from '@angular/platform-browser-dynamic/src/resource_loader/resource_loader_impl';

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

@Component({
  selector: 'external-template-comp',
  templateUrl: '/base/angular/packages/platform-browser/test/static_assets/test.html'
})
class ExternalTemplateComp {
}

@Component({selector: 'bad-template-comp', templateUrl: 'non-existent.html'})
class BadTemplateUrl {
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
           resourceLoader
               .get('/base/angular/packages/platform-browser/test/static_assets/test.html')
               .then(() => {
                 actuallyDone = true;
               });
         }),
         10000);  // Long timeout here because this test makes an actual ResourceLoader.
    });

    describe('using the test injector with the inject helper', () => {
      describe('setting up Providers', () => {
        beforeEach(() => {
          TestBed.configureTestingModule(
              {providers: [{provide: FancyService, useValue: new FancyService()}]});
        });

        it('provides a real ResourceLoader instance',
           inject([ResourceLoader], (resourceLoader: ResourceLoader) => {
             expect(resourceLoader instanceof ResourceLoaderImpl).toBeTruthy();
           }));

        it('should allow the use of fakeAsync',
           fakeAsync(inject([FancyService], (service: any /** TODO #9100 */) => {
             let value: any /** TODO #9100 */;
             service.getAsyncValue().then(function(val: any /** TODO #9100 */) {
               value = val;
             });
             tick();
             expect(value).toEqual('async value');
           })));
      });
    });

    describe('Compiler', () => {
      it('should return NgModule id when asked', () => {
        @NgModule({
          id: 'test-module',
        })
        class TestModule {
        }

        TestBed.configureTestingModule({
          imports: [TestModule],
        });
        const compiler = TestBed.inject(Compiler);
        expect(compiler.getModuleId(TestModule)).toBe('test-module');
      });
    });

    describe('errors', () => {
      describe('should fail when an ResourceLoader fails', () => {
        it('should fail with an error from a promise', async () => {
          TestBed.configureTestingModule({declarations: [BadTemplateUrl]});
          await expectAsync(TestBed.compileComponents())
              .toBeRejectedWith('Failed to load non-existent.html');
        }, 10000);
      });
    });

    describe('TestBed createComponent', function() {
      it('should allow an external templateUrl', waitForAsync(() => {
           TestBed.configureTestingModule({declarations: [ExternalTemplateComp]});
           TestBed.compileComponents().then(() => {
             const componentFixture = TestBed.createComponent(ExternalTemplateComp);
             componentFixture.detectChanges();
             expect(componentFixture.nativeElement.textContent).toEqual('from external template');
           });
         }),
         10000);  // Long timeout here because this test makes an actual ResourceLoader
                  // request, and is slow on Edge.
    });
  });
}
