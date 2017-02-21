/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {APP_BASE_HREF} from '@angular/common';
import {ApplicationRef, CUSTOM_ELEMENTS_SCHEMA, Component, NgModule, destroyPlatform} from '@angular/core';
import {BrowserModule, DOCUMENT} from '@angular/platform-browser';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {getDOM} from '@angular/platform-browser/src/dom/dom_adapter';
import {Resolve, Router, RouterModule} from '@angular/router';

describe('bootstrap', () => {

  @Component({selector: 'test-app', template: 'root <router-outlet></router-outlet>'})
  class RootCmp {
  }

  @Component({selector: 'test-app2', template: 'root <router-outlet></router-outlet>'})
  class SecondRootCmp {
  }

  @Component({selector: 'test', template: 'test'})
  class TestCmp {
  }

  class TestResolver implements Resolve<any> {
    resolve() {
      let resolve: any = null;
      const res = new Promise(r => resolve = r);
      setTimeout(() => resolve('test-data'), 0);
      return res;
    }
  }

  let testProviders: any[] = null;

  beforeEach(() => {
    destroyPlatform();
    const fakeDoc = getDOM().createHtmlDocument();
    const el1 = getDOM().createElement('test-app', fakeDoc);
    const el2 = getDOM().createElement('test-app2', fakeDoc);
    getDOM().appendChild(fakeDoc.body, el1);
    getDOM().appendChild(fakeDoc.body, el2);
    testProviders =
        [{provide: DOCUMENT, useValue: fakeDoc}, {provide: APP_BASE_HREF, useValue: ''}];
  });

  it('should wait for resolvers to complete', (done) => {
    @NgModule({
      imports: [
        BrowserModule,
        RouterModule.forRoot(
            [{path: '**', component: TestCmp, resolve: {test: TestResolver}}], {useHash: true})
      ],
      declarations: [SecondRootCmp, RootCmp, TestCmp],
      bootstrap: [RootCmp],
      providers: [...testProviders, TestResolver],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    class TestModule {
    }

    platformBrowserDynamic([]).bootstrapModule(TestModule).then(res => {
      const router = res.injector.get(Router);
      const data = router.routerState.snapshot.root.firstChild.data;
      expect(data['test']).toEqual('test-data');
      done();
    });
  });

  it('should not init router navigation listeners if a non root component is bootstrapped',
     (done) => {
       @NgModule({
         imports: [BrowserModule, RouterModule.forRoot([], {useHash: true})],
         declarations: [SecondRootCmp, RootCmp],
         entryComponents: [SecondRootCmp],
         bootstrap: [RootCmp],
         providers: testProviders,
         schemas: [CUSTOM_ELEMENTS_SCHEMA]
       })
       class TestModule {
       }

       platformBrowserDynamic([]).bootstrapModule(TestModule).then(res => {
         const router = res.injector.get(Router);
         spyOn(router, 'resetRootComponentType').and.callThrough();

         const appRef: ApplicationRef = res.injector.get(ApplicationRef);
         appRef.bootstrap(SecondRootCmp);

         expect(router.resetRootComponentType).not.toHaveBeenCalled();

         done();
       });
     });

  it('should reinit router navigation listeners if a previously bootstrapped root component is destroyed',
     (done) => {
       @NgModule({
         imports: [BrowserModule, RouterModule.forRoot([], {useHash: true})],
         declarations: [SecondRootCmp, RootCmp],
         entryComponents: [SecondRootCmp],
         bootstrap: [RootCmp],
         providers: testProviders,
         schemas: [CUSTOM_ELEMENTS_SCHEMA]
       })
       class TestModule {
       }

       platformBrowserDynamic([]).bootstrapModule(TestModule).then(res => {
         const router = res.injector.get(Router);
         spyOn(router, 'resetRootComponentType').and.callThrough();

         const appRef: ApplicationRef = res.injector.get(ApplicationRef);
         appRef.components[0].onDestroy(() => {
           appRef.bootstrap(SecondRootCmp);
           expect(router.resetRootComponentType).toHaveBeenCalled();
           done();
         });

         appRef.components[0].destroy();
       });
     });
});
