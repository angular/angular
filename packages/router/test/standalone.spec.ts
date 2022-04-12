/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Injectable, NgModule} from '@angular/core';
import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {Router} from '@angular/router';
import {RouterTestingModule} from '@angular/router/testing';

import {RouterModule} from '../src';

@Component({template: '<div>simple standalone</div>'})
export class SimpleStandaloneComponent {
}

@Component({template: '<router-outlet></router-outlet>'})
export class RootCmp {
}

describe('standalone in Router API', () => {
  describe('route providers', () => {
    it('can provide a guard on a route', fakeAsync(() => {
         @Injectable()
         class ConfigurableGuard {
           static canActivateValue = false;
           canActivate() {
             return ConfigurableGuard.canActivateValue;
           }
         }

         TestBed.configureTestingModule({
           imports: [
             RouterTestingModule.withRoutes([{
               path: 'simple',
               providers: [ConfigurableGuard],
               canActivate: [ConfigurableGuard],
               component: SimpleStandaloneComponent
             }]),
           ],
           declarations: [RootCmp],
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

    it('can inject provider on a route into component', fakeAsync(() => {
         @Injectable()
         class Service {
           value = 'my service';
         }

         @Component({template: `{{service.value}}`})
         class MyComponent {
           constructor(readonly service: Service) {}
         }

         TestBed.configureTestingModule({
           imports: [
             RouterTestingModule.withRoutes(
                 [{path: 'home', providers: [Service], component: MyComponent}]),
           ],
           declarations: [RootCmp, MyComponent],
         });
         const root = TestBed.createComponent(RootCmp);

         const router = TestBed.inject(Router);
         router.navigateByUrl('/home');
         advance(root);
         expect(root.nativeElement.innerHTML).toContain('my service');
         expect(router.url).toContain('home');
       }));

    it('can not inject provider in lazy loaded ngModule from component on same level',
       fakeAsync(() => {
         @Injectable()
         class Service {
           value = 'my service';
         }

         @NgModule({providers: [Service]})
         class LazyModule {
         }

         @Component({template: `{{service.value}}`})
         class MyComponent {
           constructor(readonly service: Service) {}
         }

         TestBed.configureTestingModule({
           imports: [
             RouterTestingModule.withRoutes(
                 [{path: 'home', loadChildren: () => LazyModule, component: MyComponent}]),
           ],
           declarations: [RootCmp, MyComponent],
         });
         const root = TestBed.createComponent(RootCmp);

         const router = TestBed.inject(Router);
         router.navigateByUrl('/home');
         expect(() => advance(root)).toThrowError();
       }));

    it('component from lazy module can inject provider from parent route', fakeAsync(() => {
         @Injectable()
         class Service {
           value = 'my service';
         }

         @Component({template: `{{service.value}}`})
         class MyComponent {
           constructor(readonly service: Service) {}
         }
         @NgModule({
           providers: [Service],
           declarations: [MyComponent],
           imports: [RouterModule.forChild([{path: '', component: MyComponent}])]
         })
         class LazyModule {
         }


         TestBed.configureTestingModule({
           imports: [
             RouterTestingModule.withRoutes([{path: 'home', loadChildren: () => LazyModule}]),
           ],
           declarations: [RootCmp],
         });
         const root = TestBed.createComponent(RootCmp);

         const router = TestBed.inject(Router);
         router.navigateByUrl('/home');
         advance(root);
         expect(root.nativeElement.innerHTML).toContain('my service');
       }));

    it('gets the correct injector for guards and components when combining lazy modules and route providers',
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

         @Component({template: `parent<router-outlet></router-outlet>`})
         class ParentCmp {
           constructor(readonly service: ServiceBase) {}
         }
         @Component({template: `child`})
         class ChildCmp {
           constructor(readonly service: ServiceBase) {}
         }

         @Component({template: `child2`})
         class ChildCmp2 {
           constructor(readonly service: ServiceBase) {}
         }
         @NgModule({
           providers: [{provide: ServiceBase, useClass: Service2}],
           declarations: [ChildCmp, ChildCmp2],
           imports: [RouterModule.forChild([
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
           ])]
         })
         class LazyModule {
         }


         TestBed.configureTestingModule({
           imports: [
             RouterTestingModule.withRoutes([{
               path: 'home',
               // This component and guard should get Service1 since it's provided on this route
               component: ParentCmp,
               canActivate: [ServiceBase],
               providers: [{provide: ServiceBase, useFactory: () => new Service1()}],
               loadChildren: () => LazyModule
             }]),
           ],
           declarations: [RootCmp, ParentCmp],
         });
         const root = TestBed.createComponent(RootCmp);

         const router = TestBed.inject(Router);
         router.navigateByUrl('/home');
         advance(root);
         expect(canActivateLog).toEqual(['service1', 'service2']);
         expect(root.debugElement.query(By.directive(ParentCmp)).componentInstance.service.name)
             .toEqual('service1');
         expect(root.debugElement.query(By.directive(ChildCmp)).componentInstance.service.name)
             .toEqual('service2');

         router.navigateByUrl('/home/child2');
         advance(root);
         expect(canActivateLog).toEqual(['service1', 'service2', 'service3']);
         expect(root.debugElement.query(By.directive(ChildCmp2)).componentInstance.service.name)
             .toEqual('service3');
       }));
  });
});

function advance(fixture: ComponentFixture<unknown>) {
  tick();
  fixture.detectChanges();
}
