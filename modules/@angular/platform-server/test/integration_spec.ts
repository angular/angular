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

@Component({selector: 'app', template: `Works too!`})
class MyServerApp2 {
}

@NgModule({declarations: [MyServerApp2], imports: [ServerModule], bootstrap: [MyServerApp2]})
class ExampleModule2 {
}

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

@Component({selector: 'app', template: `Works!`, styles: [':host { color: red; }']})
class MyStylesApp {
}

@NgModule({declarations: [MyStylesApp], imports: [ServerModule], bootstrap: [MyStylesApp]})
class ExampleStylesModule {
}

export function main() {
  if (getDOM().supportsDOMEvents()) return;  // NODE only

  describe('platform-server integration', () => {
    beforeEach(() => {
      if (getPlatform()) destroyPlatform();
    });

    it('should bootstrap', async(() => {
         const platform = platformDynamicServer(
             [{provide: INITIAL_CONFIG, useValue: {document: '<app></app>'}}]);

         platform.bootstrapModule(ExampleModule).then((moduleRef) => {
           const doc = moduleRef.injector.get(DOCUMENT);
           expect(getDOM().getText(doc)).toEqual('Works!');
           platform.destroy();
         });
       }));

    it('should allow multiple platform instances', async(() => {
         const platform = platformDynamicServer(
             [{provide: INITIAL_CONFIG, useValue: {document: '<app></app>'}}]);

         const platform2 = platformDynamicServer(
             [{provide: INITIAL_CONFIG, useValue: {document: '<app></app>'}}]);


         platform.bootstrapModule(ExampleModule).then((moduleRef) => {
           const doc = moduleRef.injector.get(DOCUMENT);
           expect(getDOM().getText(doc)).toEqual('Works!');
           platform.destroy();
         });

         platform2.bootstrapModule(ExampleModule2).then((moduleRef) => {
           const doc = moduleRef.injector.get(DOCUMENT);
           expect(getDOM().getText(doc)).toEqual('Works too!');
           platform2.destroy();
         });
       }));

    it('adds styles to the root component', async(() => {
         const platform = platformDynamicServer(
             [{provide: INITIAL_CONFIG, useValue: {document: '<app></app>'}}]);
         platform.bootstrapModule(ExampleStylesModule).then(ref => {
           const appRef: ApplicationRef = ref.injector.get(ApplicationRef);
           const app = appRef.components[0].location.nativeElement;
           expect(app.children.length).toBe(2);
           const style = app.children[1];
           expect(style.type).toBe('style');
           expect(style.children[0].data).toContain('color: red');
         });
       }));

    describe('PlatformLocation', () => {
      it('is injectable', async(() => {
           const platform = platformDynamicServer(
               [{provide: INITIAL_CONFIG, useValue: {document: '<app></app>'}}]);
           platform.bootstrapModule(ExampleModule).then(appRef => {
             const location: PlatformLocation = appRef.injector.get(PlatformLocation);
             expect(location.pathname).toBe('/');
             platform.destroy();
           });
         }));
      it('pushState causes the URL to update', async(() => {
           const platform = platformDynamicServer(
               [{provide: INITIAL_CONFIG, useValue: {document: '<app></app>'}}]);
           platform.bootstrapModule(ExampleModule).then(appRef => {
             const location: PlatformLocation = appRef.injector.get(PlatformLocation);
             location.pushState(null, 'Test', '/foo#bar');
             expect(location.pathname).toBe('/foo');
             expect(location.hash).toBe('#bar');
             platform.destroy();
           });
         }));
      it('allows subscription to the hash state', done => {
        const platform =
            platformDynamicServer([{provide: INITIAL_CONFIG, useValue: {document: '<app></app>'}}]);
        platform.bootstrapModule(ExampleModule).then(appRef => {
          const location: PlatformLocation = appRef.injector.get(PlatformLocation);
          expect(location.pathname).toBe('/');
          location.onHashChange((e: any) => {
            expect(e.type).toBe('hashchange');
            expect(e.oldUrl).toBe('/');
            expect(e.newUrl).toBe('/foo#bar');
            platform.destroy();
            done();
          });
          location.pushState(null, 'Test', '/foo#bar');
        });
      });
    });

    describe('render', () => {
      let doc: string;
      let called: boolean;
      let expectedOutput =
          '<html><head></head><body><app ng-version="0.0.0-PLACEHOLDER">Works!</app></body></html>';

      beforeEach(() => {
        // PlatformConfig takes in a parsed document so that it can be cached across requests.
        doc = '<html><head></head><body><app></app></body></html>';
        called = false;
      });
      afterEach(() => { expect(called).toBe(true); });

      it('using long from should work', async(() => {
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
                 platform.destroy();
                 called = true;
               });
         }));

      it('using renderModule should work', async(() => {
           renderModule(AsyncServerModule, {document: doc}).then(output => {
             expect(output).toBe(expectedOutput);
             called = true;
           });
         }));

      it('using renderModuleFactory should work',
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
  });
}
