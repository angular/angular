/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule, NgForOf} from '@angular/common';
import {Component, Type} from '@angular/core';
import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {Router, RouterModule, RouterOutlet} from '@angular/router/src';
import {RouterTestingModule} from '@angular/router/testing';


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

       TestBed.configureTestingModule({
         imports:
             [RouterTestingModule.withRoutes([{path: '', outlet: 'popup', component: PopupCmp}])]
       });
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
         imports: [RouterTestingModule.withRoutes([
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
         imports: [RouterTestingModule.withRoutes([
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
