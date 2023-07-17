/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule, NgForOf} from '@angular/common';
import {Component, Input, Type} from '@angular/core';
import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {provideRouter, Router, RouterModule, RouterOutlet, withComponentInputBinding} from '@angular/router/src';
import {RouterTestingHarness} from '@angular/router/testing';


describe('router outlet name', () => {
  it('should support name binding', fakeAsync(() => {
       @Component({
         standalone: true,
         template: '<router-outlet [name]="name"></router-outlet>',
         imports: [RouterOutlet],
       })
       class RootCmp {
         name = 'popup';
       }

       @Component({
         template: 'popup component',
         standalone: true,
       })
       class PopupCmp {
       }

       TestBed.configureTestingModule(
           {imports: [RouterModule.forRoot([{path: '', outlet: 'popup', component: PopupCmp}])]});
       const router = TestBed.inject(Router);
       const fixture = createRoot(router, RootCmp);
       expect(fixture.nativeElement.innerHTML).toContain('popup component');
     }));

  it('should be able to change the name of the outlet', fakeAsync(() => {
       @Component({
         standalone: true,
         template: '<router-outlet [name]="name"></router-outlet>',
         imports: [RouterOutlet],
       })
       class RootCmp {
         name = '';
       }

       @Component({
         template: 'hello world',
         standalone: true,
       })
       class GreetingCmp {
       }

       @Component({
         template: 'goodbye cruel world',
         standalone: true,
       })
       class FarewellCmp {
       }

       TestBed.configureTestingModule({
         imports: [RouterModule.forRoot([
           {path: '', outlet: 'greeting', component: GreetingCmp},
           {path: '', outlet: 'farewell', component: FarewellCmp},
         ])]
       });
       const router = TestBed.inject(Router);
       const fixture = createRoot(router, RootCmp);

       expect(fixture.nativeElement.innerHTML).not.toContain('goodbye');
       expect(fixture.nativeElement.innerHTML).not.toContain('hello');

       fixture.componentInstance.name = 'greeting';
       advance(fixture);
       expect(fixture.nativeElement.innerHTML).toContain('hello');
       expect(fixture.nativeElement.innerHTML).not.toContain('goodbye');

       fixture.componentInstance.name = 'goodbye';
       advance(fixture);
       expect(fixture.nativeElement.innerHTML).toContain('goodbye');
       expect(fixture.nativeElement.innerHTML).not.toContain('hello');
     }));

  it('should support outlets in ngFor', fakeAsync(() => {
       @Component({
         standalone: true,
         template: `
            <div *ngFor="let outlet of outlets">
                <router-outlet [name]="outlet"></router-outlet>
            </div>
            `,
         imports: [RouterOutlet, NgForOf],
       })
       class RootCmp {
         outlets = ['outlet1', 'outlet2', 'outlet3'];
       }

       @Component({
         template: 'component 1',
         standalone: true,
       })
       class Cmp1 {
       }

       @Component({
         template: 'component 2',
         standalone: true,
       })
       class Cmp2 {
       }

       @Component({
         template: 'component 3',
         standalone: true,
       })
       class Cmp3 {
       }

       TestBed.configureTestingModule({
         imports: [RouterModule.forRoot([
           {path: '1', outlet: 'outlet1', component: Cmp1},
           {path: '2', outlet: 'outlet2', component: Cmp2},
           {path: '3', outlet: 'outlet3', component: Cmp3},
         ])]
       });
       const router = TestBed.inject(Router);
       const fixture = createRoot(router, RootCmp);

       router.navigate([{outlets: {'outlet1': '1'}}]);
       advance(fixture);
       expect(fixture.nativeElement.innerHTML).toContain('component 1');
       expect(fixture.nativeElement.innerHTML).not.toContain('component 2');
       expect(fixture.nativeElement.innerHTML).not.toContain('component 3');

       router.navigate([{outlets: {'outlet1': null, 'outlet2': '2', 'outlet3': '3'}}]);
       advance(fixture);
       expect(fixture.nativeElement.innerHTML).not.toContain('component 1');
       expect(fixture.nativeElement.innerHTML).toMatch('.*component 2.*component 3');

       // reverse the outlets
       fixture.componentInstance.outlets = ['outlet3', 'outlet2', 'outlet1'];
       router.navigate([{outlets: {'outlet1': '1', 'outlet2': '2', 'outlet3': '3'}}]);
       advance(fixture);
       expect(fixture.nativeElement.innerHTML).toMatch('.*component 3.*component 2.*component 1');
     }));

  it('should not activate if route is changed', fakeAsync(() => {
       @Component({
         standalone: true,
         template: '<div *ngIf="initDone"><router-outlet></router-outlet></div>',
         imports: [RouterOutlet, CommonModule],
       })
       class ParentCmp {
         initDone = false;
         constructor() {
           setTimeout(() => this.initDone = true, 1000);
         }
       }

       @Component({
         template: 'child component',
         standalone: true,
       })
       class ChildCmp {
       }

       TestBed.configureTestingModule({
         imports: [RouterModule.forRoot([
           {path: 'parent', component: ParentCmp, children: [{path: 'child', component: ChildCmp}]}
         ])]
       });
       const router = TestBed.inject(Router);
       const fixture = createRoot(router, ParentCmp);

       advance(fixture, 250);
       router.navigate(['parent/child']);
       advance(fixture, 250);
       // Not contain because initDone is still false
       expect(fixture.nativeElement.innerHTML).not.toContain('child component');

       advance(fixture, 1500);
       router.navigate(['parent']);
       advance(fixture, 1500);
       // Not contain because route was changed back to parent
       expect(fixture.nativeElement.innerHTML).not.toContain('child component');
     }));
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
      providers:
          [provideRouter([{path: '**', component: MyComponent}], withComponentInputBinding())]
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
    })
    class MyComponent {
      @Input() resolveA?: string;
      @Input() dataA?: string;
    }

    TestBed.configureTestingModule({
      providers: [provideRouter(
          [{
            path: '**',
            component: MyComponent,
            data: {'dataA': 'My static data'},
            resolve: {'resolveA': () => 'My resolved data'},
          }],
          withComponentInputBinding())]
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
      providers:
          [provideRouter([{path: '**', component: MyComponent}], withComponentInputBinding())]
    });
    const harness = await RouterTestingHarness.create();

    const instance = await harness.navigateByUrl('/x;language=english', MyComponent);
    expect(instance.language).toEqual('english');
  });

  it('when keys conflict, sets inputs based on priority: data > path params > query params',
     async () => {
       @Component({
         template: '',
       })
       class MyComponent {
         @Input() result?: string;
       }

       TestBed.configureTestingModule({
         providers: [provideRouter(
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
             withComponentInputBinding())]
       });
       const harness = await RouterTestingHarness.create();

       let instance = await harness.navigateByUrl(
           '/withData;result=from path param?result=from query params', MyComponent);
       expect(instance.result).toEqual('from data');

       // Same component, different instance because it's a different route
       instance = await harness.navigateByUrl(
           '/withoutData;result=from path param?result=from query params', MyComponent);
       expect(instance.result).toEqual('from path param');
       instance = await harness.navigateByUrl('/withoutData?result=from query params', MyComponent);
       expect(instance.result).toEqual('from query params');
     });

  it('does not write multiple times if two sources of conflicting keys both update', async () => {
    let resultLog: Array<string|undefined> = [];
    @Component({
      template: '',
    })
    class MyComponent {
      @Input()
      set result(v: string|undefined) {
        resultLog.push(v);
      }
    }

    TestBed.configureTestingModule({
      providers:
          [provideRouter([{path: '**', component: MyComponent}], withComponentInputBinding())]
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
      standalone: true,
    })
    class MyComponent {
      @Input() myInput?: string;
    }

    @Component({
      template: '<router-outlet/>',
      imports: [RouterOutlet],
      standalone: true,
    })
    class OutletWrapper {
    }

    TestBed.configureTestingModule({
      providers: [provideRouter(
          [{
            path: 'root',
            component: OutletWrapper,
            children: [
              {path: '**', component: MyComponent},
            ]
          }],
          withComponentInputBinding())]
    });
    const harness = await RouterTestingHarness.create('/root/child?myInput=1');
    expect(harness.routeNativeElement!.innerText).toBe('1');
    await harness.navigateByUrl('/root/child?myInput=2');
    expect(harness.routeNativeElement!.innerText).toBe('2');
  });
});

function advance(fixture: ComponentFixture<unknown>, millis?: number): void {
  tick(millis);
  fixture.detectChanges();
}

function createRoot<T>(router: Router, type: Type<T>): ComponentFixture<T> {
  const f = TestBed.createComponent(type);
  advance(f);
  router.initialNavigation();
  advance(f);
  return f;
}
