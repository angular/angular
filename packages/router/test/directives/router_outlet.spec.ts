/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {CommonModule, NgForOf} from '@angular/common';
import {
  Component,
  effect,
  inject,
  input,
  Input,
  model,
  NgModule,
  resource,
  signal,
  Type,
} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {timeout, useAutoTick} from '@angular/private/testing';
import {EnvironmentProviders, InjectionToken} from '../../../core/src/di';
import {
  provideRouter as internalProvideRouter,
  nonBlocking,
  RedirectCommand,
  Route,
  Router,
  ROUTER_OUTLET_DATA,
  RouterFeatures,
  RouterModule,
  RouterOutlet,
  withComponentInputBinding,
  withErrorBoundaries,
  withRouterResources,
} from '../../index';
import {INPUT_BINDER} from '../../src/directives/router_outlet';
import {RouterTestingHarness} from '../../testing';

export function provideRouter(
  routes: Route[],
  ...features: RouterFeatures[]
): EnvironmentProviders {
  return internalProvideRouter(routes, ...features);
}
describe('router outlet name', () => {
  useAutoTick();
  it('should support name binding', async () => {
    @Component({
      template: '<router-outlet [name]="name"></router-outlet>',
      imports: [RouterOutlet],
    })
    class RootCmp {
      name = 'popup';
    }

    @Component({
      template: 'popup component',
    })
    class PopupCmp {}

    TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([{path: '', outlet: 'popup', component: PopupCmp}])],
    });
    const router = TestBed.inject(Router);
    const fixture = await createRoot(router, RootCmp);
    expect(fixture.nativeElement.innerHTML).toContain('popup component');
  });

  it('should be able to change the name of the outlet', async () => {
    @Component({
      template: '<router-outlet [name]="name()"></router-outlet>',
      imports: [RouterOutlet],
    })
    class RootCmp {
      name = signal('');
    }

    @Component({
      template: 'hello world',
    })
    class GreetingCmp {}

    @Component({
      template: 'goodbye cruel world',
    })
    class FarewellCmp {}

    TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([
          {path: '', outlet: 'greeting', component: GreetingCmp},
          {path: '', outlet: 'farewell', component: FarewellCmp},
        ]),
      ],
    });
    const router = TestBed.inject(Router);
    const fixture = await createRoot(router, RootCmp);

    expect(fixture.nativeElement.innerHTML).not.toContain('goodbye');
    expect(fixture.nativeElement.innerHTML).not.toContain('hello');

    fixture.componentInstance.name.set('greeting');
    await advance(fixture);
    expect(fixture.nativeElement.innerHTML).toContain('hello');
    expect(fixture.nativeElement.innerHTML).not.toContain('goodbye');

    fixture.componentInstance.name.set('farewell');
    await advance(fixture);
    expect(fixture.nativeElement.innerHTML).toContain('goodbye');
    expect(fixture.nativeElement.innerHTML).not.toContain('hello');
  });

  it('should support outlets in ngFor', async () => {
    @Component({
      template: `
        <div *ngFor="let outlet of outlets()">
          <router-outlet [name]="outlet"></router-outlet>
        </div>
      `,
      imports: [RouterOutlet, NgForOf],
    })
    class RootCmp {
      outlets = signal(['outlet1', 'outlet2', 'outlet3']);
    }

    @Component({
      template: 'component 1',
    })
    class Cmp1 {}

    @Component({
      template: 'component 2',
    })
    class Cmp2 {}

    @Component({
      template: 'component 3',
    })
    class Cmp3 {}

    TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([
          {path: '1', outlet: 'outlet1', component: Cmp1},
          {path: '2', outlet: 'outlet2', component: Cmp2},
          {path: '3', outlet: 'outlet3', component: Cmp3},
        ]),
      ],
    });
    const router = TestBed.inject(Router);
    const fixture = await createRoot(router, RootCmp);

    router.navigate([{outlets: {'outlet1': '1'}}]);
    await advance(fixture);
    expect(fixture.nativeElement.innerHTML).toContain('component 1');
    expect(fixture.nativeElement.innerHTML).not.toContain('component 2');
    expect(fixture.nativeElement.innerHTML).not.toContain('component 3');

    await router.navigate([{outlets: {'outlet1': null, 'outlet2': '2', 'outlet3': '3'}}]);
    await advance(fixture);
    expect(fixture.nativeElement.innerHTML).not.toContain('component 1');
    expect(fixture.nativeElement.innerHTML).toMatch('.*component 2.*component 3');

    // reverse the outlets
    fixture.componentInstance.outlets.set(['outlet3', 'outlet2', 'outlet1']);
    await router.navigate([{outlets: {'outlet1': '1', 'outlet2': '2', 'outlet3': '3'}}]);
    await advance(fixture);
    expect(fixture.nativeElement.innerHTML).toMatch('.*component 3.*component 2.*component 1');
  });

  it('should not activate if route is changed', async () => {
    @Component({
      template: '<div *ngIf="initDone()"><router-outlet></router-outlet></div>',
      imports: [RouterOutlet, CommonModule],
    })
    class ParentCmp {
      initDone = signal(false);
      constructor() {
        setTimeout(() => this.initDone.set(true), 100);
      }
    }

    @Component({
      template: 'child component',
    })
    class ChildCmp {}

    TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([
          {path: 'parent', component: ParentCmp, children: [{path: 'child', component: ChildCmp}]},
        ]),
      ],
    });
    const router = TestBed.inject(Router);
    const fixture = await createRoot(router, ParentCmp);

    await advance(fixture, 25);
    router.navigate(['parent/child']);
    await advance(fixture, 25);
    // Not contain because initDone is still false
    expect(fixture.nativeElement.innerHTML).not.toContain('child component');

    await advance(fixture, 150);
    router.navigate(['parent']);
    await advance(fixture, 150);
    // Not contain because route was changed back to parent
    expect(fixture.nativeElement.innerHTML).not.toContain('child component');
  });
});

describe('component input binding', () => {
  it('sets component inputs from matching query params', async () => {
    @Component({
      template: '',
    })
    class MyComponent {
      @Input() language?: string;
    }

    TestBed.configureTestingModule({
      providers: [
        provideRouter([{path: '**', component: MyComponent}], withComponentInputBinding()),
      ],
    });
    const harness = await RouterTestingHarness.create();

    const instance = await harness.navigateByUrl('/?language=english', MyComponent);
    expect(instance.language).toEqual('english');

    await harness.navigateByUrl('/?language=french');
    expect(instance.language).toEqual('french');

    // Should set the input to undefined when the matching router data is removed
    await harness.navigateByUrl('/');
    expect(instance.language).toEqual(undefined);
    await harness.navigateByUrl('/?notlanguage=doubletalk');
    expect(instance.language).toEqual(undefined);
  });

  it('omits binding undefined to inputs not available in router data if never available', async () => {
    @Component({
      template: '',
    })
    class MyComponent {
      @Input() language: string | undefined = 'default';
    }

    TestBed.configureTestingModule({
      providers: [
        provideRouter(
          [{path: '**', component: MyComponent}],
          withComponentInputBinding({unmatchedInputBehavior: 'undefinedIfStale'}),
        ),
      ],
    });
    const harness = await RouterTestingHarness.create();

    const instance = await harness.navigateByUrl('/', MyComponent);
    expect(instance.language).toEqual('default');

    await harness.navigateByUrl('/?language=english');
    expect(instance.language).toEqual('english');

    await harness.navigateByUrl('/');
    expect(instance.language).toEqual(undefined);
  });

  it('does not set component inputs from matching query params when queryParam inputs are disabled', async () => {
    @Component({
      template: '',
    })
    class MyComponent {
      @Input() language?: string;
    }

    TestBed.configureTestingModule({
      providers: [
        provideRouter(
          [{path: '**', component: MyComponent}],
          withComponentInputBinding({queryParams: false}),
        ),
      ],
    });
    const harness = await RouterTestingHarness.create();

    const instance = await harness.navigateByUrl('/?language=french', MyComponent);
    expect(instance.language).toEqual(undefined);
  });

  it('sets component inputs from resolved and static data', async () => {
    @Component({
      template: '',
    })
    class MyComponent {
      @Input() resolveA?: string;
      @Input() dataA?: string;
    }

    TestBed.configureTestingModule({
      providers: [
        provideRouter(
          [
            {
              path: '**',
              component: MyComponent,
              data: {'dataA': 'My static data'},
              resolve: {'resolveA': () => 'My resolved data'},
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    });
    const harness = await RouterTestingHarness.create();

    const instance = await harness.navigateByUrl('/', MyComponent);
    expect(instance.resolveA).toEqual('My resolved data');
    expect(instance.dataA).toEqual('My static data');
  });

  it('sets component inputs from path params', async () => {
    @Component({
      template: '',
    })
    class MyComponent {
      @Input() language?: string;
    }

    TestBed.configureTestingModule({
      providers: [
        provideRouter([{path: '**', component: MyComponent}], withComponentInputBinding()),
      ],
    });
    const harness = await RouterTestingHarness.create();

    const instance = await harness.navigateByUrl('/x;language=english', MyComponent);
    expect(instance.language).toEqual('english');
  });

  it('when keys conflict, sets inputs based on priority: data > path params > query params', async () => {
    @Component({
      template: '',
    })
    class MyComponent {
      @Input() result?: string;
    }

    TestBed.configureTestingModule({
      providers: [
        provideRouter(
          [
            {
              path: 'withData',
              component: MyComponent,
              data: {'result': 'from data'},
            },
            {
              path: 'withoutData',
              component: MyComponent,
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    });
    const harness = await RouterTestingHarness.create();

    let instance = await harness.navigateByUrl(
      '/withData;result=from path param?result=from query params',
      MyComponent,
    );
    expect(instance.result).toEqual('from data');

    // Same component, different instance because it's a different route
    instance = await harness.navigateByUrl(
      '/withoutData;result=from path param?result=from query params',
      MyComponent,
    );
    expect(instance.result).toEqual('from path param');
    instance = await harness.navigateByUrl('/withoutData?result=from query params', MyComponent);
    expect(instance.result).toEqual('from query params');
  });

  it('when keys conflict, sets inputs based on priority: data > path params > query params, with queryParams disabled', async () => {
    @Component({
      template: '',
    })
    class MyComponent {
      @Input() result?: string;
    }

    TestBed.configureTestingModule({
      providers: [
        provideRouter(
          [
            {
              path: 'withData',
              component: MyComponent,
              data: {'result': 'from data'},
            },
            {
              path: 'withoutData',
              component: MyComponent,
            },
          ],
          withComponentInputBinding({queryParams: false}),
        ),
      ],
    });
    const harness = await RouterTestingHarness.create();

    let instance = await harness.navigateByUrl(
      '/withData;result=from path param?result=from query params',
      MyComponent,
    );
    expect(instance.result).toEqual('from data');

    // Same component, different instance because it's a different route
    instance = await harness.navigateByUrl(
      '/withoutData;result=from path param?result=from query params',
      MyComponent,
    );
    expect(instance.result).toEqual('from path param');
    instance = await harness.navigateByUrl('/withoutData?result=from query params', MyComponent);
    expect(instance.result).toEqual(undefined);
  });

  it('does not write multiple times if two sources of conflicting keys both update', async () => {
    let resultLog: Array<string | undefined> = [];
    @Component({
      template: '',
    })
    class MyComponent {
      @Input()
      set result(v: string | undefined) {
        resultLog.push(v);
      }
    }

    TestBed.configureTestingModule({
      providers: [
        provideRouter([{path: '**', component: MyComponent}], withComponentInputBinding()),
      ],
    });
    const harness = await RouterTestingHarness.create();

    await harness.navigateByUrl('/x', MyComponent);
    expect(resultLog).toEqual([undefined]);

    await harness.navigateByUrl('/x;result=from path param?result=from query params', MyComponent);
    expect(resultLog).toEqual([undefined, 'from path param']);
  });

  it('Should have inputs available to all outlets after navigation', async () => {
    @Component({
      template: '{{myInput}}',
    })
    class MyComponent {
      @Input() myInput?: string;
    }

    @Component({
      template: '<router-outlet/>',
      imports: [RouterOutlet],
    })
    class OutletWrapper {}

    TestBed.configureTestingModule({
      providers: [
        provideRouter(
          [
            {
              path: 'root',
              component: OutletWrapper,
              children: [{path: '**', component: MyComponent}],
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    });
    const harness = await RouterTestingHarness.create('/root/child?myInput=1');
    expect(harness.routeNativeElement!.innerText).toBe('1');
    await harness.navigateByUrl('/root/child?myInput=2');
    expect(harness.routeNativeElement!.innerText).toBe('2');
  });

  it('when keys conflict, sets inputs based on priority: resources > resolvers > data', async () => {
    @Component({
      template: '',
    })
    class MyComponent {
      @Input() result?: any;
    }

    @Component({
      template: '',
    })
    class MyComponentWithoutResource {
      @Input() result?: any;
    }

    @Component({
      template: '',
    })
    class MyComponentWithoutResolver {
      @Input() result?: any;
    }

    TestBed.configureTestingModule({
      providers: [
        provideRouter(
          [
            {
              path: 'all',
              component: MyComponent,
              data: {'result': 'from data'},
              resolve: {'result': () => 'from resolver'},
              resources: () => ({
                result: resource({loader: async () => 'from resource'}),
              }),
            },
            {
              path: 'no-resource',
              component: MyComponentWithoutResource,
              data: {'result': 'from data'},
              resolve: {'result': () => 'from resolver'},
            },
            {
              path: 'no-resolver',
              component: MyComponentWithoutResolver,
              data: {'result': 'from data'},
            },
          ],
          withComponentInputBinding(),
          withRouterResources(),
        ),
      ],
    });
    const harness = await RouterTestingHarness.create();

    let instance = await harness.navigateByUrl('/all', MyComponent);
    // Precedence: resources > resolvers > data
    // resources wins, and it binds ONLY THE VALUE for blocking resources!
    expect(typeof instance.result).toBe('string');
    expect(instance.result).toEqual('from resource');

    const instance2 = await harness.navigateByUrl('/no-resource', MyComponentWithoutResource);
    // No resources, so resolver wins!
    expect(typeof instance2.result).toBe('string');
    expect(instance2.result).toEqual('from resolver');

    const instance3 = await harness.navigateByUrl('/no-resolver', MyComponentWithoutResolver);
    // No resource, no resolver, so data wins!
    expect(typeof instance3.result).toBe('string');
    expect(instance3.result).toEqual('from data');
  });

  it('binds the actual resource object for non-blocking resources', async () => {
    @Component({
      template: '',
    })
    class MyComponent {
      @Input() result?: any;
    }

    TestBed.configureTestingModule({
      providers: [
        provideRouter(
          [
            {
              path: '**',
              component: MyComponent,
              resources: () => ({
                result: nonBlocking(resource({loader: async () => 'from non-blocking resource'})),
              }),
            },
          ],
          withComponentInputBinding(),
          withRouterResources(),
        ),
      ],
    });
    const harness = await RouterTestingHarness.create();

    const instance = await harness.navigateByUrl('/', MyComponent);
    await harness.fixture.whenStable();
    expect(typeof instance.result).toBe('object');
    expect(instance.result?.value()).toEqual('from non-blocking resource');
  });

  it('updates component inputs reactively and cleans up binding effects on outlet deactivation', async () => {
    const trigger = signal('initial');

    @Component({
      template: '',
    })
    class MyComponent {
      @Input() result?: string;
    }

    @Component({
      template: '',
    })
    class OtherComponent {}

    TestBed.configureTestingModule({
      providers: [
        provideRouter(
          [
            {
              path: 'resource',
              component: MyComponent,
              resources: () => ({
                result: resource({
                  params: () => trigger(),
                  loader: async ({params}) => `data: ${params}`,
                }),
              }),
            },
            {
              path: 'other',
              component: OtherComponent,
            },
          ],
          withComponentInputBinding(),
          withRouterResources(),
        ),
      ],
    });
    const harness = await RouterTestingHarness.create();

    const instance = await harness.navigateByUrl('/resource', MyComponent);
    await harness.fixture.whenStable();
    expect(instance.result).toEqual('data: initial');

    // Trigger reactive update while active
    trigger.set('updated');
    await harness.fixture.whenStable();
    expect(instance.result).toEqual('data: updated');

    // Navigate away to deactivate outlet component
    await harness.navigateByUrl('/other', OtherComponent);
    await harness.fixture.whenStable();

    // Trigger update after deactivation - effect should have been destroyed
    trigger.set('after-destroy');
    await harness.fixture.whenStable();
    expect(instance.result).toEqual('data: updated');
  });

  it('unsubscribes from route data and cleans up binding effects on outlet deactivation', async () => {
    @Component({
      template: '',
      standalone: false,
    })
    class MyComponent {}

    TestBed.configureTestingModule({
      providers: [
        provideRouter(
          [
            {path: 'test', component: MyComponent},
            {path: 'empty', children: []},
          ],
          withComponentInputBinding(),
        ),
      ],
    });
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/test', MyComponent);

    const inputBinder = TestBed.inject(INPUT_BINDER);
    const spy = spyOn(inputBinder, 'unsubscribeFromRouteData').and.callThrough();

    const outlet = harness.fixture.debugElement
      .query(By.directive(RouterOutlet))
      .injector.get(RouterOutlet);
    await harness.navigateByUrl('/empty');
    await harness.fixture.whenStable();

    expect(spy).toHaveBeenCalledWith(outlet);
  });

  it('unsubscribes from route data when deactivate() is called directly', async () => {
    @Component({
      template: '',
      standalone: false,
    })
    class MyComponent {}

    TestBed.configureTestingModule({
      providers: [
        provideRouter([{path: 'test', component: MyComponent}], withComponentInputBinding()),
      ],
    });
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/test', MyComponent);

    const inputBinder = TestBed.inject(INPUT_BINDER);
    const spy = spyOn(inputBinder, 'unsubscribeFromRouteData').and.callThrough();

    const outlet = harness.fixture.debugElement
      .query(By.directive(RouterOutlet))
      .injector.get(RouterOutlet);
    outlet.deactivate();

    expect(spy).toHaveBeenCalledWith(outlet);
  });

  it('sets blocking resource input synchronously so input.required() is available in ngOnInit and constructor effects on first render', async () => {
    const log: string[] = [];

    @Component({
      template: '{{ passenger() }}',
    })
    class PassengerEdit {
      @Input({isSignal: true, required: true} as any)
      readonly passenger = model.required<string>();
      @Input({isSignal: true, required: true} as any)
      readonly details = input.required<string>();

      constructor() {
        effect(() => {
          log.push(`effect:${this.passenger()}:${this.details()}`);
        });
      }

      ngOnInit() {
        log.push(`init:${this.passenger()}:${this.details()}`);
      }
    }

    TestBed.configureTestingModule({
      providers: [
        provideRouter(
          [
            {
              path: 'edit',
              component: PassengerEdit,
              resources: () => ({
                passenger: resource({loader: async () => 'Alice'}),
                details: resource({loader: async () => 'VIP'}),
              }),
            },
          ],
          withComponentInputBinding(),
          withRouterResources(),
        ),
      ],
    });

    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/edit', PassengerEdit);
    await harness.fixture.whenStable();

    expect(log).toEqual(['init:Alice:VIP', 'effect:Alice:VIP']);
    expect(harness.routeNativeElement?.textContent).toBe('Alice');
  });
});

describe('injectors', () => {
  it('should always use environment injector from route hierarchy and not inherit from outlet', async () => {
    let childTokenValue: any = null;
    const TOKEN = new InjectionToken<any>('');

    @Component({
      template: '',
    })
    class Child {
      constructor() {
        childTokenValue = inject(TOKEN as any, {optional: true});
      }
    }

    @NgModule({
      providers: [{provide: TOKEN, useValue: 'some value'}],
    })
    class ModWithProviders {}

    @Component({
      template: '<router-outlet/>',
      imports: [RouterOutlet, ModWithProviders],
    })
    class App {}

    TestBed.configureTestingModule({
      providers: [provideRouter([{path: 'a', component: Child}])],
    });
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    await TestBed.inject(Router).navigateByUrl('/a');
    await fixture.whenStable();
    expect(childTokenValue).toEqual(null);
  });

  it('should not get sibling providers', async () => {
    let childTokenValue: any = null;
    const TOKEN = new InjectionToken<any>('');
    @Component({
      template: '',
    })
    class Child {
      constructor() {
        childTokenValue = inject(TOKEN, {optional: true});
      }
    }

    @Component({
      template: '<router-outlet/>',
      imports: [RouterOutlet],
    })
    class App {}

    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {path: 'a', providers: [{provide: TOKEN, useValue: 'a value'}], component: Child},
          {path: 'b', component: Child},
        ]),
      ],
    });
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    await TestBed.inject(Router).navigateByUrl('/a');
    await fixture.whenStable();
    expect(childTokenValue).toEqual('a value');
    await TestBed.inject(Router).navigateByUrl('/b');
    await fixture.whenStable();
    expect(childTokenValue).toEqual(null);
  });
});

describe('router outlet data', () => {
  it('is injectable even when not set', async () => {
    @Component({template: ''})
    class MyComponent {
      data = inject(ROUTER_OUTLET_DATA);
    }

    @Component({template: '<router-outlet />', imports: [RouterOutlet]})
    class App {}

    TestBed.configureTestingModule({
      providers: [provideRouter([{path: '**', component: MyComponent}])],
    });

    const fixture = TestBed.createComponent(App);
    await TestBed.inject(Router).navigateByUrl('/');
    await fixture.whenStable();
    const routedComponent = fixture.debugElement.query(
      (v) => v.componentInstance instanceof MyComponent,
    ).componentInstance as MyComponent;
    expect(routedComponent.data()).toEqual(undefined);
  });

  it('can set and update value', async () => {
    @Component({template: ''})
    class MyComponent {
      data = inject(ROUTER_OUTLET_DATA);
    }

    TestBed.configureTestingModule({
      providers: [provideRouter([{path: '**', component: MyComponent}])],
    });

    const harness = await RouterTestingHarness.create();
    harness.fixture.componentInstance.routerOutletData.set('initial');
    const routedComponent = await harness.navigateByUrl('/', MyComponent);

    expect(routedComponent.data()).toEqual('initial');
    harness.fixture.componentInstance.routerOutletData.set('new');
    await harness.fixture.whenStable();
    expect(routedComponent.data()).toEqual('new');
  });

  it('overrides parent provided data with nested', async () => {
    @Component({
      imports: [RouterOutlet],
      template: `{{ outletData() }}|<router-outlet [routerOutletData]="'child'" />`,
    })
    class Child {
      readonly outletData = inject(ROUTER_OUTLET_DATA);
    }

    @Component({
      template: '{{outletData()}}',
    })
    class GrandChild {
      readonly outletData = inject(ROUTER_OUTLET_DATA);
    }

    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {
            path: 'child',
            component: Child,
            children: [{path: 'grandchild', component: GrandChild}],
          },
        ]),
      ],
    });

    const harness = await RouterTestingHarness.create();
    harness.fixture.componentInstance.routerOutletData.set('parent');

    await harness.navigateByUrl('/child/grandchild');
    expect(harness.routeNativeElement?.innerText).toContain('parent|child');
  });

  it('does not inherit ancestor data when not provided in nested', async () => {
    @Component({
      imports: [RouterOutlet],
      template: `{{ outletData() }}|<router-outlet />`,
    })
    class Child {
      readonly outletData = inject(ROUTER_OUTLET_DATA);
    }

    @Component({
      template: '{{outletData() ?? "not provided"}}',
    })
    class GrandChild {
      readonly outletData = inject(ROUTER_OUTLET_DATA);
    }

    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {
            path: 'child',
            component: Child,
            children: [{path: 'grandchild', component: GrandChild}],
          },
        ]),
      ],
    });

    const harness = await RouterTestingHarness.create();
    harness.fixture.componentInstance.routerOutletData.set('parent');

    await harness.navigateByUrl('/child/grandchild');
    expect(harness.routeNativeElement?.innerText).toContain('parent|not provided');
  });
});

describe('Error boundaries and errorComponent integration', () => {
  useAutoTick();

  /**
   * Error boundaries are an opt-in feature. Most tests in this block only care about the default
   * behavior of the feature, so this helper enables it without any options.
   */
  function provideRouterWithBoundaries(
    routes: Route[],
    ...features: RouterFeatures[]
  ): EnvironmentProviders {
    return internalProvideRouter(routes, withErrorBoundaries(), ...features);
  }

  it('renders route errorComponent when component throws in ngOnInit and sets error input', async () => {
    @Component({
      template: 'Normal Component Content',
    })
    class ThrowingComponent {
      ngOnInit() {
        throw new Error('Component Rendering Failed');
      }
    }

    @Component({
      template: 'Error caught: {{ error?.message }}',
    })
    class ErrorFallbackComponent {
      @Input() error?: Error;
    }

    TestBed.configureTestingModule({
      providers: [
        provideRouterWithBoundaries([
          {
            path: 'test',
            component: ThrowingComponent,
            errorComponent: ErrorFallbackComponent,
          },
        ]),
      ],
    });

    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/test');
    await harness.fixture.whenStable();

    expect(harness.routeNativeElement?.innerText).toContain(
      'Error caught: Component Rendering Failed',
    );
  });

  it('rejects the navigation when a blocking router resource throws', async () => {
    @Component({
      template: 'User: {{ user }}',
    })
    class ProfileComponent {
      @Input() user?: string;
    }

    @Component({
      template: 'Resource Error: {{ error?.message }}',
    })
    class ProfileErrorComponent {
      @Input() error?: Error;
    }

    TestBed.configureTestingModule({
      providers: [
        provideRouterWithBoundaries(
          [
            {
              path: 'profile',
              component: ProfileComponent,
              errorComponent: ProfileErrorComponent,
              resources: () => ({
                user: resource({
                  loader: async () => {
                    throw new Error('Network Timeout');
                  },
                }),
              }),
            },
          ],
          withComponentInputBinding(),
          withRouterResources(),
        ),
      ],
    });

    const harness = await RouterTestingHarness.create();

    // Blocking resources are awaited as part of the navigation, so a rejected resource fails the
    // navigation. The route is never activated and therefore its `errorComponent` is not used.
    await expectAsync(harness.navigateByUrl('/profile')).toBeRejectedWithError('Network Timeout');
    await harness.fixture.whenStable();

    expect(harness.routeNativeElement?.innerText).not.toContain('Resource Error:');
  });

  it('catches creation pass (constructor) errors and renders errorComponent', async () => {
    @Component({
      template: 'Content',
    })
    class ConstructorErrorComponent {
      constructor() {
        throw new Error('Constructor Creation Failure');
      }
    }

    @Component({
      template: 'Caught Constructor Error: {{ error?.message }}',
    })
    class ErrorFallbackComponent {
      @Input() error?: Error;
    }

    TestBed.configureTestingModule({
      providers: [
        provideRouterWithBoundaries([
          {
            path: 'test-constructor-error',
            component: ConstructorErrorComponent,
            errorComponent: ErrorFallbackComponent,
          },
        ]),
      ],
    });

    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/test-constructor-error');
    await harness.fixture.whenStable();

    expect(harness.routeNativeElement?.innerText).toContain(
      'Caught Constructor Error: Constructor Creation Failure',
    );
  });

  it('catches RedirectCommand thrown in route component and triggers navigation', async () => {
    @Component({
      template: 'Redirecting...',
    })
    class RedirectSourceComponent {
      private router = inject(Router);
      ngOnInit() {
        throw new RedirectCommand(this.router.parseUrl('/target-destination'));
      }
    }

    @Component({
      template: 'Target Destination Reached',
    })
    class TargetDestinationComponent {}

    TestBed.configureTestingModule({
      providers: [
        provideRouterWithBoundaries([
          {
            path: 'redirect-source',
            component: RedirectSourceComponent,
          },
          {
            path: 'target-destination',
            component: TargetDestinationComponent,
          },
        ]),
      ],
    });

    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/redirect-source');
    await harness.fixture.whenStable();

    expect(harness.routeNativeElement?.innerText).toContain('Target Destination Reached');
  });

  it('catches RedirectCommand thrown in route resource and triggers navigation', async () => {
    @Component({
      template: 'Source with resource',
    })
    class ResourceRedirectComponent {
      @Input() data?: string;
    }

    @Component({
      template: 'Login Page Content',
    })
    class LoginComponent {}

    TestBed.configureTestingModule({
      providers: [
        provideRouterWithBoundaries(
          [
            {
              path: 'auth-required',
              component: ResourceRedirectComponent,
              resources: () => {
                const router = inject(Router);
                return {
                  data: resource({
                    loader: async () => {
                      throw new RedirectCommand(router.parseUrl('/login'));
                    },
                  }),
                };
              },
            },
            {
              path: 'login',
              component: LoginComponent,
            },
          ],
          withComponentInputBinding(),
          withRouterResources(),
        ),
      ],
    });

    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/auth-required');
    await harness.fixture.whenStable();

    expect(harness.routeNativeElement?.innerText).toContain('Login Page Content');
  });

  it('dispatches RedirectCommand only once when bubbling through multiple boundaries', async () => {
    let navigateByUrlCalls = 0;

    @Component({
      template: 'Throwing Child',
    })
    class ThrowingChild {
      private router = inject(Router);
      ngOnInit() {
        throw new RedirectCommand(this.router.parseUrl('/destination'));
      }
    }

    @Component({
      imports: [RouterOutlet],
      template: '<router-outlet />',
    })
    class ParentLayout {}

    @Component({
      template: 'Destination Reached',
    })
    class DestinationComponent {}

    TestBed.configureTestingModule({
      providers: [
        provideRouterWithBoundaries([
          {
            path: 'parent',
            component: ParentLayout,
            children: [
              {
                path: 'child',
                component: ThrowingChild,
              },
            ],
          },
          {
            path: 'destination',
            component: DestinationComponent,
          },
        ]),
      ],
    });

    const router = TestBed.inject(Router);
    const origNavigateByUrl = router.navigateByUrl.bind(router);
    spyOn(router, 'navigateByUrl').and.callFake((...args) => {
      // The harness performs the initial navigation through `navigateByUrl` as well, so only the
      // navigations towards the redirect target are counted here.
      if (router.serializeUrl(router.parseUrl(String(args[0]))) === '/destination') {
        navigateByUrlCalls++;
      }
      return origNavigateByUrl(...args);
    });

    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/parent/child');
    await harness.fixture.whenStable();

    expect(navigateByUrlCalls).toBe(1);
    expect(harness.routeNativeElement?.innerText).toContain('Destination Reached');
  });

  it('bubbles error up when route does not define an errorComponent', async () => {
    @Component({
      template: 'Throwing Component Content',
    })
    class ThrowingComponent {
      ngOnInit() {
        throw new Error('Uncaught Route Error');
      }
    }

    @Component({
      imports: [RouterOutlet],
      template: `
        @boundary {
          <router-outlet />
        } @error (let err) {
          <div class="boundary-catch">Caught by template boundary: {{ err.message }}</div>
        }
      `,
    })
    class RootBoundaryComponent {}

    TestBed.configureTestingModule({
      providers: [
        provideRouterWithBoundaries([
          {
            path: 'unhandled-error',
            component: ThrowingComponent,
          },
        ]),
      ],
    });

    const router = TestBed.inject(Router);
    const fixture = await createRoot(router, RootBoundaryComponent);
    await router.navigateByUrl('/unhandled-error');
    await advance(fixture);

    expect(fixture.nativeElement.innerHTML).toContain(
      'Caught by template boundary: Uncaught Route Error',
    );
  });

  it('renders defaultErrorComponent configured via withErrorBoundaries when route lacks errorComponent', async () => {
    @Component({
      template: 'Content',
    })
    class ThrowingComponent {
      ngOnInit() {
        throw new Error('Unhandled in Route');
      }
    }

    @Component({
      template: 'Global Error Fallback: {{ error?.message }}',
    })
    class GlobalErrorComponent {
      @Input() error?: Error;
    }

    TestBed.configureTestingModule({
      providers: [
        provideRouter(
          [
            {
              path: 'default-fallback',
              component: ThrowingComponent,
            },
          ],
          withErrorBoundaries({
            defaultErrorComponent: GlobalErrorComponent,
          }),
        ),
      ],
    });

    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/default-fallback');
    await harness.fixture.whenStable();

    expect(harness.routeNativeElement?.innerText).toContain(
      'Global Error Fallback: Unhandled in Route',
    );
  });

  it('invokes onError hook in withErrorBoundaries in the root injection context', async () => {
    let telemetryError: Error | null = null;
    let injectedRootValue: string | null = null;
    const ROOT_TOKEN = new InjectionToken<string>('ROOT_TOKEN');

    @Component({
      template: '',
    })
    class ThrowingComponent {
      ngOnInit() {
        throw new Error('Telemetry Error');
      }
    }

    @Component({
      template: 'Error View',
    })
    class ErrorViewComponent {
      @Input() error?: Error;
    }

    TestBed.configureTestingModule({
      providers: [
        {provide: ROOT_TOKEN, useValue: 'root'},
        provideRouter(
          [
            {
              path: 'telemetry',
              component: ThrowingComponent,
              errorComponent: ErrorViewComponent,
              providers: [{provide: ROOT_TOKEN, useValue: 'route'}],
            },
          ],
          withErrorBoundaries({
            onError: (err) => {
              telemetryError = err;
              injectedRootValue = inject(ROOT_TOKEN);
            },
          }),
        ),
      ],
    });

    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/telemetry');
    await harness.fixture.whenStable();

    expect(telemetryError).not.toBeNull();
    expect((telemetryError as any)?.message).toBe('Telemetry Error');
    expect(injectedRootValue as string | null).toBe('root');
  });

  it('bubbles error up to template boundary even if onError is provided', async () => {
    let telemetryError: Error | null = null;

    @Component({
      template: '',
    })
    class ThrowingComponent {
      ngOnInit() {
        throw new Error('Telemetry Error');
      }
    }

    @Component({
      imports: [RouterOutlet],
      template: `
        @boundary {
          <router-outlet />
        } @error (let err) {
          <div class="boundary-catch">Caught by template boundary: {{ err.message }}</div>
        }
      `,
    })
    class RootBoundaryComponent {}

    TestBed.configureTestingModule({
      providers: [
        provideRouter(
          [
            {
              path: 'telemetry',
              component: ThrowingComponent,
              // No errorComponent provided
            },
          ],
          withErrorBoundaries({
            onError: (err) => {
              telemetryError = err;
            },
          }),
        ),
      ],
    });

    const router = TestBed.inject(Router);
    const fixture = await createRoot(router, RootBoundaryComponent);
    await router.navigateByUrl('/telemetry');
    await advance(fixture);

    // Verify the global hook was NOT invoked because the router did not catch the error
    expect(telemetryError).toBeNull();
    // Verify it still bubbled up to the template boundary
    expect(fixture.nativeElement.innerHTML).toContain(
      'Caught by template boundary: Telemetry Error',
    );
  });

  it('bypasses canDeactivate guards when the error component is active', async () => {
    let guardExecutionCount = 0;

    @Component({
      template: '',
    })
    class ThrowingComponent {
      hasUnsavedChanges(): boolean {
        return false;
      }

      ngOnInit() {
        throw new Error('Crash in OnInit');
      }
    }

    @Component({
      template: 'Error View',
    })
    class ErrorViewComponent {}

    @Component({
      template: 'Home View',
    })
    class HomeComponent {}

    TestBed.configureTestingModule({
      providers: [
        provideRouter(
          [
            {
              path: 'home',
              component: HomeComponent,
            },
            {
              path: 'editor',
              component: ThrowingComponent,
              errorComponent: ErrorViewComponent,
              canDeactivate: [
                (comp: ThrowingComponent) => {
                  guardExecutionCount++;
                  return !comp.hasUnsavedChanges();
                },
              ],
            },
          ],
          withErrorBoundaries(),
        ),
      ],
    });

    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/editor');
    await harness.fixture.whenStable();

    // Verify error component is shown
    expect(harness.routeNativeElement?.innerHTML).toContain('Error View');

    // Attempt to navigate away
    const router = TestBed.inject(Router);
    const navResult = await router.navigateByUrl('/home');

    expect(navResult).toBe(true);
    // The guard should NOT have been executed at all, since the primary component was destroyed and errorComponent is active.
    expect(guardExecutionCount).toBe(0);
  });

  it('recovers from the error component when navigating to the same route with different parameters', async () => {
    let constructorCount = 0;
    let shouldCrash = true;

    @Component({
      template: 'Product',
    })
    class ProductDetails {
      constructor() {
        constructorCount++;
        if (shouldCrash) {
          throw new Error('Crash on 1');
        }
      }
    }

    @Component({
      template: 'Error',
    })
    class ProductErrorFallback {}

    TestBed.configureTestingModule({
      providers: [
        provideRouter(
          [
            {
              path: 'product/:id',
              component: ProductDetails,
              errorComponent: ProductErrorFallback,
            },
          ],
          withErrorBoundaries(),
          withComponentInputBinding(),
        ),
      ],
    });

    const harness = await RouterTestingHarness.create();

    // Navigate to product 1, which crashes.
    await harness.navigateByUrl('/product/1');
    await harness.fixture.whenStable();

    // Verify error component is shown
    expect(harness.routeNativeElement?.innerHTML).toContain('Error');
    expect(constructorCount).toBe(1);

    // Now navigate to product 2.
    shouldCrash = false;
    await harness.navigateByUrl('/product/2');
    await harness.fixture.whenStable();

    // The primary component MUST be rendered for Product 2.
    expect(harness.routeNativeElement?.innerHTML).toContain('Product');
    // And the primary component MUST have been instantiated a second time!
    expect(constructorCount).toBe(2);

    // If we navigate to yet another product without crashing, the component MUST be reused!
    await harness.navigateByUrl('/product/3');
    await harness.fixture.whenStable();

    expect(harness.routeNativeElement?.innerHTML).toContain('Product');
    // The constructor should NOT have been called again.
    expect(constructorCount).toBe(2);
  });

  it('bubbles child component crashes to the parent error boundary', async () => {
    let parentErrorShown = false;

    @Component({
      template: 'Parent <router-outlet></router-outlet>',
      imports: [RouterOutlet],
    })
    class ParentComponent {}

    @Component({
      template: 'Parent Error',
    })
    class ParentErrorFallback {
      constructor() {
        console.trace('ParentErrorFallback instantiated!');
        parentErrorShown = true;
      }
    }

    @Component({template: 'Child'})
    class ChildComponent {
      constructor() {
        throw new Error('Child crash');
      }
    }

    TestBed.configureTestingModule({
      providers: [
        provideRouter(
          [
            {
              path: 'parent',
              component: ParentComponent,
              errorComponent: ParentErrorFallback,
              children: [
                {
                  path: 'child',
                  component: ChildComponent,
                },
              ],
            },
          ],
          withErrorBoundaries(),
        ),
      ],
    });

    const harness = await RouterTestingHarness.create();

    try {
      await harness.navigateByUrl('/parent/child');
    } catch (e) {}

    await harness.fixture.whenStable();

    // If error boundaries are hierarchical, the parent error component should catch the child's crash!
    // And it DOES! Thanks to Angular's view-level onError bubbling.
    expect(parentErrorShown).toBe(true);
    expect(harness.routeNativeElement?.innerHTML).toContain('Parent Error');
  });

  it('does not emit activateEvents or deactivateEvents for the errorComponent', async () => {
    let activateCount = 0;
    let activatedInstance: any = null;
    let deactivateCount = 0;
    let deactivatedInstance: any = null;

    @Component({
      template: 'Product',
    })
    class ProductDetails {
      constructor() {
        throw new Error('Crash');
      }
    }

    @Component({
      template: 'Error',
    })
    class ProductErrorFallback {}

    @Component({
      template:
        '<router-outlet (activate)="onActivate($event)" (deactivate)="onDeactivate($event)"></router-outlet>',
      imports: [RouterOutlet],
    })
    class AppCmp {
      onActivate(instance: any) {
        activateCount++;
        activatedInstance = instance;
      }
      onDeactivate(instance: any) {
        deactivateCount++;
        deactivatedInstance = instance;
      }
    }

    TestBed.configureTestingModule({
      providers: [
        provideRouter(
          [
            {
              path: 'product/:id',
              component: ProductDetails,
              errorComponent: ProductErrorFallback,
            },
            {
              path: 'other',
              component: ProductErrorFallback, // Just something else to navigate to
            },
          ],
          withErrorBoundaries(),
        ),
      ],
    });

    const fixture = TestBed.createComponent(AppCmp);
    const router = TestBed.inject(Router);
    fixture.detectChanges();

    await router.navigateByUrl('/product/1');
    fixture.detectChanges();

    // Verify error component is shown
    expect(fixture.nativeElement.innerHTML).toContain('Error');

    // activateEvents should NOT emit the error component instance
    expect(activateCount).toBe(0);

    // Navigate away to trigger deactivation of the error component
    await router.navigateByUrl('/other');
    fixture.detectChanges();

    // deactivateEvents should NOT emit the error component instance, maintaining symmetry with activateEvents
    expect(deactivateCount).toBe(0);
  });

  it('only invokes onError once when an unhandled child error bubbles to parent errorComponent', async () => {
    let onErrorCallCount = 0;

    @Component({
      template: 'Child',
    })
    class ThrowingChild {
      constructor() {
        throw new Error('Child Crash');
      }
    }

    @Component({
      template: 'Parent Error Fallback',
    })
    class ParentErrorFallback {}

    @Component({
      template: '<router-outlet></router-outlet>',
      imports: [RouterOutlet],
    })
    class ParentCmp {}

    TestBed.configureTestingModule({
      providers: [
        provideRouter(
          [
            {
              path: 'parent',
              component: ParentCmp,
              errorComponent: ParentErrorFallback,
              children: [
                {
                  path: 'child',
                  component: ThrowingChild,
                },
              ],
            },
          ],
          withErrorBoundaries({
            onError: () => {
              onErrorCallCount++;
            },
          }),
        ),
      ],
    });

    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/parent/child');
    await harness.fixture.whenStable();

    expect(harness.routeNativeElement?.innerHTML).toContain('Parent Error Fallback');
    expect(onErrorCallCount).toBe(1);
  });

  it('does not catch errors when the error boundary feature is not enabled', async () => {
    @Component({
      template: '',
    })
    class ThrowingComponent {
      ngOnInit() {
        throw new Error('Uncaught Error');
      }
    }

    @Component({
      template: 'Error View',
    })
    class ErrorViewComponent {
      @Input() error?: Error;
    }

    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {
            path: 'no-boundary',
            component: ThrowingComponent,
            errorComponent: ErrorViewComponent,
          },
        ]),
      ],
    });

    const harness = await RouterTestingHarness.create();
    await expectAsync(harness.navigateByUrl('/no-boundary')).toBeRejectedWithError(
      'Uncaught Error',
    );
  });

  it('catches RedirectCommand thrown in component constructor and triggers navigation', async () => {
    @Component({
      template: '',
    })
    class ConstructorRedirectComponent {
      private router = inject(Router);
      constructor() {
        throw new RedirectCommand(this.router.parseUrl('/constructor-destination'));
      }
    }

    @Component({
      template: 'Constructor Destination Reached',
    })
    class DestinationComponent {}

    TestBed.configureTestingModule({
      providers: [
        provideRouterWithBoundaries([
          {
            path: 'constructor-redirect',
            component: ConstructorRedirectComponent,
          },
          {
            path: 'constructor-destination',
            component: DestinationComponent,
          },
        ]),
      ],
    });

    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/constructor-redirect');
    await harness.fixture.whenStable();

    expect(harness.routeNativeElement?.innerText).toContain('Constructor Destination Reached');
  });

  it('renders static errorComponent that does not declare an error input', async () => {
    @Component({
      template: '',
    })
    class ThrowingComponent {
      ngOnInit() {
        throw new Error('Static Error Test');
      }
    }

    @Component({
      template: 'Static Fallback Message (No Inputs)',
    })
    class StaticErrorComponent {}

    TestBed.configureTestingModule({
      providers: [
        provideRouterWithBoundaries([
          {
            path: 'static-error',
            component: ThrowingComponent,
            errorComponent: StaticErrorComponent,
          },
        ]),
      ],
    });

    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/static-error');
    await harness.fixture.whenStable();

    expect(harness.routeNativeElement?.innerText).toContain('Static Fallback Message (No Inputs)');
  });

  it('bubbles child route error up to parent route errorComponent when child has none', async () => {
    @Component({
      template: '',
    })
    class ThrowingChildComponent {
      ngOnInit() {
        throw new Error('Child Failed');
      }
    }

    @Component({
      imports: [RouterOutlet],
      template: '<router-outlet />',
    })
    class ParentLayoutComponent {}

    @Component({
      template: 'Parent Caught Error: {{ error?.message }}',
    })
    class ParentErrorComponent {
      @Input() error?: Error;
    }

    TestBed.configureTestingModule({
      providers: [
        provideRouterWithBoundaries([
          {
            path: 'parent',
            component: ParentLayoutComponent,
            errorComponent: ParentErrorComponent,
            children: [
              {
                path: 'child',
                component: ThrowingChildComponent,
              },
            ],
          },
        ]),
      ],
    });

    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/parent/child');
    await harness.fixture.whenStable();

    expect(harness.routeNativeElement?.innerText).toContain('Parent Caught Error: Child Failed');
  });

  it('unmounts parent component and renders parent errorComponent when child route throws without its own errorComponent', async () => {
    @Component({
      imports: [RouterOutlet],
      template: '<h1>Parent Layout</h1><router-outlet />',
    })
    class ParentLayoutComponent {}

    @Component({
      template: 'Child Content',
    })
    class ThrowingChildComponent {
      ngOnInit() {
        throw new Error('Child Page Failed');
      }
    }

    @Component({
      template: '<div class="parent-error">Parent Fallback: {{ error?.message }}</div>',
    })
    class ParentErrorComponent {
      @Input() error?: Error;
    }

    TestBed.configureTestingModule({
      providers: [
        provideRouterWithBoundaries([
          {
            path: 'parent',
            component: ParentLayoutComponent,
            errorComponent: ParentErrorComponent,
            children: [
              {
                path: 'child',
                component: ThrowingChildComponent,
              },
            ],
          },
        ]),
      ],
    });

    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/parent/child');
    await harness.fixture.whenStable();

    // The parent route's errorComponent is rendered with the error that bubbled from the child
    expect(harness.routeNativeElement?.innerText).toContain('Parent Fallback: Child Page Failed');
    // The entire parent component is destroyed and replaced (the parent layout header is no longer rendered)
    expect(harness.routeNativeElement?.innerText).not.toContain('Parent Layout');
  });

  it('keeps parent layout and child component mounted when error is caught by child template boundary', async () => {
    @Component({
      selector: 'crashing-widget',
      template: '',
    })
    class CrashingWidget {
      ngOnInit() {
        throw new Error('Nested Widget Crash');
      }
    }

    @Component({
      imports: [RouterOutlet],
      template: '<h1>Parent Layout</h1><router-outlet />',
    })
    class ParentLayoutComponent {}

    @Component({
      imports: [CrashingWidget],
      template: `
        <h2>Child Content</h2>
        @boundary {
          <crashing-widget />
        } @error (let err) {
          <p class="child-caught">Caught locally: {{ err.message }}</p>
        }
      `,
    })
    class ChildWithBoundaryComponent {}

    @Component({
      template: 'Parent Fallback: {{ error?.message }}',
    })
    class ParentErrorComponent {
      @Input() error?: Error;
    }

    TestBed.configureTestingModule({
      providers: [
        provideRouterWithBoundaries([
          {
            path: 'parent',
            component: ParentLayoutComponent,
            errorComponent: ParentErrorComponent,
            children: [
              {
                path: 'child',
                component: ChildWithBoundaryComponent,
              },
            ],
          },
        ]),
      ],
    });

    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/parent/child');
    await harness.fixture.whenStable();

    // 1. Child template boundary caught the error locally
    expect(harness.routeNativeElement?.innerText).toContain('Caught locally: Nested Widget Crash');
    // 2. Child component remains mounted
    expect(harness.routeNativeElement?.innerText).toContain('Child Content');
    // 3. Parent layout remains mounted because error was not bubbled to router
    expect(harness.routeNativeElement?.innerText).toContain('Parent Layout');
    // 4. Parent route errorComponent was NOT rendered
    expect(harness.routeNativeElement?.innerText).not.toContain('Parent Fallback');
  });

  it('catches error in parent template boundary when parent wraps router-outlet inside @if and @boundary', async () => {
    @Component({
      template: '',
    })
    class ThrowingChildComponent {
      ngOnInit() {
        throw new Error('Child Failed');
      }
    }

    @Component({
      imports: [RouterOutlet],
      template: `
        <h1>Parent Layout Header</h1>
        @if (true) {
          @boundary {
            <router-outlet />
          } @error (let err) {
            <div class="template-fallback">Caught by template boundary: {{ err.message }}</div>
          }
        }
      `,
    })
    class ParentWithTemplateBoundaryComponent {}

    @Component({
      template: '<div class="route-error-fallback">Parent Route Error: {{ error?.message }}</div>',
    })
    class ParentRouteErrorComponent {
      @Input() error?: Error;
    }

    TestBed.configureTestingModule({
      providers: [
        provideRouterWithBoundaries([
          {
            path: 'parent',
            component: ParentWithTemplateBoundaryComponent,
            errorComponent: ParentRouteErrorComponent,
            children: [
              {
                path: 'child',
                component: ThrowingChildComponent,
              },
            ],
          },
        ]),
      ],
    });

    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/parent/child');
    await harness.fixture.whenStable();

    // 1. The template boundary inside Parent caught the error
    expect(harness.routeNativeElement?.innerHTML).toContain(
      'Caught by template boundary: Child Failed',
    );
    // 2. The parent component remains mounted (layout header is preserved)
    expect(harness.routeNativeElement?.innerHTML).toContain('Parent Layout Header');
    // 3. The parent route errorComponent is NOT rendered because the template boundary caught it
    expect(harness.routeNativeElement?.innerHTML).not.toContain('Parent Route Error');
  });

  it('binds route params, data, and blocking resources to errorComponent when withComponentInputBinding is enabled', async () => {
    @Component({
      template: '',
    })
    class ThrowingProductComponent {
      ngOnInit() {
        throw new Error('Product not found in DB');
      }
    }

    @Component({
      template: 'Error loading product #{{ id }} ({{ category }}): {{ error?.message }}',
    })
    class ProductErrorComponent {
      @Input() id?: string;
      @Input() category?: string;
      @Input() error?: Error;
    }

    TestBed.configureTestingModule({
      providers: [
        provideRouterWithBoundaries(
          [
            {
              path: 'products/:id',
              component: ThrowingProductComponent,
              errorComponent: ProductErrorComponent,
              resources: () => ({
                category: resource({
                  loader: async () => 'electronics',
                }),
              }),
            },
          ],
          withComponentInputBinding(),
          withRouterResources(),
        ),
      ],
    });

    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/products/12345');
    await harness.fixture.whenStable();

    expect(harness.routeNativeElement?.innerText).toContain(
      'Error loading product #12345 (electronics): Product not found in DB',
    );
  });

  it('supports injecting RouterOutlet in an errorComponent', async () => {
    let injectedOutlet: RouterOutlet | undefined;
    let errorComponentInstance: object | undefined;

    @Component({
      template: 'Success View',
    })
    class FlakyComponent {
      ngOnInit() {
        throw new Error('Initial Failure');
      }
    }

    @Component({
      template: '<span>Failed: {{ error?.message }}</span>',
    })
    class ErrorFallbackComponent {
      @Input() error?: Error;
      readonly outlet = inject(RouterOutlet);
      constructor() {
        injectedOutlet = this.outlet;
        errorComponentInstance = this;
      }
    }

    TestBed.configureTestingModule({
      providers: [
        provideRouterWithBoundaries([
          {
            path: 'flaky-di',
            component: FlakyComponent,
            errorComponent: ErrorFallbackComponent,
          },
        ]),
      ],
    });

    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/flaky-di');
    await harness.fixture.whenStable();

    expect(harness.routeNativeElement?.innerText).toContain('Failed: Initial Failure');
    // The outlet is resolved through the element injector at the outlet host, so the error
    // component gets the outlet that is rendering it.
    expect(injectedOutlet).toBeDefined();
    expect(injectedOutlet!.component).toBe(errorComponentInstance!);
  });

  it('bubbles error up to parent template boundary when errorComponent itself fails', async () => {
    @Component({
      template: '',
    })
    class PrimaryFailingComponent {
      ngOnInit() {
        throw new Error('Primary Failed');
      }
    }

    @Component({
      template: '',
    })
    class BuggyErrorComponent {
      constructor() {
        throw new Error('ErrorComponent Construction Crash');
      }
    }

    @Component({
      imports: [RouterOutlet],
      template: `
        @boundary {
          <router-outlet />
        } @error (let err) {
          <div class="outer-catch">Caught Outer: {{ err.message }}</div>
        }
      `,
    })
    class RootBoundaryComponent {}

    TestBed.configureTestingModule({
      providers: [
        provideRouterWithBoundaries([
          {
            path: 'nested-error-crash',
            component: PrimaryFailingComponent,
            errorComponent: BuggyErrorComponent,
          },
        ]),
      ],
    });

    const router = TestBed.inject(Router);
    const fixture = await createRoot(router, RootBoundaryComponent);
    await router.navigateByUrl('/nested-error-crash');
    await advance(fixture);

    expect(fixture.nativeElement.innerHTML).toContain(
      'Caught Outer: ErrorComponent Construction Crash',
    );
  });

  it('ensures caught error takes precedence over route params, data, and resolvers named error', async () => {
    @Component({
      template: '',
    })
    class FailingComponentWithData {
      ngOnInit() {
        throw new Error('Real Caught Exception');
      }
    }

    @Component({
      template: `
        <span class="error-msg">{{ (error && error.message) || error }}</span>
        <span class="id-val">{{ id }}</span>
        <span class="title-val">{{ title }}</span>
      `,
    })
    class DataCollidingErrorComponent {
      @Input() error?: any;
      @Input() id?: string;
      @Input() title?: string;
    }

    TestBed.configureTestingModule({
      providers: [
        provideRouterWithBoundaries(
          [
            {
              path: 'items/:id/:error',
              component: FailingComponentWithData,
              errorComponent: DataCollidingErrorComponent,
              data: {
                error: 'Static Data Error String',
                title: 'My Item Title',
              },
              resolve: {
                error: () => 'Resolver Error String',
              },
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    });

    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/items/999/param-error-value?error=query-error-value');
    await harness.fixture.whenStable();

    // Verify error input received the actual caught Error object
    const errorEl = harness.routeNativeElement?.querySelector('.error-msg');
    expect(errorEl?.textContent).toContain('Real Caught Exception');
    expect(errorEl?.textContent).not.toContain('Static Data Error String');
    expect(errorEl?.textContent).not.toContain('Resolver Error String');
    expect(errorEl?.textContent).not.toContain('param-error-value');
    expect(errorEl?.textContent).not.toContain('query-error-value');

    // Verify other params and data are still bound properly
    const idEl = harness.routeNativeElement?.querySelector('.id-val');
    expect(idEl?.textContent).toContain('999');

    const titleEl = harness.routeNativeElement?.querySelector('.title-val');
    expect(titleEl?.textContent).toContain('My Item Title');
  });
});

async function advance(fixture: ComponentFixture<unknown>, millis = 0): Promise<void> {
  await timeout(millis);
  await fixture.whenStable();
}

async function createRoot<T>(router: Router, type: Type<T>): Promise<ComponentFixture<T>> {
  const f = TestBed.createComponent(type);
  await advance(f);
  router.initialNavigation();
  await advance(f);
  return f;
}
