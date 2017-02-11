/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {PlatformLocation} from '@angular/common';
import {Component, NgModule, NgZone, destroyPlatform} from '@angular/core';
import {async} from '@angular/core/testing';
import {Http, HttpModule, Response, ResponseOptions, XHRBackend} from '@angular/http';
import {MockBackend, MockConnection} from '@angular/http/testing';
import {getDOM} from '@angular/platform-browser/src/dom/dom_adapter';
import {ServerModule, platformDynamicServer} from '@angular/platform-server';

function writeBody(html: string): any {
  const dom = getDOM();
  const doc = dom.defaultDoc();
  const body = dom.querySelector(doc, 'body');
  dom.setInnerHTML(body, html);
  return body;
}

const consoleLog = console.log.bind(console);

@Component({selector: 'app', template: `Works!`})
class MyServerApp {
}

@NgModule({
  bootstrap: [MyServerApp],
  declarations: [MyServerApp],
  imports: [ServerModule],
  providers: [
    MockBackend,
    {provide: XHRBackend, useExisting: MockBackend},
  ]
})
class ExampleModule {
}

@NgModule({
  bootstrap: [MyServerApp],
  declarations: [MyServerApp],
  imports: [HttpModule, ServerModule],
  providers: [
    MockBackend,
    {provide: XHRBackend, useExisting: MockBackend},
  ]
})
export class HttpBeforeExampleModule {
}

@NgModule({
  bootstrap: [MyServerApp],
  declarations: [MyServerApp],
  imports: [ServerModule, HttpModule],
  providers: [
    MockBackend,
    {provide: XHRBackend, useExisting: MockBackend},
  ]
})
export class HttpAfterExampleModule {
}

export function main() {
  if (getDOM().supportsDOMEvents()) return;  // NODE only

  describe('platform-server integration', () => {

    beforeEach(() => destroyPlatform());
    afterEach(() => destroyPlatform());

    it('should bootstrap', async(() => {
         const body = writeBody('<app></app>');
         platformDynamicServer().bootstrapModule(ExampleModule).then(() => {
           expect(getDOM().getText(body)).toEqual('Works!');
         });
       }));

    describe('PlatformLocation', () => {
      it('is injectable', () => {
        const body = writeBody('<app></app>');
        platformDynamicServer().bootstrapModule(ExampleModule).then(appRef => {
          const location: PlatformLocation = appRef.injector.get(PlatformLocation);
          expect(location.pathname).toBe('/');
        });
      });
      it('pushState causes the URL to update', () => {
        const body = writeBody('<app></app>');
        platformDynamicServer().bootstrapModule(ExampleModule).then(appRef => {
          const location: PlatformLocation = appRef.injector.get(PlatformLocation);
          location.pushState(null, 'Test', '/foo#bar');
          expect(location.pathname).toBe('/foo');
          expect(location.hash).toBe('#bar');
        });
      });
      it('allows subscription to the hash state', done => {
        const body = writeBody('<app></app>');
        platformDynamicServer().bootstrapModule(ExampleModule).then(appRef => {
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

    describe('http', () => {
      it('can inject Http', async(() => {
           const body = writeBody('<app></app>');
           platformDynamicServer().bootstrapModule(ExampleModule).then(ref => {
             expect(ref.injector.get(Http) instanceof Http).toBeTruthy();
           });
         }));
      it('can make Http requests', async(() => {
           const body = writeBody('<app></app>');
           platformDynamicServer().bootstrapModule(ExampleModule).then(ref => {
             const mock = ref.injector.get(MockBackend);
             const http = ref.injector.get(Http);
             ref.injector.get(NgZone).run(() => {
               NgZone.assertInAngularZone();
               mock.connections.subscribe((mc: MockConnection) => {
                 NgZone.assertInAngularZone();
                 expect(mc.request.url).toBe('/testing');
                 mc.mockRespond(new Response(new ResponseOptions({body: 'success!', status: 200})));
               });
               http.get('/testing').subscribe(resp => {
                 NgZone.assertInAngularZone();
                 expect(resp.text()).toBe('success!');
               });
             });
           });
         }));
      it('requests are macrotasks', async(() => {
           const body = writeBody('<app></app>');
           platformDynamicServer().bootstrapModule(ExampleModule).then(ref => {
             const mock = ref.injector.get(MockBackend);
             const http = ref.injector.get(Http);
             expect(ref.injector.get(NgZone).hasPendingMacrotasks).toBeFalsy();
             ref.injector.get(NgZone).run(() => {
               NgZone.assertInAngularZone();
               mock.connections.subscribe((mc: MockConnection) => {
                 expect(ref.injector.get(NgZone).hasPendingMacrotasks).toBeTruthy();
                 mc.mockRespond(new Response(new ResponseOptions({body: 'success!', status: 200})));
               });
               http.get('/testing').subscribe(resp => { expect(resp.text()).toBe('success!'); });
             });
           });
         }));
      it('works when HttpModule is included before ServerModule', async(() => {
           const body = writeBody('<app></app>');
           platformDynamicServer().bootstrapModule(HttpBeforeExampleModule).then(ref => {
             const mock = ref.injector.get(MockBackend);
             const http = ref.injector.get(Http);
             expect(ref.injector.get(NgZone).hasPendingMacrotasks).toBeFalsy();
             ref.injector.get(NgZone).run(() => {
               NgZone.assertInAngularZone();
               mock.connections.subscribe((mc: MockConnection) => {
                 expect(ref.injector.get(NgZone).hasPendingMacrotasks).toBeTruthy();
                 mc.mockRespond(new Response(new ResponseOptions({body: 'success!', status: 200})));
               });
               http.get('/testing').subscribe(resp => { expect(resp.text()).toBe('success!'); });
             });
           });
         }));
      it('works when HttpModule is included after ServerModule', async(() => {
           const body = writeBody('<app></app>');
           platformDynamicServer().bootstrapModule(HttpAfterExampleModule).then(ref => {
             const mock = ref.injector.get(MockBackend);
             const http = ref.injector.get(Http);
             expect(ref.injector.get(NgZone).hasPendingMacrotasks).toBeFalsy();
             ref.injector.get(NgZone).run(() => {
               NgZone.assertInAngularZone();
               mock.connections.subscribe((mc: MockConnection) => {
                 expect(ref.injector.get(NgZone).hasPendingMacrotasks).toBeTruthy();
                 mc.mockRespond(new Response(new ResponseOptions({body: 'success!', status: 200})));
               });
               http.get('/testing').subscribe(resp => { expect(resp.text()).toBe('success!'); });
             });
           });
         }));
    });
  });
}
