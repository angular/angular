/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, Injectable, NgModule} from '@angular/core';
import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {provideRoutes, Router, RouterModule, ROUTES} from '../index';

@Component({template: '<div>simple standalone</div>'})
export class SimpleStandaloneComponent {}

@Component({template: '<div>not standalone</div>', standalone: false})
export class NotStandaloneComponent {}

@Component({
  template: '<router-outlet></router-outlet>',
  imports: [RouterModule],
})
export class RootCmp {}

describe('standalone in Router API', () => {
  describe('loadChildren => routes', () => {
    it('can navigate to and render standalone component', () =>
      fakeAsync(() => {
        TestBed.configureTestingModule({
          imports: [
            RouterModule.forRoot([
              {
                path: 'lazy',
                component: RootCmp,
                loadChildren: () => [{path: '', component: SimpleStandaloneComponent}],
              },
            ]),
          ],
        });

        const root = TestBed.createComponent(RootCmp);

        const router = TestBed.inject(Router);
        router.navigateByUrl('/lazy');
        advance(root);
        expect(root.nativeElement.innerHTML).toContain('simple standalone');
      }));

    it('throws an error when loadChildren=>routes has a component that is not standalone', () =>
      fakeAsync(() => {
        TestBed.configureTestingModule({
          imports: [
            RouterModule.forRoot([
              {
                path: 'lazy',
                component: RootCmp,
                loadChildren: () => [{path: 'notstandalone', component: NotStandaloneComponent}],
              },
            ]),
          ],
        });

        const root = TestBed.createComponent(RootCmp);

        const router = TestBed.inject(Router);
        router.navigateByUrl('/lazy/notstandalone');
        expect(() => advance(root)).toThrowError(
          /.*lazy\/notstandalone.*component must be standalone/,
        );
      }));
  });
  describe('route providers', () => {
    it('can provide a guard on a route', () =>
      fakeAsync(() => {
        @Injectable()
        class ConfigurableGuard {
          static canActivateValue = false;
          canActivate() {
            return ConfigurableGuard.canActivateValue;
          }
        }

        TestBed.configureTestingModule({
          imports: [
            RouterModule.forRoot([
              {
                path: 'simple',
                providers: [ConfigurableGuard],
                canActivate: [ConfigurableGuard],
                component: SimpleStandaloneComponent,
              },
            ]),
          ],
        });
        const root = TestBed.createComponent(RootCmp);

        ConfigurableGuard.canActivateValue = false;
        const router = TestBed.inject(Router);
        router.navigateByUrl('/simple');
        advance(root);
        expect(root.nativeElement.innerHTML).not.toContain('simple standalone');
        expect(router.url).not.toContain('simple');

        ConfigurableGuard.canActivateValue = true;
        router.navigateByUrl('/simple');
        advance(root);
        expect(root.nativeElement.innerHTML).toContain('simple standalone');
        expect(router.url).toContain('simple');
      }));

    it('can inject provider on a route into component', () =>
      fakeAsync(() => {
        @Injectable()
        class Service {
          value = 'my service';
        }

        @Component({
          template: `{{service.value}}`,
          standalone: false,
        })
        class MyComponent {
          constructor(readonly service: Service) {}
        }

        TestBed.configureTestingModule({
          imports: [
            RouterModule.forRoot([{path: 'home', providers: [Service], component: MyComponent}]),
          ],
          declarations: [MyComponent],
        });
        const root = TestBed.createComponent(RootCmp);

        const router = TestBed.inject(Router);
        router.navigateByUrl('/home');
        advance(root);
        expect(root.nativeElement.innerHTML).toContain('my service');
        expect(router.url).toContain('home');
      }));

    it('can not inject provider in lazy loaded ngModule from component on same level', () =>
      fakeAsync(() => {
        @Injectable()
        class Service {
          value = 'my service';
        }

        @NgModule({providers: [Service]})
        class LazyModule {}

        @Component({
          template: `{{service.value}}`,
          standalone: false,
        })
        class MyComponent {
          constructor(readonly service: Service) {}
        }

        TestBed.configureTestingModule({
          imports: [
            RouterModule.forRoot([
              {path: 'home', loadChildren: () => LazyModule, component: MyComponent},
            ]),
          ],
          declarations: [MyComponent],
        });
        const root = TestBed.createComponent(RootCmp);

        const router = TestBed.inject(Router);
        router.navigateByUrl('/home');
        expect(() => advance(root)).toThrowError();
      }));

    it('component from lazy module can inject provider from parent route', () =>
      fakeAsync(() => {
        @Injectable()
        class Service {
          value = 'my service';
        }

        @Component({
          template: `{{service.value}}`,
          standalone: false,
        })
        class MyComponent {
          constructor(readonly service: Service) {}
        }
        @NgModule({
          providers: [Service],
          declarations: [MyComponent],
          imports: [RouterModule.forChild([{path: '', component: MyComponent}])],
        })
        class LazyModule {}

        TestBed.configureTestingModule({
          imports: [RouterModule.forRoot([{path: 'home', loadChildren: () => LazyModule}])],
        });
        const root = TestBed.createComponent(RootCmp);

        const router = TestBed.inject(Router);
        router.navigateByUrl('/home');
        advance(root);
        expect(root.nativeElement.innerHTML).toContain('my service');
      }));

    it('gets the correct injector for guards and components when combining lazy modules and route providers', () =>
      fakeAsync(() => {
        const canActivateLog: string[] = [];
        abstract class ServiceBase {
          abstract name: string;
          canActivate() {
            canActivateLog.push(this.name);
            return true;
          }
        }

        @Injectable()
        class Service1 extends ServiceBase {
          override name = 'service1';
        }

        @Injectable()
        class Service2 extends ServiceBase {
          override name = 'service2';
        }

        @Injectable()
        class Service3 extends ServiceBase {
          override name = 'service3';
        }

        @Component({
          template: `parent<router-outlet></router-outlet>`,
          standalone: false,
        })
        class ParentCmp {
          constructor(readonly service: ServiceBase) {}
        }
        @Component({
          template: `child`,
          standalone: false,
        })
        class ChildCmp {
          constructor(readonly service: ServiceBase) {}
        }

        @Component({
          template: `child2`,
          standalone: false,
        })
        class ChildCmp2 {
          constructor(readonly service: ServiceBase) {}
        }
        @NgModule({
          providers: [{provide: ServiceBase, useClass: Service2}],
          declarations: [ChildCmp, ChildCmp2],
          imports: [
            RouterModule.forChild([
              {
                path: '',
                // This component and guard should get Service2 since it's provided in this module
                component: ChildCmp,
                canActivate: [ServiceBase],
              },
              {
                path: 'child2',
                providers: [{provide: ServiceBase, useFactory: () => new Service3()}],
                // This component and guard should get Service3 since it's provided on this route
                component: ChildCmp2,
                canActivate: [ServiceBase],
              },
            ]),
          ],
        })
        class LazyModule {}

        TestBed.configureTestingModule({
          imports: [
            RouterModule.forRoot([
              {
                path: 'home',
                // This component and guard should get Service1 since it's provided on this route
                component: ParentCmp,
                canActivate: [ServiceBase],
                providers: [{provide: ServiceBase, useFactory: () => new Service1()}],
                loadChildren: () => LazyModule,
              },
            ]),
          ],
          declarations: [ParentCmp],
        });
        const root = TestBed.createComponent(RootCmp);

        const router = TestBed.inject(Router);
        router.navigateByUrl('/home');
        advance(root);
        expect(canActivateLog).toEqual(['service1', 'service2']);
        expect(
          root.debugElement.query(By.directive(ParentCmp)).componentInstance.service.name,
        ).toEqual('service1');
        expect(
          root.debugElement.query(By.directive(ChildCmp)).componentInstance.service.name,
        ).toEqual('service2');

        router.navigateByUrl('/home/child2');
        advance(root);
        expect(canActivateLog).toEqual(['service1', 'service2', 'service3']);
        expect(
          root.debugElement.query(By.directive(ChildCmp2)).componentInstance.service.name,
        ).toEqual('service3');
      }));
  });

  describe('loadComponent', () => {
    it('does not load component when canActivate returns false', () =>
      fakeAsync(() => {
        const loadComponentSpy = jasmine.createSpy();
        @Injectable({providedIn: 'root'})
        class Guard {
          canActivate() {
            return false;
          }
        }

        TestBed.configureTestingModule({
          imports: [
            RouterModule.forRoot([
              {
                path: 'home',
                loadComponent: loadComponentSpy,
                canActivate: [Guard],
              },
            ]),
          ],
        });

        TestBed.inject(Router).navigateByUrl('/home');
        tick();
        expect(loadComponentSpy).not.toHaveBeenCalled();
      }));

    it('loads and renders lazy component', () =>
      fakeAsync(() => {
        TestBed.configureTestingModule({
          imports: [
            RouterModule.forRoot([
              {
                path: 'home',
                loadComponent: () => SimpleStandaloneComponent,
              },
            ]),
          ],
        });

        const root = TestBed.createComponent(RootCmp);
        TestBed.inject(Router).navigateByUrl('/home');
        advance(root);
        expect(root.nativeElement.innerHTML).toContain('simple standalone');
      }));

    it('throws error when loadComponent is not standalone', () =>
      fakeAsync(() => {
        TestBed.configureTestingModule({
          imports: [
            RouterModule.forRoot([
              {
                path: 'home',
                loadComponent: () => NotStandaloneComponent,
              },
            ]),
          ],
        });

        const root = TestBed.createComponent(RootCmp);
        TestBed.inject(Router).navigateByUrl('/home');
        expect(() => advance(root)).toThrowError(/.*home.*component must be standalone/);
      }));

    it('throws error when loadComponent is used with a module', () =>
      fakeAsync(() => {
        @NgModule()
        class LazyModule {}

        TestBed.configureTestingModule({
          imports: [
            RouterModule.forRoot([
              {
                path: 'home',
                loadComponent: () => LazyModule,
              },
            ]),
          ],
        });

        const root = TestBed.createComponent(RootCmp);
        TestBed.inject(Router).navigateByUrl('/home');
        expect(() => advance(root)).toThrowError(/.*home.*Use 'loadChildren' instead/);
      }));
  });
  describe('default export unwrapping', () => {
    it('should work for loadComponent', async () => {
      TestBed.configureTestingModule({
        imports: [
          RouterModule.forRoot([
            {
              path: 'home',
              loadComponent: () => import('./default_export_component'),
            },
          ]),
        ],
      });

      const root = TestBed.createComponent(RootCmp);
      await TestBed.inject(Router).navigateByUrl('/home');
      root.detectChanges();

      expect(root.nativeElement.innerHTML).toContain('default exported');
    });

    it('should work for loadChildren', async () => {
      TestBed.configureTestingModule({
        imports: [
          RouterModule.forRoot([
            {
              path: 'home',
              loadChildren: () => import('./default_export_routes'),
            },
          ]),
        ],
      });

      const root = TestBed.createComponent(RootCmp);
      await TestBed.inject(Router).navigateByUrl('/home');
      root.detectChanges();

      expect(root.nativeElement.innerHTML).toContain('default exported');
    });
  });
});

describe('provideRoutes', () => {
  it('warns if provideRoutes is used without provideRouter, RouterModule, or RouterModule.forRoot', () => {
    spyOn(console, 'warn');
    TestBed.configureTestingModule({providers: [provideRoutes([])]});
    TestBed.inject(ROUTES);
    expect(console.warn).toHaveBeenCalled();
  });
});

function advance(fixture: ComponentFixture<unknown>) {
  tick();
  fixture.detectChanges();
}
