/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Directive, Inject, Injectable, InjectionToken, Injector, NgModule, Optional, forwardRef} from '@angular/core';
import {TestBed, async, inject} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {expect} from '@angular/platform-browser/testing/src/matchers';
import {onlyInIvy} from '@angular/private/testing';

describe('providers', () => {

  describe('inheritance', () => {

    it('should NOT inherit providers', () => {
      const SOME_DIRS = new InjectionToken('someDirs');

      @Directive({
        selector: '[super-dir]',
        providers: [{provide: SOME_DIRS, useClass: SuperDirective, multi: true}]
      })
      class SuperDirective {
      }

      @Directive({
        selector: '[sub-dir]',
        providers: [{provide: SOME_DIRS, useClass: SubDirective, multi: true}]
      })
      class SubDirective extends SuperDirective {
      }

      @Directive({selector: '[other-dir]'})
      class OtherDirective {
        constructor(@Inject(SOME_DIRS) public dirs: any) {}
      }

      @Component({selector: 'app-comp', template: `<div other-dir sub-dir></div>`})
      class App {
      }

      TestBed.configureTestingModule(
          {declarations: [SuperDirective, SubDirective, OtherDirective, App]});

      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      const otherDir = fixture.debugElement.query(By.css('div')).injector.get(OtherDirective);
      expect(otherDir.dirs.length).toEqual(1);
      expect(otherDir.dirs[0] instanceof SubDirective).toBe(true);
    });

  });

  describe('lifecycles', () => {
    it('should inherit ngOnDestroy hooks on providers', () => {
      const logs: string[] = [];

      @Injectable()
      class SuperInjectableWithDestroyHook {
        ngOnDestroy() { logs.push('OnDestroy'); }
      }

      @Injectable()
      class SubInjectableWithDestroyHook extends SuperInjectableWithDestroyHook {
      }

      @Component({template: '', providers: [SubInjectableWithDestroyHook]})
      class App {
        constructor(foo: SubInjectableWithDestroyHook) {}
      }

      TestBed.configureTestingModule({declarations: [App]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      fixture.destroy();

      expect(logs).toEqual(['OnDestroy']);
    });

    it('should not call ngOnDestroy for providers that have not been requested', () => {
      const logs: string[] = [];

      @Injectable()
      class InjectableWithDestroyHook {
        ngOnDestroy() { logs.push('OnDestroy'); }
      }

      @Component({template: '', providers: [InjectableWithDestroyHook]})
      class App {
      }

      TestBed.configureTestingModule({declarations: [App]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      fixture.destroy();

      expect(logs).toEqual([]);
    });

    it('should only call ngOnDestroy once for multiple instances', () => {
      const logs: string[] = [];

      @Injectable()
      class InjectableWithDestroyHook {
        ngOnDestroy() { logs.push('OnDestroy'); }
      }

      @Component({selector: 'my-cmp', template: ''})
      class MyComponent {
        constructor(foo: InjectableWithDestroyHook) {}
      }

      @Component({
        template: `
          <my-cmp></my-cmp>
          <my-cmp></my-cmp>
        `,
        providers: [InjectableWithDestroyHook]
      })
      class App {
      }

      TestBed.configureTestingModule({declarations: [App, MyComponent]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      fixture.destroy();

      expect(logs).toEqual(['OnDestroy']);
    });

    it('should call ngOnDestroy when providing same token via useClass', () => {
      const logs: string[] = [];

      @Injectable()
      class InjectableWithDestroyHook {
        ngOnDestroy() { logs.push('OnDestroy'); }
      }

      @Component({
        template: '',
        providers: [{provide: InjectableWithDestroyHook, useClass: InjectableWithDestroyHook}]
      })
      class App {
        constructor(foo: InjectableWithDestroyHook) {}
      }

      TestBed.configureTestingModule({declarations: [App]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      fixture.destroy();

      expect(logs).toEqual(['OnDestroy']);
    });

    onlyInIvy('Destroy hook of useClass provider is invoked correctly')
        .it('should only call ngOnDestroy of value when providing via useClass', () => {
          const logs: string[] = [];

          @Injectable()
          class InjectableWithDestroyHookToken {
            ngOnDestroy() { logs.push('OnDestroy Token'); }
          }

          @Injectable()
          class InjectableWithDestroyHookValue {
            ngOnDestroy() { logs.push('OnDestroy Value'); }
          }

          @Component({
            template: '',
            providers: [
              {provide: InjectableWithDestroyHookToken, useClass: InjectableWithDestroyHookValue}
            ]
          })
          class App {
            constructor(foo: InjectableWithDestroyHookToken) {}
          }

          TestBed.configureTestingModule({declarations: [App]});
          const fixture = TestBed.createComponent(App);
          fixture.detectChanges();
          fixture.destroy();

          expect(logs).toEqual(['OnDestroy Value']);
        });

    it('should only call ngOnDestroy of value when providing via useExisting', () => {
      const logs: string[] = [];

      @Injectable()
      class InjectableWithDestroyHookToken {
        ngOnDestroy() { logs.push('OnDestroy Token'); }
      }

      @Injectable()
      class InjectableWithDestroyHookExisting {
        ngOnDestroy() { logs.push('OnDestroy Existing'); }
      }

      @Component({
        template: '',
        providers: [
          InjectableWithDestroyHookExisting, {
            provide: InjectableWithDestroyHookToken,
            useExisting: InjectableWithDestroyHookExisting
          }
        ]
      })
      class App {
        constructor(foo1: InjectableWithDestroyHookExisting, foo2: InjectableWithDestroyHookToken) {
        }
      }

      TestBed.configureTestingModule({declarations: [App]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      fixture.destroy();

      expect(logs).toEqual(['OnDestroy Existing']);
    });

  });

  describe('components and directives', () => {

    class MyService {
      value = 'some value';
    }

    @Component({selector: 'my-comp', template: ``})
    class MyComp {
      constructor(public svc: MyService) {}
    }

    @Directive({selector: '[some-dir]'})
    class MyDir {
      constructor(public svc: MyService) {}
    }

    it('should support providing components in tests without @Injectable', () => {
      @Component({selector: 'test-comp', template: '<my-comp></my-comp>'})
      class TestComp {
      }

      TestBed.configureTestingModule({
        declarations: [TestComp, MyComp],
        // providing MyComp is unnecessary but it shouldn't throw
        providers: [MyComp, MyService],
      });

      const fixture = TestBed.createComponent(TestComp);
      const myCompInstance = fixture.debugElement.query(By.css('my-comp')).injector.get(MyComp);
      expect(myCompInstance.svc.value).toEqual('some value');
    });

    it('should support providing directives in tests without @Injectable', () => {
      @Component({selector: 'test-comp', template: '<div some-dir></div>'})
      class TestComp {
      }

      TestBed.configureTestingModule({
        declarations: [TestComp, MyDir],
        // providing MyDir is unnecessary but it shouldn't throw
        providers: [MyDir, MyService],
      });

      const fixture = TestBed.createComponent(TestComp);
      const myCompInstance = fixture.debugElement.query(By.css('div')).injector.get(MyDir);
      expect(myCompInstance.svc.value).toEqual('some value');
    });

    describe('injection without bootstrapping', () => {
      beforeEach(() => {
        TestBed.configureTestingModule({declarations: [MyComp], providers: [MyComp, MyService]});
      });

      it('should support injecting without bootstrapping',
         async(inject([MyComp, MyService], (comp: MyComp, service: MyService) => {
           expect(comp.svc.value).toEqual('some value');
         })));
    });
  });

  describe('forward refs', () => {

    it('should support forward refs in provider deps', () => {
      class MyService {
        constructor(public dep: {value: string}) {}
      }

      class OtherService {
        value = 'one';
      }

      @Component({selector: 'app-comp', template: ``})
      class AppComp {
        constructor(public myService: MyService) {}
      }

      @NgModule({
        providers: [
          OtherService, {
            provide: MyService,
            useFactory: (dep: {value: string}) => new MyService(dep),
            deps: [forwardRef(() => OtherService)]
          }
        ],
        declarations: [AppComp]
      })
      class MyModule {
      }

      TestBed.configureTestingModule({imports: [MyModule]});

      const fixture = TestBed.createComponent(AppComp);
      expect(fixture.componentInstance.myService.dep.value).toBe('one');
    });

    it('should support forward refs in useClass when impl version is also provided', () => {

      @Injectable({providedIn: 'root', useClass: forwardRef(() => SomeProviderImpl)})
      abstract class SomeProvider {
      }

      @Injectable()
      class SomeProviderImpl extends SomeProvider {
      }

      @Component({selector: 'my-app', template: ''})
      class App {
        constructor(public foo: SomeProvider) {}
      }

      TestBed.configureTestingModule(
          {declarations: [App], providers: [{provide: SomeProvider, useClass: SomeProviderImpl}]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(fixture.componentInstance.foo).toBeAnInstanceOf(SomeProviderImpl);
    });


    onlyInIvy('VE bug (see FW-1454)')
        .it('should support forward refs in useClass when token is provided', () => {

          @Injectable({providedIn: 'root', useClass: forwardRef(() => SomeProviderImpl)})
          abstract class SomeProvider {
          }

          @Injectable()
          class SomeProviderImpl extends SomeProvider {
          }

          @Component({selector: 'my-app', template: ''})
          class App {
            constructor(public foo: SomeProvider) {}
          }

          TestBed.configureTestingModule(
              {declarations: [App], providers: [{provide: SomeProvider, useClass: SomeProvider}]});
          const fixture = TestBed.createComponent(App);
          fixture.detectChanges();

          expect(fixture.componentInstance.foo).toBeAnInstanceOf(SomeProviderImpl);
        });

  });

  describe('flags', () => {

    class MyService {
      constructor(public value: OtherService|null) {}
    }

    class OtherService {}

    it('should support Optional flag in deps', () => {
      const injector =
          Injector.create([{provide: MyService, deps: [[new Optional(), OtherService]]}]);

      expect(injector.get(MyService).value).toBe(null);
    });

    it('should support Optional flag in deps without instantiating it', () => {
      const injector = Injector.create([{provide: MyService, deps: [[Optional, OtherService]]}]);

      expect(injector.get(MyService).value).toBe(null);
    });
  });
});
