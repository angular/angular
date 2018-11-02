/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {Component, ContentChild, NgModule, TemplateRef, Type, ViewChild, ViewContainerRef} from '@angular/core';
import {ComponentFixture, TestBed, fakeAsync, tick} from '@angular/core/testing';
import {getDOM} from '@angular/platform-browser/src/dom/dom_adapter';
import {Router} from '@angular/router';
import {RouterTestingModule} from '@angular/router/testing';

describe('Integration', () => {

  describe('routerLinkActive', () => {
    it('should not cause infinite loops in the change detection - #15825', fakeAsync(() => {
         @Component({selector: 'simple', template: 'simple'})
         class SimpleCmp {
         }

         @Component({
           selector: 'some-root',
           template: `
        <div *ngIf="show">
          <ng-container *ngTemplateOutlet="tpl"></ng-container>
        </div>
        <router-outlet></router-outlet>
        <ng-template #tpl>
          <a routerLink="/simple" routerLinkActive="active"></a>
        </ng-template>`
         })
         class MyCmp {
           show: boolean = false;
         }

         @NgModule({
           imports: [CommonModule, RouterTestingModule],
           declarations: [MyCmp, SimpleCmp],
           entryComponents: [SimpleCmp],
         })
         class MyModule {
         }

         TestBed.configureTestingModule({imports: [MyModule]});

         const router: Router = TestBed.get(Router);
         const fixture = createRoot(router, MyCmp);
         router.resetConfig([{path: 'simple', component: SimpleCmp}]);

         router.navigateByUrl('/simple');
         advance(fixture);

         const instance = fixture.componentInstance;
         instance.show = true;
         expect(() => advance(fixture)).not.toThrow();
       }));

    it('should set isActive right after looking at its children -- #18983', fakeAsync(() => {
         @Component({
           template: `
          <div #rla="routerLinkActive" routerLinkActive>
            isActive: {{rla.isActive}}
            
            <ng-template let-data>
              <a [routerLink]="data">link</a>
            </ng-template>

            <ng-container #container></ng-container>
          </div>
        `
         })
         class ComponentWithRouterLink {
           // TODO(issue/24571): remove '!'.
           @ViewChild(TemplateRef) templateRef !: TemplateRef<any>;
           // TODO(issue/24571): remove '!'.
           @ViewChild('container', {read: ViewContainerRef}) container !: ViewContainerRef;

           addLink() {
             this.container.createEmbeddedView(this.templateRef, {$implicit: '/simple'});
           }

           removeLink() { this.container.clear(); }
         }

         @Component({template: 'simple'})
         class SimpleCmp {
         }

         TestBed.configureTestingModule({
           imports: [RouterTestingModule.withRoutes([{path: 'simple', component: SimpleCmp}])],
           declarations: [ComponentWithRouterLink, SimpleCmp]
         });

         const router: Router = TestBed.get(Router);
         const fixture = createRoot(router, ComponentWithRouterLink);
         router.navigateByUrl('/simple');
         advance(fixture);

         fixture.componentInstance.addLink();
         fixture.detectChanges();

         fixture.componentInstance.removeLink();
         advance(fixture);
         advance(fixture);

         expect(fixture.nativeElement.innerHTML).toContain('isActive: false');
       }));

  });

});

function advance<T>(fixture: ComponentFixture<T>): void {
  tick();
  fixture.detectChanges();
}

function createRoot<T>(router: Router, type: Type<T>): ComponentFixture<T> {
  const f = TestBed.createComponent(type);
  advance(f);
  router.initialNavigation();
  advance(f);
  return f;
}
