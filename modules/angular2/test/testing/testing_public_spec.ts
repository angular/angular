import {
  it,
  iit,
  xit,
  describe,
  ddescribe,
  xdescribe,
  expect,
  tick,
  beforeEach,
  inject,
  injectAsync,
  beforeEachProviders,
  TestComponentBuilder
} from 'angular2/testing';

import {Injectable, NgIf, bind} from 'angular2/core';
import {Directive, Component, View, ViewMetadata} from 'angular2/angular2';
import {XHR} from 'angular2/src/compiler/xhr';
import {XHRImpl} from 'angular2/src/platform/browser/xhr_impl';

// Services, and components for the tests.

@Component({selector: 'child-comp'})
@View({template: `<span>Original {{childBinding}}</span>`, directives: []})
@Injectable()
class ChildComp {
  childBinding: string;
  constructor() { this.childBinding = 'Child'; }
}

@Component({selector: 'child-comp'})
@View({template: `<span>Mock</span>`})
@Injectable()
class MockChildComp {
}

@Component({selector: 'parent-comp'})
@View({template: `Parent(<child-comp></child-comp>)`, directives: [ChildComp]})
@Injectable()
class ParentComp {
}

@Component({selector: 'my-if-comp'})
@View({template: `MyIf(<span *ng-if="showMore">More</span>)`, directives: [NgIf]})
@Injectable()
class MyIfComp {
  showMore: boolean = false;
}

@Component({selector: 'child-child-comp'})
@View({template: `<span>ChildChild</span>`})
@Injectable()
class ChildChildComp {
}

@Component({selector: 'child-comp'})
@View({
  template: `<span>Original {{childBinding}}(<child-child-comp></child-child-comp>)</span>`,
  directives: [ChildChildComp]
})
@Injectable()
class ChildWithChildComp {
  childBinding: string;
  constructor() { this.childBinding = 'Child'; }
}

@Component({selector: 'child-child-comp'})
@View({template: `<span>ChildChild Mock</span>`})
@Injectable()
class MockChildChildComp {
}

class FancyService {
  value: string = 'real value';
  getAsyncValue() { return Promise.resolve('async value'); }
}

class MockFancyService extends FancyService {
  value: string = 'mocked out value';
}

@Component({selector: 'my-service-comp', providers: [FancyService]})
@View({template: `injected value: {{fancyService.value}}`})
class TestProvidersComp {
  constructor(private fancyService: FancyService) {}
}

@Component({selector: 'my-service-comp', viewProviders: [FancyService]})
@View({template: `injected value: {{fancyService.value}}`})
class TestViewProvidersComp {
  constructor(private fancyService: FancyService) {}
}


export function main() {
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
  });

  describe('using the test injector with the inject helper', () => {
    it('should run normal tests', () => { expect(true).toEqual(true); });

    it('should run normal async tests', (done) => {
      setTimeout(() => {
        expect(true).toEqual(true);
        done();
      }, 0);
    });

    it('provides a real XHR instance',
       inject([XHR], (xhr) => { expect(xhr).toBeAnInstanceOf(XHRImpl); }));

    describe('setting up Providers', () => {
      beforeEachProviders(() => [bind(FancyService).toValue(new FancyService())]);

      it('should use set up providers',
         inject([FancyService], (service) => { expect(service.value).toEqual('real value'); }));

      it('should wait until returned promises', injectAsync([FancyService], (service) => {
           return service.getAsyncValue().then(
               (value) => { expect(value).toEqual('async value'); });
         }));

      describe('using beforeEach', () => {
        beforeEach(inject([FancyService],
                          (service) => { service.value = 'value modified in beforeEach'; }));

        it('should use modified providers', inject([FancyService], (service) => {
             expect(service.value).toEqual('value modified in beforeEach');
           }));
      });

      describe('using async beforeEach', () => {
        beforeEach(injectAsync([FancyService], (service) => {
          return service.getAsyncValue().then((value) => { service.value = value; });
        }));

        it('should use asynchronously modified value',
           inject([FancyService], (service) => { expect(service.value).toEqual('async value'); }));
      });
    });
  });

  describe('errors', () => {
    var originalJasmineIt: any;
    var originalJasmineBeforeEach: any;
    var patchJasmineIt = () => {
      originalJasmineIt = jasmine.getEnv().it;
      jasmine.getEnv().it = (description: string, fn) => {
        var done = () => {};
        (<any>done).fail = (err) => { throw new Error(err) };
        fn(done);
        return null;
      }
    };

    var restoreJasmineIt = () => { jasmine.getEnv().it = originalJasmineIt; };

    var patchJasmineBeforeEach = () => {
      originalJasmineBeforeEach = jasmine.getEnv().beforeEach;
      jasmine.getEnv().beforeEach = (fn: any) => {
        var done = () => {};
        (<any>done).fail = (err) => { throw new Error(err) };
        fn(done);
        return null;
      }
    };

    var restoreJasmineBeforeEach =
        () => { jasmine.getEnv().beforeEach = originalJasmineBeforeEach; }

    it('should fail when return was forgotten in it', () => {
      expect(() => {
        patchJasmineIt();
        it('forgets to return a promise', injectAsync([], () => { return true; }));
      })
          .toThrowError('Error: injectAsync was expected to return a promise, but the ' +
                        ' returned value was: true');
      restoreJasmineIt();
    });

    it('should fail when synchronous spec returns promise', () => {
      expect(() => {
        patchJasmineIt();
        it('returns an extra promise', inject([], () => { return Promise.resolve('true'); }));
      }).toThrowError('inject returned a promise. Did you mean to use injectAsync?');
      restoreJasmineIt();
    });

    it('should fail when return was forgotten in beforeEach', () => {
      expect(() => {
        patchJasmineBeforeEach();
        beforeEach(injectAsync([], () => { return true; }));
      })
          .toThrowError('Error: injectAsync was expected to return a promise, but the ' +
                        ' returned value was: true');
      restoreJasmineBeforeEach();
    });

    it('should fail when synchronous beforeEach returns promise', () => {
      expect(() => {
        patchJasmineBeforeEach();
        beforeEach(inject([], () => { return Promise.resolve('true'); }));
      }).toThrowError('inject returned a promise. Did you mean to use injectAsync?');
      restoreJasmineBeforeEach();
    });

    describe('using beforeEachProviders', () => {
      beforeEachProviders(() => [bind(FancyService).toValue(new FancyService())]);

      beforeEach(
          inject([FancyService], (service) => { expect(service.value).toEqual('real value'); }));

      describe('nested beforeEachProviders', () => {

        it('should fail when the injector has already been used', () => {
          expect(() => {
            patchJasmineBeforeEach();
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
       injectAsync([TestComponentBuilder], (tcb: TestComponentBuilder) => {

         return tcb.createAsync(ChildComp).then((componentFixture) => {
           componentFixture.detectChanges();

           expect(componentFixture.debugElement.nativeElement).toHaveText('Original Child');
         });
       }));

    it('should allow changing members of the component',
       injectAsync([TestComponentBuilder], (tcb: TestComponentBuilder) => {

         return tcb.createAsync(MyIfComp).then((componentFixture) => {
           componentFixture.detectChanges();
           expect(componentFixture.debugElement.nativeElement).toHaveText('MyIf()');

           componentFixture.debugElement.componentInstance.showMore = true;
           componentFixture.detectChanges();
           expect(componentFixture.debugElement.nativeElement).toHaveText('MyIf(More)');
         });
       }));

    it('should override a template',
       injectAsync([TestComponentBuilder], (tcb: TestComponentBuilder) => {

         return tcb.overrideTemplate(MockChildComp, '<span>Mock</span>')
             .createAsync(MockChildComp)
             .then((componentFixture) => {
               componentFixture.detectChanges();
               expect(componentFixture.debugElement.nativeElement).toHaveText('Mock');

             });
       }));

    it('should override a view',
       injectAsync([TestComponentBuilder], (tcb: TestComponentBuilder) => {

         return tcb.overrideView(
                       ChildComp,
                       new ViewMetadata({template: '<span>Modified {{childBinding}}</span>'}))
             .createAsync(ChildComp)
             .then((componentFixture) => {
               componentFixture.detectChanges();
               expect(componentFixture.debugElement.nativeElement).toHaveText('Modified Child');

             });
       }));

    it('should override component dependencies',
       injectAsync([TestComponentBuilder], (tcb: TestComponentBuilder) => {

         return tcb.overrideDirective(ParentComp, ChildComp, MockChildComp)
             .createAsync(ParentComp)
             .then((componentFixture) => {
               componentFixture.detectChanges();
               expect(componentFixture.debugElement.nativeElement).toHaveText('Parent(Mock)');

             });
       }));


    it("should override child component's dependencies",
       injectAsync([TestComponentBuilder], (tcb: TestComponentBuilder) => {

         return tcb.overrideDirective(ParentComp, ChildComp, ChildWithChildComp)
             .overrideDirective(ChildWithChildComp, ChildChildComp, MockChildChildComp)
             .createAsync(ParentComp)
             .then((componentFixture) => {
               componentFixture.detectChanges();
               expect(componentFixture.debugElement.nativeElement)
                   .toHaveText('Parent(Original Child(ChildChild Mock))');

             });
       }));

    it('should override a provider',
       injectAsync([TestComponentBuilder], (tcb: TestComponentBuilder) => {

         return tcb.overrideProviders(TestProvidersComp,
                                      [bind(FancyService).toClass(MockFancyService)])
             .createAsync(TestProvidersComp)
             .then((componentFixture) => {
               componentFixture.detectChanges();
               expect(componentFixture.debugElement.nativeElement)
                   .toHaveText('injected value: mocked out value');
             });
       }));


    it('should override a viewProvider',
       injectAsync([TestComponentBuilder], (tcb: TestComponentBuilder) => {

         return tcb.overrideViewProviders(TestViewProvidersComp,
                                          [bind(FancyService).toClass(MockFancyService)])
             .createAsync(TestViewProvidersComp)
             .then((componentFixture) => {
               componentFixture.detectChanges();
               expect(componentFixture.debugElement.nativeElement)
                   .toHaveText('injected value: mocked out value');
             });
       }));
  });
}
