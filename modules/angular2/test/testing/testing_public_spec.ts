import {
  it,
  iit,
  xit,
  describe,
  ddescribe,
  xdescribe,
  expect,
  beforeEach,
  inject,
  async,
  fakeAsync,
  tick,
  withProviders,
  beforeEachProviders,
  TestComponentBuilder
} from 'angular2/testing';

import {Injectable, bind} from 'angular2/core';
import {NgIf} from 'angular2/common';
import {Directive, Component, ViewMetadata} from 'angular2/core';
import {PromiseWrapper} from 'angular2/src/facade/promise';

// Services, and components for the tests.

@Component(
    {selector: 'child-comp', template: `<span>Original {{childBinding}}</span>`, directives: []})
@Injectable()
class ChildComp {
  childBinding: string;
  constructor() { this.childBinding = 'Child'; }
}

@Component({selector: 'child-comp', template: `<span>Mock</span>`})
@Injectable()
class MockChildComp {
}

@Component({
  selector: 'parent-comp',
  template: `Parent(<child-comp></child-comp>)`,
  directives: [ChildComp]
})
@Injectable()
class ParentComp {
}

@Component({
  selector: 'my-if-comp',
  template: `MyIf(<span *ngIf="showMore">More</span>)`,
  directives: [NgIf]
})
@Injectable()
class MyIfComp {
  showMore: boolean = false;
}

@Component({selector: 'child-child-comp', template: `<span>ChildChild</span>`})
@Injectable()
class ChildChildComp {
}

@Component({
  selector: 'child-comp',
  template: `<span>Original {{childBinding}}(<child-child-comp></child-child-comp>)</span>`,
  directives: [ChildChildComp]
})
@Injectable()
class ChildWithChildComp {
  childBinding: string;
  constructor() { this.childBinding = 'Child'; }
}

@Component({selector: 'child-child-comp', template: `<span>ChildChild Mock</span>`})
@Injectable()
class MockChildChildComp {
}

class FancyService {
  value: string = 'real value';
  getAsyncValue() { return Promise.resolve('async value'); }
  getTimeoutValue() {
    return new Promise((resolve, reject) => { setTimeout(() => {resolve('timeout value')}, 10); })
  }
}

class MockFancyService extends FancyService {
  value: string = 'mocked out value';
}

@Component({
  selector: 'my-service-comp',
  providers: [FancyService],
  template: `injected value: {{fancyService.value}}`
})
class TestProvidersComp {
  constructor(private fancyService: FancyService) {}
}

@Component({
  selector: 'my-service-comp',
  viewProviders: [FancyService],
  template: `injected value: {{fancyService.value}}`
})
class TestViewProvidersComp {
  constructor(private fancyService: FancyService) {}
}

export function main() {
  describe('using the async helper', () => {
    var actuallyDone: boolean;

    beforeEach(() => { actuallyDone = false; });

    afterEach(() => { expect(actuallyDone).toEqual(true); });

    it('should run normal tests', () => { actuallyDone = true; });

    it('should run normal async tests', (done) => {
      setTimeout(() => {
        actuallyDone = true;
        done();
      }, 0);
    });

    it('should run async tests with tasks',
       async(() => { setTimeout(() => { actuallyDone = true; }, 0); }));

    it('should run async tests with promises', async(() => {
         var p = new Promise((resolve, reject) => { setTimeout(resolve, 10); });
         p.then(() => { actuallyDone = true; });
       }));
  });

  describe('using the test injector with the inject helper', () => {
    describe('setting up Providers', () => {
      beforeEachProviders(() => [bind(FancyService).toValue(new FancyService())]);

      it('should use set up providers',
         inject([FancyService], (service) => { expect(service.value).toEqual('real value'); }));

      it('should wait until returned promises', async(inject([FancyService], (service) => {
           service.getAsyncValue().then((value) => { expect(value).toEqual('async value'); });
           service.getTimeoutValue().then((value) => { expect(value).toEqual('timeout value'); });
         })));

      it('should allow the use of fakeAsync', fakeAsync(inject([FancyService], (service) => {
           var value;
           service.getAsyncValue().then(function(val) { value = val; });
           tick();
           expect(value).toEqual('async value');
         })));

      describe('using beforeEach', () => {
        beforeEach(inject([FancyService],
                          (service) => { service.value = 'value modified in beforeEach'; }));

        it('should use modified providers', inject([FancyService], (service) => {
             expect(service.value).toEqual('value modified in beforeEach');
           }));
      });

      describe('using async beforeEach', () => {
        beforeEach(async(inject([FancyService], (service) => {
          service.getAsyncValue().then((value) => { service.value = value; });
        })));

        it('should use asynchronously modified value',
           inject([FancyService], (service) => { expect(service.value).toEqual('async value'); }));
      });
    });

    describe('per test providers', () => {
      it('should allow per test providers',
         withProviders(() => [bind(FancyService).toValue(new FancyService())])
             .inject([FancyService],
                     (service) => { expect(service.value).toEqual('real value'); }));
    });
  });

  describe('errors', () => {
    var originalJasmineIt: any;
    var originalJasmineBeforeEach: any;

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

    var patchJasmineBeforeEach = () => {
      var deferred = PromiseWrapper.completer();
      originalJasmineBeforeEach = jasmine.getEnv().beforeEach;
      jasmine.getEnv().beforeEach = (fn: any) => {
        var done = () => { deferred.resolve() };
        (<any>done).fail = (err) => { deferred.reject(err) };
        fn(done);
        return null;
      };
      return deferred.promise;
    };

    var restoreJasmineBeforeEach =
        () => { jasmine.getEnv().beforeEach = originalJasmineBeforeEach; }

    it('should fail when an asynchronous error is thrown', (done) => {
      var itPromise = patchJasmineIt();

      it('throws an async error',
         async(inject([], () => { setTimeout(() => { throw new Error('bar'); }, 0); })));

      itPromise.then(() => { done.fail('Expected test to fail, but it did not'); }, (err) => {
        expect(err).toEqual('bar');
        done();
      });
      restoreJasmineIt();
    });

    it('should fail when a returned promise is rejected', (done) => {
      var itPromise = patchJasmineIt();

      it('should fail with an error from a promise', async(inject([], () => {
           var deferred = PromiseWrapper.completer();
           var p = deferred.promise.then(() => { expect(1).toEqual(2); });

           deferred.reject('baz');
           return p;
         })));

      itPromise.then(() => { done.fail('Expected test to fail, but it did not'); }, (err) => {
        expect(err).toEqual('Uncaught (in promise): baz');
        done();
      });
      restoreJasmineIt();
    });

    describe('using beforeEachProviders', () => {
      beforeEachProviders(() => [bind(FancyService).toValue(new FancyService())]);

      beforeEach(
          inject([FancyService], (service) => { expect(service.value).toEqual('real value'); }));

      describe('nested beforeEachProviders', () => {

        it('should fail when the injector has already been used', () => {
          patchJasmineBeforeEach();
          expect(() => {
            beforeEachProviders(() => [bind(FancyService).toValue(new FancyService())]);
          })
              .toThrowError('beforeEachProviders was called after the injector had been used ' +
                            'in a beforeEach or it block. This invalidates the test injector');
          restoreJasmineBeforeEach();
        });
      });
    });
  });

  describe('test component builder', function() {
    it('should instantiate a component with valid DOM',
       async(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {

         tcb.createAsync(ChildComp).then((componentFixture) => {
           componentFixture.detectChanges();

           expect(componentFixture.debugElement.nativeElement).toHaveText('Original Child');
         });
       })));

    it('should allow changing members of the component',
       async(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {

         tcb.createAsync(MyIfComp).then((componentFixture) => {
           componentFixture.detectChanges();
           expect(componentFixture.debugElement.nativeElement).toHaveText('MyIf()');

           componentFixture.debugElement.componentInstance.showMore = true;
           componentFixture.detectChanges();
           expect(componentFixture.debugElement.nativeElement).toHaveText('MyIf(More)');
         });
       })));

    it('should override a template',
       async(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {

         tcb.overrideTemplate(MockChildComp, '<span>Mock</span>')
             .createAsync(MockChildComp)
             .then((componentFixture) => {
               componentFixture.detectChanges();
               expect(componentFixture.debugElement.nativeElement).toHaveText('Mock');

             });
       })));

    it('should override a view',
       async(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {

         tcb.overrideView(ChildComp,
                          new ViewMetadata({template: '<span>Modified {{childBinding}}</span>'}))
             .createAsync(ChildComp)
             .then((componentFixture) => {
               componentFixture.detectChanges();
               expect(componentFixture.debugElement.nativeElement).toHaveText('Modified Child');

             });
       })));

    it('should override component dependencies',
       async(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {

         tcb.overrideDirective(ParentComp, ChildComp, MockChildComp)
             .createAsync(ParentComp)
             .then((componentFixture) => {
               componentFixture.detectChanges();
               expect(componentFixture.debugElement.nativeElement).toHaveText('Parent(Mock)');

             });
       })));


    it("should override child component's dependencies",
       async(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {

         tcb.overrideDirective(ParentComp, ChildComp, ChildWithChildComp)
             .overrideDirective(ChildWithChildComp, ChildChildComp, MockChildChildComp)
             .createAsync(ParentComp)
             .then((componentFixture) => {
               componentFixture.detectChanges();
               expect(componentFixture.debugElement.nativeElement)
                   .toHaveText('Parent(Original Child(ChildChild Mock))');

             });
       })));

    it('should override a provider',
       async(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {

         tcb.overrideProviders(TestProvidersComp, [bind(FancyService).toClass(MockFancyService)])
             .createAsync(TestProvidersComp)
             .then((componentFixture) => {
               componentFixture.detectChanges();
               expect(componentFixture.debugElement.nativeElement)
                   .toHaveText('injected value: mocked out value');
             });
       })));


    it('should override a viewProvider',
       async(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {

         tcb.overrideViewProviders(TestViewProvidersComp,
                                   [bind(FancyService).toClass(MockFancyService)])
             .createAsync(TestViewProvidersComp)
             .then((componentFixture) => {
               componentFixture.detectChanges();
               expect(componentFixture.debugElement.nativeElement)
                   .toHaveText('injected value: mocked out value');
             });
       })));
  });
}
