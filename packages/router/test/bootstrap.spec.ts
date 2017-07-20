/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {APP_BASE_HREF} from '@angular/common';
import {ApplicationRef, CUSTOM_ELEMENTS_SCHEMA, Component, NgModule, destroyPlatform} from '@angular/core';
import {inject} from '@angular/core/testing';
import {BrowserModule, DOCUMENT, ɵgetDOM as getDOM} from '@angular/platform-browser';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {NavigationEnd, Resolve, Router, RouterModule} from '@angular/router';


describe('bootstrap', () => {
  let log: any[] = [];
  let testProviders: any[] = null !;

  @Component({selector: 'test-app', template: 'root <router-outlet></router-outlet>'})
  class RootCmp {
    constructor() { log.push('RootCmp'); }
  }

  @Component({selector: 'test-app2', template: 'root <router-outlet></router-outlet>'})
  class SecondRootCmp {
  }

  class TestResolver implements Resolve<any> {
    resolve() {
      let resolve: any = null;
      const res = new Promise(r => resolve = r);
      setTimeout(() => resolve('test-data'), 0);
      return res;
    }
  }

  beforeEach(inject([DOCUMENT], (doc: any) => {
    destroyPlatform();

    const el1 = getDOM().createElement('test-app', doc);
    const el2 = getDOM().createElement('test-app2', doc);
    getDOM().appendChild(doc.body, el1);
    getDOM().appendChild(doc.body, el2);

    log = [];
    testProviders = [{provide: APP_BASE_HREF, useValue: ''}];
  }));

  afterEach(inject([DOCUMENT], (doc: any) => {
    const oldRoots = getDOM().querySelectorAll(doc, 'test-app,test-app2');
    for (let i = 0; i < oldRoots.length; i++) {
      getDOM().remove(oldRoots[i]);
    }
  }));

  it('should wait for resolvers to complete when initialNavigation = enabled', (done) => {
    @Component({selector: 'test', template: 'test'})
    class TestCmpEnabled {
    }

    @NgModule({
      imports: [
        BrowserModule, RouterModule.forRoot(
                           [{path: '**', component: TestCmpEnabled, resolve: {test: TestResolver}}],
                           {useHash: true, initialNavigation: 'enabled'})
      ],
      declarations: [RootCmp, TestCmpEnabled],
      bootstrap: [RootCmp],
      providers: [...testProviders, TestResolver],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    class TestModule {
      constructor(router: Router) {
        log.push('TestModule');
        router.events.subscribe(e => log.push(e.constructor.name));
      }
    }

    platformBrowserDynamic([]).bootstrapModule(TestModule).then(res => {
      const router = res.injector.get(Router);
      const data = router.routerState.snapshot.root.firstChild !.data;
      expect(data['test']).toEqual('test-data');
      expect(log).toEqual(
          ['TestModule', 'NavigationStart', 'RoutesRecognized', 'RootCmp', 'NavigationEnd']);
      done();
    });
  });

  it('should NOT wait for resolvers to complete when initialNavigation = legacy_enabled',
     (done) => {
       @Component({selector: 'test', template: 'test'})
       class TestCmpLegacyEnabled {
       }

       @NgModule({
         imports: [
           BrowserModule,
           RouterModule.forRoot(
               [{path: '**', component: TestCmpLegacyEnabled, resolve: {test: TestResolver}}],
               {useHash: true, initialNavigation: 'legacy_enabled'})
         ],
         declarations: [RootCmp, TestCmpLegacyEnabled],
         bootstrap: [RootCmp],
         providers: [...testProviders, TestResolver],
         schemas: [CUSTOM_ELEMENTS_SCHEMA]
       })
       class TestModule {
         constructor(router: Router) {
           log.push('TestModule');
           router.events.subscribe(e => log.push(e.constructor.name));
         }
       }

       platformBrowserDynamic([]).bootstrapModule(TestModule).then(res => {
         const router = res.injector.get(Router);
         expect(router.routerState.snapshot.root.firstChild).toBeNull();
         // NavigationEnd has not been emitted yet because bootstrap returned too early
         expect(log).toEqual(['TestModule', 'RootCmp', 'NavigationStart', 'RoutesRecognized']);

         router.events.subscribe((e) => {
           if (e instanceof NavigationEnd) {
             done();
           }
         });
       });
     });

  it('should not run navigation when initialNavigation = disabled', (done) => {
    @Component({selector: 'test', template: 'test'})
    class TestCmpDiabled {
    }

    @NgModule({
      imports: [
        BrowserModule, RouterModule.forRoot(
                           [{path: '**', component: TestCmpDiabled, resolve: {test: TestResolver}}],
                           {useHash: true, initialNavigation: 'disabled'})
      ],
      declarations: [RootCmp, TestCmpDiabled],
      bootstrap: [RootCmp],
      providers: [...testProviders, TestResolver],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    class TestModule {
      constructor(router: Router) {
        log.push('TestModule');
        router.events.subscribe(e => log.push(e.constructor.name));
      }
    }

    platformBrowserDynamic([]).bootstrapModule(TestModule).then(res => {
      const router = res.injector.get(Router);
      expect(log).toEqual(['TestModule', 'RootCmp']);
      done();
    });
  });

  it('should not run navigation when initialNavigation = legacy_disabled', (done) => {
    @Component({selector: 'test', template: 'test'})
    class TestCmpLegacyDisabled {
    }

    @NgModule({
      imports: [
        BrowserModule,
        RouterModule.forRoot(
            [{path: '**', component: TestCmpLegacyDisabled, resolve: {test: TestResolver}}],
            {useHash: true, initialNavigation: 'legacy_disabled'})
      ],
      declarations: [RootCmp, TestCmpLegacyDisabled],
      bootstrap: [RootCmp],
      providers: [...testProviders, TestResolver],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    class TestModule {
      constructor(router: Router) {
        log.push('TestModule');
        router.events.subscribe(e => log.push(e.constructor.name));
      }
    }

    platformBrowserDynamic([]).bootstrapModule(TestModule).then(res => {
      const router = res.injector.get(Router);
      expect(log).toEqual(['TestModule', 'RootCmp']);
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
