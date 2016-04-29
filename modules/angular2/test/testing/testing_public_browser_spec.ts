import {
  it,
  iit,
  xit,
  describe,
  ddescribe,
  xdescribe,
  expect,
  beforeEach,
  beforeEachProviders,
  inject,
  async,
  TestComponentBuilder,
  fakeAsync,
  tick
} from 'angular2/testing';

import {Injectable, bind} from 'angular2/core';
import {Directive, Component, ViewMetadata} from 'angular2/core';
import {PromiseWrapper} from 'angular2/src/facade/promise';
import {XHR} from 'angular2/src/compiler/xhr';
import {XHRImpl} from 'angular2/src/platform/browser/xhr_impl';

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
  templateUrl: '/base/modules/angular2/test/testing/static_assets/test.html'
})
class ExternalTemplateComp {
}

@Component({selector: 'bad-template-comp', templateUrl: 'non-existant.html'})
class BadTemplateUrl {
}

// Tests for angular2/testing bundle specific to the browser environment.
// For general tests, see test/testing/testing_public_spec.ts.
export function main() {
  describe('test APIs for the browser', () => {
    describe('angular2 jasmine matchers', () => {
      describe('toHaveCssClass', () => {
        it('should assert that the CSS class is present', () => {
          var el = document.createElement('div');
          el.classList.add('matias');
          expect(el).toHaveCssClass('matias');
        });

        it('should assert that the CSS class is not present', () => {
          var el = document.createElement('div');
          el.classList.add('matias');
          expect(el).not.toHaveCssClass('fatias');
        });
      });

      describe('toHaveCssStyle', () => {
        it('should assert that the CSS style is present', () => {
          var el = document.createElement('div');
          expect(el).not.toHaveCssStyle('width');

          el.style.setProperty('width', '100px');
          expect(el).toHaveCssStyle('width');
        });

        it('should assert that the styles are matched against the element', () => {
          var el = document.createElement('div');
          expect(el).not.toHaveCssStyle({width: '100px', height: '555px'});

          el.style.setProperty('width', '100px');
          expect(el).toHaveCssStyle({width: '100px'});
          expect(el).not.toHaveCssStyle({width: '100px', height: '555px'});

          el.style.setProperty('height', '555px');
          expect(el).toHaveCssStyle({height: '555px'});
          expect(el).toHaveCssStyle({width: '100px', height: '555px'});
        });
      });
    });

    describe('using the async helper', () => {
      var actuallyDone: boolean;

      beforeEach(() => { actuallyDone = false; });

      afterEach(() => { expect(actuallyDone).toEqual(true); });

      it('should run async tests with XHRs', async(() => {
           var xhr = new XHRImpl();
           xhr.get('/base/modules/angular2/test/testing/static_assets/test.html')
               .then(() => { actuallyDone = true; });
         }),
         10000);  // Long timeout here because this test makes an actual XHR.
    });

    describe('using the test injector with the inject helper', () => {
      describe('setting up Providers', () => {
        beforeEachProviders(() => [bind(FancyService).toValue(new FancyService())]);

        it('provides a real XHR instance',
           inject([XHR], (xhr) => { expect(xhr).toBeAnInstanceOf(XHRImpl); }));

        it('should allow the use of fakeAsync', fakeAsync(inject([FancyService], (service) => {
             var value;
             service.getAsyncValue().then(function(val) { value = val; });
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
        jasmine.getEnv().it = (description: string, fn) => {
          var done = () => { deferred.resolve() };
          (<any>done).fail = (err) => { deferred.reject(err) };
          fn(done);
          return null;
        };
        return deferred.promise;
      };

      var restoreJasmineIt = () => { jasmine.getEnv().it = originalJasmineIt; };

      it('should fail when an XHR fails', (done) => {
        var itPromise = patchJasmineIt();

        it('should fail with an error from a promise',
           async(inject([TestComponentBuilder],
                        (tcb) => { return tcb.createAsync(BadTemplateUrl); })));

        itPromise.then(() => { done.fail('Expected test to fail, but it did not'); }, (err) => {
          expect(err).toEqual('Uncaught (in promise): Failed to load non-existant.html');
          done();
        });
        restoreJasmineIt();
      }, 10000);
    });

    describe('test component builder', function() {
      it('should allow an external templateUrl',
         async(inject([TestComponentBuilder],
                      (tcb: TestComponentBuilder) => {

                        tcb.createAsync(ExternalTemplateComp)
                            .then((componentFixture) => {
                              componentFixture.detectChanges();
                              expect(componentFixture.debugElement.nativeElement)
                                  .toHaveText('from external template\n');
                            });
                      })),
         10000);  // Long timeout here because this test makes an actual XHR, and is slow on Edge.
    });
  });
}
