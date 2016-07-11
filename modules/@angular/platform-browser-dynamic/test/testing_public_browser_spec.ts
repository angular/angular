/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {XHR} from '@angular/compiler';
import {Component, bind} from '@angular/core';
import {TestComponentBuilder, addProviders, async, fakeAsync, flushMicrotasks, inject, tick} from '@angular/core/testing';
import {ROUTER_DIRECTIVES, Route} from '@angular/router-deprecated';

import {PromiseWrapper} from '../src/facade/promise';
import {XHRImpl} from '../src/xhr/xhr_impl';



// Components for the tests.
class FancyService {
  value: string = 'real value';
  getAsyncValue() { return Promise.resolve('async value'); }
  getTimeoutValue() {
    return new Promise((resolve, reject) => { setTimeout(() => {resolve('timeout value')}, 10); })
  }
}

@Component({
  selector: 'external-template-comp',
  templateUrl: '/base/modules/@angular/platform-browser/test/static_assets/test.html'
})
class ExternalTemplateComp {
}

@Component({selector: 'bad-template-comp', templateUrl: 'non-existant.html'})
class BadTemplateUrl {
}

@Component({
  selector: 'test-router-cmp',
  template:
      `<a [routerLink]="['One']">one</a> <a [routerLink]="['Two']">two</a><router-outlet></router-outlet>`,
  directives: [ROUTER_DIRECTIVES]
})
class TestRouterComponent {
}

// Tests for angular2/testing bundle specific to the browser environment.
// For general tests, see test/testing/testing_public_spec.ts.
export function main() {
  describe('test APIs for the browser', () => {
    describe('using the async helper', () => {
      var actuallyDone: boolean;

      beforeEach(() => { actuallyDone = false; });

      afterEach(() => { expect(actuallyDone).toEqual(true); });

      it('should run async tests with XHRs', async(() => {
           var xhr = new XHRImpl();
           xhr.get('/base/modules/@angular/platform-browser/test/static_assets/test.html')
               .then(() => { actuallyDone = true; });
         }),
         10000);  // Long timeout here because this test makes an actual XHR.
    });

    describe('using the test injector with the inject helper', () => {
      describe('setting up Providers', () => {
        beforeEach(() => addProviders([{provide: FancyService, useValue: new FancyService()}]));

        it('provides a real XHR instance',
           inject([XHR], (xhr: XHR) => { expect(xhr instanceof XHRImpl).toBeTruthy(); }));

        it('should allow the use of fakeAsync',
           fakeAsync(inject([FancyService], (service: any /** TODO #9100 */) => {
             var value: any /** TODO #9100 */;
             service.getAsyncValue().then(function(val: any /** TODO #9100 */) { value = val; });
             tick();
             expect(value).toEqual('async value');
           })));
      });
    });

    describe('errors', () => {
      var originalJasmineIt: any;

      var patchJasmineIt = () => {
        var deferred = PromiseWrapper.completer();
        originalJasmineIt = jasmine.getEnv().it;
        jasmine.getEnv().it = (description: string, fn: any /** TODO #9100 */) => {
          var done = () => { deferred.resolve() };
          (<any>done).fail = (err: any /** TODO #9100 */) => { deferred.reject(err) };
          fn(done);
          return null;
        };
        return deferred.promise;
      };

      var restoreJasmineIt = () => { jasmine.getEnv().it = originalJasmineIt; };

      it('should fail when an XHR fails', (done: any /** TODO #9100 */) => {
        var itPromise = patchJasmineIt();

        it('should fail with an error from a promise',
           async(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
             return tcb.createAsync(BadTemplateUrl);
           })));

        itPromise.then(
            () => { done.fail('Expected test to fail, but it did not'); },
            (err) => {
              expect(err.message)
                  .toEqual('Uncaught (in promise): Failed to load non-existant.html');
              done();
            });
        restoreJasmineIt();
      }, 10000);
    });

    describe('test component builder', function() {
      it('should allow an external templateUrl',
         async(inject(
             [TestComponentBuilder],
             (tcb: TestComponentBuilder) => {

               tcb.createAsync(ExternalTemplateComp).then((componentFixture) => {
                 componentFixture.detectChanges();
                 expect(componentFixture.debugElement.nativeElement.textContent)
                     .toEqual('from external template\n');
               });
             })),
         10000);  // Long timeout here because this test makes an actual XHR, and is slow on Edge.
    });
  });
}
