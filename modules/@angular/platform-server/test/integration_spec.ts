/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {PlatformLocation} from '@angular/common';
import {ApplicationRef, CompilerFactory, Component, NgModule, NgModuleRef, PlatformRef, destroyPlatform, getPlatform} from '@angular/core';
import {async, inject} from '@angular/core/testing';
import {DOCUMENT} from '@angular/platform-browser';
import {getDOM} from '@angular/platform-browser/src/dom/dom_adapter';
import {INITIAL_CONFIG, PlatformState, ServerModule, platformDynamicServer, renderModule, renderModuleFactory} from '@angular/platform-server';
import {Subscription} from 'rxjs/Subscription';
import {filter} from 'rxjs/operator/filter';
import {first} from 'rxjs/operator/first';
import {toPromise} from 'rxjs/operator/toPromise';

@Component({selector: 'app', template: `Works!`})
class MyServerApp {
}

@NgModule({declarations: [MyServerApp], imports: [ServerModule], bootstrap: [MyServerApp]})
class ExampleModule {
}

export function main() {
  if (getDOM().supportsDOMEvents()) return;  // NODE only

  describe('platform-server integration', () => {

    beforeEach(() => destroyPlatform());
    afterEach(() => destroyPlatform());

    it('should bootstrap', async(() => {
         platformDynamicServer([{provide: INITIAL_CONFIG, useValue: {document: '<app></app>'}}])
             .bootstrapModule(ExampleModule)
             .then((moduleRef) => {
               const doc = moduleRef.injector.get(DOCUMENT);
               expect(getDOM().getText(doc)).toEqual('Works!');
             });
       }));

    describe('PlatformLocation', () => {
      it('is injectable', () => {
        platformDynamicServer([{provide: INITIAL_CONFIG, useValue: {document: '<app></app>'}}])
            .bootstrapModule(ExampleModule)
            .then(appRef => {
              const location: PlatformLocation = appRef.injector.get(PlatformLocation);
              expect(location.pathname).toBe('/');
            });
      });
      it('pushState causes the URL to update', () => {
        platformDynamicServer([{provide: INITIAL_CONFIG, useValue: {document: '<app></app>'}}])
            .bootstrapModule(ExampleModule)
            .then(appRef => {
              const location: PlatformLocation = appRef.injector.get(PlatformLocation);
              location.pushState(null, 'Test', '/foo#bar');
              expect(location.pathname).toBe('/foo');
              expect(location.hash).toBe('#bar');
            });
      });
      it('allows subscription to the hash state', done => {
        platformDynamicServer([{provide: INITIAL_CONFIG, useValue: {document: '<app></app>'}}])
            .bootstrapModule(ExampleModule)
            .then(appRef => {
              const location: PlatformLocation = appRef.injector.get(PlatformLocation);
              expect(location.pathname).toBe('/');
              location.onHashChange((e: any) => {
                expect(e.type).toBe('hashchange');
                expect(e.oldUrl).toBe('/');
                expect(e.newUrl).toBe('/foo#bar');
                done();
              });
              location.pushState(null, 'Test', '/foo#bar');
            });
      });
    });
  });

  describe('Platform Server', () => {
    @Component({selector: 'app', template: '{{text}}'})
    class MyAsyncServerApp {
      text = '';

      ngOnInit() {
        Promise.resolve(null).then(() => setTimeout(() => { this.text = 'Works!'; }, 10));
      }
    }

    @NgModule(
        {declarations: [MyAsyncServerApp], imports: [ServerModule], bootstrap: [MyAsyncServerApp]})
    class AsyncServerModule {
    }

    let doc: string;
    let called: boolean;
    let expectedOutput =
        '<html><head></head><body><app ng-version="0.0.0-PLACEHOLDER">Works!</app></body></html>';

    beforeEach(() => {
      destroyPlatform();
      // PlatformConfig takes in a parsed document so that it can be cached across requests.
      doc = '<html><head></head><body><app></app></body></html>';
      called = false;
    });
    afterEach(() => {
      expect(called).toBe(true);
      // Platform should have been destroyed at the end of rendering.
      expect(getPlatform()).toBeNull();
    });

    it('PlatformState should render to string (Long form rendering)', async(() => {
         const platform =
             platformDynamicServer([{provide: INITIAL_CONFIG, useValue: {document: doc}}]);

         platform.bootstrapModule(AsyncServerModule)
             .then((moduleRef) => {
               const applicationRef: ApplicationRef = moduleRef.injector.get(ApplicationRef);
               return toPromise.call(first.call(
                   filter.call(applicationRef.isStable, (isStable: boolean) => isStable)));
             })
             .then((b) => {
               expect(platform.injector.get(PlatformState).renderToString()).toBe(expectedOutput);
               destroyPlatform();
               called = true;
             });
       }));

    it('renderModule should render to string (short form rendering)', async(() => {
         renderModule(AsyncServerModule, {document: doc}).then(output => {
           expect(output).toBe(expectedOutput);
           called = true;
         });
       }));

    it('renderModuleFactory should render to string (short form rendering)',
       async(inject([PlatformRef], (defaultPlatform: PlatformRef) => {
         const compilerFactory: CompilerFactory =
             defaultPlatform.injector.get(CompilerFactory, null);
         const moduleFactory =
             compilerFactory.createCompiler().compileModuleSync(AsyncServerModule);
         renderModuleFactory(moduleFactory, {document: doc}).then(output => {
           expect(output).toBe(expectedOutput);
           called = true;
         });
       })));
  });
}
