/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Component,
  inject,
  Injectable,
  InjectionToken,
  Injector,
  NgModule,
  provideEnvironmentInitializer,
  runInInjectionContext,
} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {timeout} from '@angular/private/testing';
import {Route, Router, RouterModule} from '../index';

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
    it('can navigate to and render standalone component', async () => {
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
      await advanceAsync(root);
      expect(root.nativeElement.innerHTML).toContain('simple standalone');
    });

    it('throws an error when loadChildren=>routes has a component that is not standalone', async () => {
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
      await expectAsync(router.navigateByUrl('/lazy/notstandalone')).toBeRejectedWithError(
        /.*lazy\/notstandalone.*component must be standalone/,
      );
    });
  });
  describe('route providers', () => {
    it('can provide a guard on a route', async () => {
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
      await advanceAsync(root);
      expect(root.nativeElement.innerHTML).not.toContain('simple standalone');
      expect(router.url).not.toContain('simple');

      ConfigurableGuard.canActivateValue = true;
      router.navigateByUrl('/simple');
      await advanceAsync(root);
      expect(root.nativeElement.innerHTML).toContain('simple standalone');
      expect(router.url).toContain('simple');
    });

    it('can inject provider on a route into component', async () => {
      @Injectable()
      class Service {
        value = 'my service';
      }

      @Component({
        template: `{{ service.value }}`,
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
      await advanceAsync(root);
      expect(root.nativeElement.innerHTML).toContain('my service');
      expect(router.url).toContain('home');
    });

    it('can not inject provider in lazy loaded ngModule from component on same level', async () => {
      @Injectable()
      class Service {
        value = 'my service';
      }

      @NgModule({providers: [Service]})
      class LazyModule {}

      @Component({
        template: `{{ service.value }}`,
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
      const fixture = TestBed.createComponent(RootCmp);

      const router = TestBed.inject(Router);
      await router.navigateByUrl('/home');
      expect(fixture.detectChanges).toThrow();
    });

    it('component from lazy module can inject provider from parent route', async () => {
      @Injectable()
      class Service {
        value = 'my service';
      }

      @Component({
        template: `{{ service.value }}`,
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
      await advanceAsync(root);
      expect(root.nativeElement.innerHTML).toContain('my service');
    });

    it('gets the correct injector for guards and components when combining lazy modules and route providers', async () => {
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
      await advanceAsync(root);
      expect(canActivateLog).toEqual(['service1', 'service2']);
      expect(
        root.debugElement.query(By.directive(ParentCmp)).componentInstance.service.name,
      ).toEqual('service1');
      expect(
        root.debugElement.query(By.directive(ChildCmp)).componentInstance.service.name,
      ).toEqual('service2');

      router.navigateByUrl('/home/child2');
      await advanceAsync(root);
      expect(canActivateLog).toEqual(['service1', 'service2', 'service3']);
      expect(
        root.debugElement.query(By.directive(ChildCmp2)).componentInstance.service.name,
      ).toEqual('service3');
    });
  });

  describe('loadComponent', () => {
    it('does not load component when canActivate returns false', async () => {
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
      await timeout();
      expect(loadComponentSpy).not.toHaveBeenCalled();
    });

    it('loads and renders lazy component', async () => {
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
      await advanceAsync(root);
      expect(root.nativeElement.innerHTML).toContain('simple standalone');
    });

    it('throws error when loadComponent is not standalone', async () => {
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

      await expectAsync(TestBed.inject(Router).navigateByUrl('/home')).toBeRejectedWithError(
        /.*home.*component must be standalone/,
      );
    });

    it('throws error when loadComponent is used with a module', async () => {
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

      await expectAsync(TestBed.inject(Router).navigateByUrl('/home')).toBeRejectedWithError(
        /.*home.*Use 'loadChildren' instead/,
      );
    });
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

  describe('injection context for loadComponent/loadChildren', () => {
    it('should run loadComponent in root environment injector, not route injector', async () => {
      @Injectable()
      class RouteService {
        value = 'route-service';
      }
      @Injectable({providedIn: 'root'})
      class RootService {
        value = 'root-service';
      }
      @Component({
        template: ``,
      })
      class Cmp {}
      let injectedRouteService: RouteService | null = null;
      let injectedRootService: RootService | null = null;
      TestBed.configureTestingModule({
        imports: [
          RouterModule.forRoot([
            {
              path: 'with-provider',
              providers: [RouteService],
              loadComponent: () => {
                injectedRouteService = inject(RouteService, {optional: true});
                injectedRootService = inject(RootService);
                return Cmp;
              },
            },
          ]),
        ],
      });
      await TestBed.inject(Router).navigateByUrl('/with-provider');
      expect(TestBed.inject(Router).url).toContain('with-provider');
      expect(injectedRouteService).toBeNull();
      expect((injectedRootService as RootService | null)?.value).toBe('root-service');
    });

    it('should run loadChildren in root environment injector, not route injector', async () => {
      @Injectable()
      class RouteService {
        value = 'route-service';
      }
      @Injectable({providedIn: 'root'})
      class RootService {
        value = 'root-service';
      }
      let injectedRouteService: RouteService | null = null;
      let injectedRootService: RootService | null = null;
      TestBed.configureTestingModule({
        imports: [
          RouterModule.forRoot([
            {
              path: 'with-provider',
              providers: [RouteService],
              loadChildren: () => {
                injectedRouteService = inject(RouteService, {optional: true});
                injectedRootService = inject(RootService);
                return [];
              },
            },
          ]),
        ],
      });
      await TestBed.inject(Router).navigateByUrl('/with-provider');
      expect(TestBed.inject(Router).url).toContain('with-provider');
      expect(injectedRouteService).toBeNull();
      expect((injectedRootService as RootService | null)?.value).toBe('root-service');
    });

    it('should use the root injector, not parent route injector, in loadComponent', async () => {
      const TOKEN = new InjectionToken<string>('token');
      @Component({
        template: ``,
      })
      class Cmp {}
      let injectedToken: string | null = null;
      TestBed.configureTestingModule({
        imports: [
          RouterModule.forRoot([
            {
              path: 'parent',
              providers: [{provide: TOKEN, useValue: 'parent'}],
              children: [
                {
                  path: 'child',
                  providers: [{provide: TOKEN, useValue: 'child'}],
                  loadComponent: () => {
                    injectedToken = inject(TOKEN, {optional: true});
                    return Cmp;
                  },
                },
              ],
            },
          ]),
        ],
      });
      await TestBed.inject(Router).navigateByUrl('/parent/child');
      expect(TestBed.inject(Router).url).toContain('parent/child');
      expect(injectedToken).toBeNull();
    });

    it('should use the root injector, not parent route injector, in loadChildren', async () => {
      const TOKEN = new InjectionToken<string>('token');
      @Component({
        template: ``,
      })
      class Cmp {}
      let injectedToken: string | null = null;
      TestBed.configureTestingModule({
        imports: [
          RouterModule.forRoot([
            {
              path: 'parent',
              providers: [{provide: TOKEN, useValue: 'parent'}],
              children: [
                {
                  path: 'child',
                  providers: [{provide: TOKEN, useValue: 'child'}],
                  loadChildren: () => {
                    injectedToken = inject(TOKEN, {optional: true});
                    return [{path: '', component: Cmp}];
                  },
                },
              ],
            },
          ]),
        ],
      });
      await TestBed.inject(Router).navigateByUrl('/parent/child');
      expect(TestBed.inject(Router).url).toContain('parent/child');
      expect(injectedToken).toBeNull();
    });

    it('can access route providers in loadComponent by explicitly using provideEnvironmentInitializer and runInInjectionContext', async () => {
      @Injectable()
      class RouteService {
        value = 'route-service';
      }
      @Component({
        template: ``,
      })
      class Cmp {}

      function loadComponentInInjectionContext({
        path,
        loadComponent,
      }: Pick<Route, 'path'> & Required<Pick<Route, 'loadComponent'>>): Route {
        let injector: Injector;
        return {
          path,
          providers: [
            RouteService,
            provideEnvironmentInitializer(() => {
              injector = inject(Injector);
            }),
          ],
          loadComponent: () => runInInjectionContext(injector, loadComponent),
        };
      }

      let injectedValue: string | null = null;
      TestBed.configureTestingModule({
        imports: [
          RouterModule.forRoot([
            loadComponentInInjectionContext({
              path: 'with-provider',
              loadComponent: () => {
                injectedValue = inject(RouteService).value;
                return Cmp;
              },
            }),
          ]),
        ],
      });
      await TestBed.inject(Router).navigateByUrl('/with-provider');
      expect(TestBed.inject(Router).url).toContain('with-provider');
      expect(injectedValue as string | null).toBe('route-service');
    });
  });
});

async function advanceAsync(fixture: ComponentFixture<unknown>) {
  await timeout();
  fixture.detectChanges();
}
