/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {CommonModule} from '@angular/common';
import {
  Component,
  Directive,
  forwardRef,
  Inject,
  Injectable,
  InjectionToken,
  Injector,
  NgModule,
  Optional,
} from '@angular/core';
import {leaveView, specOnlyIsInstructionStateEmpty} from '@angular/core/src/render3/state';
import {inject, TestBed, waitForAsync} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {expect} from '@angular/platform-browser/testing/src/matchers';

describe('providers', () => {
  describe('inheritance', () => {
    it('should NOT inherit providers', () => {
      const SOME_DIRS = new InjectionToken('someDirs');

      @Directive({
        selector: '[super-dir]',
        providers: [{provide: SOME_DIRS, useClass: SuperDirective, multi: true}],
        standalone: false,
      })
      class SuperDirective {}

      @Directive({
        selector: '[sub-dir]',
        providers: [{provide: SOME_DIRS, useClass: SubDirective, multi: true}],
        standalone: false,
      })
      class SubDirective extends SuperDirective {}

      @Directive({
        selector: '[other-dir]',
        standalone: false,
      })
      class OtherDirective {
        constructor(@Inject(SOME_DIRS) public dirs: any) {}
      }

      @Component({
        selector: 'app-comp',
        template: `<div other-dir sub-dir></div>`,
        standalone: false,
      })
      class App {}

      TestBed.configureTestingModule({
        declarations: [SuperDirective, SubDirective, OtherDirective, App],
      });

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
        ngOnDestroy() {
          logs.push('OnDestroy');
        }
      }

      @Injectable()
      class SubInjectableWithDestroyHook extends SuperInjectableWithDestroyHook {}

      @Component({
        template: '',
        providers: [SubInjectableWithDestroyHook],
        standalone: false,
      })
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
        ngOnDestroy() {
          logs.push('OnDestroy');
        }
      }

      @Component({
        template: '',
        providers: [InjectableWithDestroyHook],
        standalone: false,
      })
      class App {}

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
        ngOnDestroy() {
          logs.push('OnDestroy');
        }
      }

      @Component({
        selector: 'my-cmp',
        template: '',
        standalone: false,
      })
      class MyComponent {
        constructor(foo: InjectableWithDestroyHook) {}
      }

      @Component({
        template: `
          <my-cmp></my-cmp>
          <my-cmp></my-cmp>
        `,
        providers: [InjectableWithDestroyHook],
        standalone: false,
      })
      class App {}

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
        ngOnDestroy() {
          logs.push('OnDestroy');
        }
      }

      @Component({
        template: '',
        providers: [{provide: InjectableWithDestroyHook, useClass: InjectableWithDestroyHook}],
        standalone: false,
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

    it('should only call ngOnDestroy of value when providing via useClass', () => {
      const logs: string[] = [];

      @Injectable()
      class InjectableWithDestroyHookToken {
        ngOnDestroy() {
          logs.push('OnDestroy Token');
        }
      }

      @Injectable()
      class InjectableWithDestroyHookValue {
        ngOnDestroy() {
          logs.push('OnDestroy Value');
        }
      }

      @Component({
        template: '',
        providers: [
          {provide: InjectableWithDestroyHookToken, useClass: InjectableWithDestroyHookValue},
        ],
        standalone: false,
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
        ngOnDestroy() {
          logs.push('OnDestroy Token');
        }
      }

      @Injectable()
      class InjectableWithDestroyHookExisting {
        ngOnDestroy() {
          logs.push('OnDestroy Existing');
        }
      }

      @Component({
        template: '',
        providers: [
          InjectableWithDestroyHookExisting,
          {provide: InjectableWithDestroyHookToken, useExisting: InjectableWithDestroyHookExisting},
        ],
        standalone: false,
      })
      class App {
        constructor(
          foo1: InjectableWithDestroyHookExisting,
          foo2: InjectableWithDestroyHookToken,
        ) {}
      }

      TestBed.configureTestingModule({declarations: [App]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      fixture.destroy();

      expect(logs).toEqual(['OnDestroy Existing']);
    });

    it('should invoke ngOnDestroy with the correct context when providing a type provider multiple times on the same node', () => {
      const resolvedServices: (DestroyService | undefined)[] = [];
      const destroyContexts: (DestroyService | undefined)[] = [];
      let parentService: DestroyService | undefined;
      let childService: DestroyService | undefined;

      @Injectable()
      class DestroyService {
        constructor() {
          resolvedServices.push(this);
        }
        ngOnDestroy() {
          destroyContexts.push(this);
        }
      }

      @Directive({
        selector: '[dir-one]',
        providers: [DestroyService],
        standalone: false,
      })
      class DirOne {
        constructor(service: DestroyService) {
          childService = service;
        }
      }

      @Directive({
        selector: '[dir-two]',
        providers: [DestroyService],
        standalone: false,
      })
      class DirTwo {
        constructor(service: DestroyService) {
          childService = service;
        }
      }

      @Component({
        template: '<div dir-one dir-two></div>',
        providers: [DestroyService],
        standalone: false,
      })
      class App {
        constructor(service: DestroyService) {
          parentService = service;
        }
      }

      TestBed.configureTestingModule({declarations: [App, DirOne, DirTwo]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      fixture.destroy();

      expect(parentService).toBeDefined();
      expect(childService).toBeDefined();
      expect(parentService).not.toBe(childService);
      expect(resolvedServices).toEqual([parentService, childService]);
      expect(destroyContexts).toEqual([parentService, childService]);
    });

    it('should invoke ngOnDestroy with the correct context when providing a class provider multiple times on the same node', () => {
      const resolvedServices: (DestroyService | undefined)[] = [];
      const destroyContexts: (DestroyService | undefined)[] = [];
      const token = new InjectionToken<any>('token');
      let parentService: DestroyService | undefined;
      let childService: DestroyService | undefined;

      @Injectable()
      class DestroyService {
        constructor() {
          resolvedServices.push(this);
        }
        ngOnDestroy() {
          destroyContexts.push(this);
        }
      }

      @Directive({
        selector: '[dir-one]',
        providers: [{provide: token, useClass: DestroyService}],
        standalone: false,
      })
      class DirOne {
        constructor(@Inject(token) service: DestroyService) {
          childService = service;
        }
      }

      @Directive({
        selector: '[dir-two]',
        providers: [{provide: token, useClass: DestroyService}],
        standalone: false,
      })
      class DirTwo {
        constructor(@Inject(token) service: DestroyService) {
          childService = service;
        }
      }

      @Component({
        template: '<div dir-one dir-two></div>',
        providers: [{provide: token, useClass: DestroyService}],
        standalone: false,
      })
      class App {
        constructor(@Inject(token) service: DestroyService) {
          parentService = service;
        }
      }

      TestBed.configureTestingModule({declarations: [App, DirOne, DirTwo]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      fixture.destroy();

      expect(parentService).toBeDefined();
      expect(childService).toBeDefined();
      expect(parentService).not.toBe(childService);
      expect(resolvedServices).toEqual([parentService, childService]);
      expect(destroyContexts).toEqual([parentService, childService]);
    });

    describe('ngOnDestroy on multi providers', () => {
      it('should invoke ngOnDestroy on multi providers with the correct context', () => {
        const destroyCalls: any[] = [];
        const SERVICES = new InjectionToken<any>('SERVICES');

        @Injectable()
        class DestroyService {
          ngOnDestroy() {
            destroyCalls.push(this);
          }
        }

        @Injectable()
        class OtherDestroyService {
          ngOnDestroy() {
            destroyCalls.push(this);
          }
        }

        @Component({
          template: '<div></div>',
          providers: [
            {provide: SERVICES, useClass: DestroyService, multi: true},
            {provide: SERVICES, useClass: OtherDestroyService, multi: true},
          ],
          standalone: false,
        })
        class App {
          constructor(@Inject(SERVICES) s: any) {}
        }

        TestBed.configureTestingModule({declarations: [App]});
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();
        fixture.destroy();

        expect(destroyCalls).toEqual([
          jasmine.any(DestroyService),
          jasmine.any(OtherDestroyService),
        ]);
      });

      it('should invoke destroy hooks on multi providers with the correct context, if only some have a destroy hook', () => {
        const destroyCalls: any[] = [];
        const SERVICES = new InjectionToken<any>('SERVICES');

        @Injectable()
        class Service1 {}

        @Injectable()
        class Service2 {
          ngOnDestroy() {
            destroyCalls.push(this);
          }
        }

        @Injectable()
        class Service3 {}

        @Injectable()
        class Service4 {
          ngOnDestroy() {
            destroyCalls.push(this);
          }
        }

        @Component({
          template: '<div></div>',
          providers: [
            {provide: SERVICES, useClass: Service1, multi: true},
            {provide: SERVICES, useClass: Service2, multi: true},
            {provide: SERVICES, useClass: Service3, multi: true},
            {provide: SERVICES, useClass: Service4, multi: true},
          ],
          standalone: false,
        })
        class App {
          constructor(@Inject(SERVICES) s: any) {}
        }

        TestBed.configureTestingModule({declarations: [App]});
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();
        fixture.destroy();

        expect(destroyCalls).toEqual([jasmine.any(Service2), jasmine.any(Service4)]);
      });

      it('should not invoke ngOnDestroy on multi providers created via useFactory', () => {
        let destroyCalls = 0;
        const SERVICES = new InjectionToken<any>('SERVICES');

        @Injectable()
        class DestroyService {
          ngOnDestroy() {
            destroyCalls++;
          }
        }

        @Injectable()
        class OtherDestroyService {
          ngOnDestroy() {
            destroyCalls++;
          }
        }

        @Component({
          template: '<div></div>',
          providers: [
            {provide: SERVICES, useFactory: () => new DestroyService(), multi: true},
            {provide: SERVICES, useFactory: () => new OtherDestroyService(), multi: true},
          ],
          standalone: false,
        })
        class App {
          constructor(@Inject(SERVICES) s: any) {}
        }

        TestBed.configureTestingModule({declarations: [App]});
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();
        fixture.destroy();

        expect(destroyCalls).toBe(0);
      });
    });

    it('should call ngOnDestroy if host component is destroyed', () => {
      const logs: string[] = [];

      @Injectable()
      class InjectableWithDestroyHookToken {
        ngOnDestroy() {
          logs.push('OnDestroy Token');
        }
      }

      @Component({
        selector: 'comp-with-provider',
        template: '',
        providers: [InjectableWithDestroyHookToken],
        standalone: false,
      })
      class CompWithProvider {
        constructor(token: InjectableWithDestroyHookToken) {}
      }

      @Component({
        selector: 'app',
        template: '<comp-with-provider *ngIf="condition"></comp-with-provider>',
        standalone: false,
      })
      class App {
        condition = true;
      }

      TestBed.configureTestingModule({
        declarations: [App, CompWithProvider],
        imports: [CommonModule],
      });

      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      fixture.componentInstance.condition = false;
      fixture.detectChanges();

      expect(logs).toEqual(['OnDestroy Token']);
    });
  });

  describe('components and directives', () => {
    class MyService {
      value = 'some value';
    }

    @Component({
      selector: 'my-comp',
      template: ``,
      standalone: false,
    })
    class MyComp {
      constructor(public svc: MyService) {}
    }

    @Directive({
      selector: '[some-dir]',
      standalone: false,
    })
    class MyDir {
      constructor(public svc: MyService) {}
    }

    it('should support providing components in tests without @Injectable', () => {
      @Component({
        selector: 'test-comp',
        template: '<my-comp></my-comp>',
        standalone: false,
      })
      class TestComp {}

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
      @Component({
        selector: 'test-comp',
        template: '<div some-dir></div>',
        standalone: false,
      })
      class TestComp {}

      TestBed.configureTestingModule({
        declarations: [TestComp, MyDir],
        // providing MyDir is unnecessary but it shouldn't throw
        providers: [MyDir, MyService],
      });

      const fixture = TestBed.createComponent(TestComp);
      const myCompInstance = fixture.debugElement.query(By.css('div')).injector.get(MyDir);
      expect(myCompInstance.svc.value).toEqual('some value');
    });

    // TODO(alxhub): find a way to isolate this test from running in a dirty
    // environment where a current LView exists (probably from some other test
    // bootstrapping and then not cleaning up).
    xdescribe('injection without bootstrapping', () => {
      beforeEach(() => {
        // Maybe something like this?
        while (!specOnlyIsInstructionStateEmpty()) {
          leaveView();
        }
        TestBed.configureTestingModule({declarations: [MyComp], providers: [MyComp, MyService]});
      });

      it('should support injecting without bootstrapping', waitForAsync(
        inject([MyComp, MyService], (comp: MyComp, service: MyService) => {
          expect(comp.svc.value).toEqual('some value');
        }),
      ));
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

      @Component({
        selector: 'app-comp',
        template: ``,
        standalone: false,
      })
      class AppComp {
        constructor(public myService: MyService) {}
      }

      @NgModule({
        providers: [
          OtherService,
          {
            provide: MyService,
            useFactory: (dep: {value: string}) => new MyService(dep),
            deps: [forwardRef(() => OtherService)],
          },
        ],
        declarations: [AppComp],
      })
      class MyModule {}

      TestBed.configureTestingModule({imports: [MyModule]});

      const fixture = TestBed.createComponent(AppComp);
      expect(fixture.componentInstance.myService.dep.value).toBe('one');
    });

    it('should support forward refs in useClass when impl version is also provided', () => {
      @Injectable({providedIn: 'root', useClass: forwardRef(() => SomeProviderImpl)})
      abstract class SomeProvider {}

      @Injectable()
      class SomeProviderImpl extends SomeProvider {}

      @Component({
        selector: 'my-app',
        template: '',
        standalone: false,
      })
      class App {
        constructor(public foo: SomeProvider) {}
      }

      // We don't configure the `SomeProvider` in the TestingModule so that it uses the
      // tree-shakable provider given in the `@Injectable` decorator above, which makes use of the
      // `forwardRef()`.
      TestBed.configureTestingModule({declarations: [App]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(fixture.componentInstance.foo).toBeInstanceOf(SomeProviderImpl);
    });

    it('should support forward refs in useClass when token is provided', () => {
      @Injectable({providedIn: 'root'})
      abstract class SomeProvider {}

      @Injectable()
      class SomeProviderImpl extends SomeProvider {}

      @Component({
        selector: 'my-app',
        template: '',
        standalone: false,
      })
      class App {
        constructor(public foo: SomeProvider) {}
      }

      TestBed.configureTestingModule({
        declarations: [App],
        providers: [{provide: SomeProvider, useClass: forwardRef(() => SomeProviderImpl)}],
      });
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(fixture.componentInstance.foo).toBeInstanceOf(SomeProviderImpl);
    });
  });

  describe('flags', () => {
    class MyService {
      constructor(public value: OtherService | null) {}
    }

    class OtherService {}

    it('should support Optional flag in deps', () => {
      const injector = Injector.create({
        providers: [{provide: MyService, deps: [[new Optional(), OtherService]]}],
      });

      expect(injector.get(MyService).value).toBe(null);
    });

    it('should support Optional flag in deps without instantiating it', () => {
      const injector = Injector.create({
        providers: [{provide: MyService, deps: [[Optional, OtherService]]}],
      });

      expect(injector.get(MyService).value).toBe(null);
    });
  });

  describe('view providers', () => {
    it('should have access to viewProviders within the same component', () => {
      @Component({
        selector: 'comp',
        template: '{{s}}-{{n}}',
        providers: [{provide: Number, useValue: 1, multi: true}],
        viewProviders: [
          {provide: String, useValue: 'bar'},
          {provide: Number, useValue: 2, multi: true},
        ],
        standalone: false,
      })
      class Comp {
        constructor(
          private s: String,
          private n: Number,
        ) {}
      }

      TestBed.configureTestingModule({declarations: [Comp]});

      const fixture = TestBed.createComponent(Comp);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toBe('bar-1,2');
    });

    it('should have access to viewProviders of the host component', () => {
      @Component({
        selector: 'repeated',
        template: '[{{s}}-{{n}}]',
        standalone: false,
      })
      class Repeated {
        constructor(
          private s: String,
          private n: Number,
        ) {}
      }

      @Component({
        template: `
          <div>
            <ng-container *ngFor="let item of items">
              <repeated></repeated>
            </ng-container>
          </div>
        `,
        providers: [{provide: Number, useValue: 1, multi: true}],
        viewProviders: [
          {provide: String, useValue: 'foo'},
          {provide: Number, useValue: 2, multi: true},
        ],
        standalone: false,
      })
      class ComponentWithProviders {
        items = [1, 2, 3];
      }

      TestBed.configureTestingModule({
        declarations: [ComponentWithProviders, Repeated],
        imports: [CommonModule],
      });

      const fixture = TestBed.createComponent(ComponentWithProviders);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('[foo-1,2][foo-1,2][foo-1,2]');
    });
  });
});
