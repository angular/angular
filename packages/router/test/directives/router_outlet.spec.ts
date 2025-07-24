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
  inject,
  provideZonelessChangeDetection,
  Input,
  Type,
  NgModule,
  signal,
} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {
  provideRouter,
  Router,
  RouterModule,
  RouterOutlet,
  withComponentInputBinding,
  ROUTER_OUTLET_DATA,
} from '../../index';
import {RouterTestingHarness} from '../../testing';
import {InjectionToken} from '../../../core/src/di';
import {timeout, useAutoTick} from '../helpers';

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
      standalone: false,
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

  it('sets component inputs from resolved and static data', async () => {
    @Component({
      template: '',
      standalone: false,
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
      standalone: false,
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
      standalone: false,
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

  it('does not write multiple times if two sources of conflicting keys both update', async () => {
    let resultLog: Array<string | undefined> = [];
    @Component({
      template: '',
      standalone: false,
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
    fixture.detectChanges();
    await TestBed.inject(Router).navigateByUrl('/a');
    fixture.detectChanges();
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
    fixture.detectChanges();
    await TestBed.inject(Router).navigateByUrl('/a');
    fixture.detectChanges();
    expect(childTokenValue).toEqual('a value');
    await TestBed.inject(Router).navigateByUrl('/b');
    fixture.detectChanges();
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
    fixture.detectChanges();
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
      providers: [
        provideRouter([{path: '**', component: MyComponent}]),
        provideZonelessChangeDetection(),
      ],
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
      template: `{{outletData()}}|<router-outlet [routerOutletData]="'child'" />`,
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
      template: `{{outletData()}}|<router-outlet />`,
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

async function advance(fixture: ComponentFixture<unknown>, millis?: number): Promise<void> {
  if (millis) {
    await timeout(millis);
  }
  fixture.detectChanges();
}

async function createRoot<T>(router: Router, type: Type<T>): Promise<ComponentFixture<T>> {
  const f = TestBed.createComponent(type);
  await advance(f);
  router.initialNavigation();
  await advance(f);
  return f;
}
