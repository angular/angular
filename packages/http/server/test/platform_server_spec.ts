/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Component, NgModule, NgZone, destroyPlatform, getPlatform} from '@angular/core';
import {async} from '@angular/core/testing';
import {Http, HttpModule, Response, ResponseOptions, XHRBackend} from '@angular/http';
import {ServerHttpModule} from '@angular/http/server';
import {MockBackend, MockConnection} from '@angular/http/testing';
import {getDOM} from '@angular/platform-browser/src/dom/dom_adapter';
import {INITIAL_CONFIG, ServerModule, platformDynamicServer} from '@angular/platform-server';

@Component({selector: 'app', template: `Works!`})
class MyServerApp {
}

@NgModule({
  bootstrap: [MyServerApp],
  declarations: [MyServerApp],
  imports: [ServerModule, ServerHttpModule],
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
  imports: [HttpModule, ServerHttpModule, ServerModule],
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
  imports: [ServerModule, HttpModule, ServerHttpModule],
  providers: [
    MockBackend,
    {provide: XHRBackend, useExisting: MockBackend},
  ]
})
export class HttpAfterExampleModule {
}

(function() {
  if (getDOM().supportsDOMEvents()) return;  // NODE only
  describe('platform-server integration', () => {
    beforeEach(() => {
      if (getPlatform()) destroyPlatform();
    });

    describe('http', () => {
      it('can inject Http', async(() => {
           const platform = platformDynamicServer(
               [{provide: INITIAL_CONFIG, useValue: {document: '<app></app>'}}]);
           platform.bootstrapModule(ExampleModule).then(ref => {
             expect(ref.injector.get(Http) instanceof Http).toBeTruthy();
           });
         }));

      it('can make Http requests', async(() => {
           const platform = platformDynamicServer(
               [{provide: INITIAL_CONFIG, useValue: {document: '<app></app>'}}]);
           platform.bootstrapModule(ExampleModule).then(ref => {
             const mock = ref.injector.get(MockBackend);
             const http = ref.injector.get(Http);
             ref.injector.get<NgZone>(NgZone).run(() => {
               NgZone.assertInAngularZone();
               mock.connections.subscribe((mc: MockConnection) => {
                 NgZone.assertInAngularZone();
                 expect(mc.request.url).toBe('http://localhost/testing');
                 mc.mockRespond(new Response(new ResponseOptions({body: 'success!', status: 200})));
               });
               http.get('http://localhost/testing').subscribe(resp => {
                 NgZone.assertInAngularZone();
                 expect(resp.text()).toBe('success!');
               });
             });
           });
         }));

      it('requests are macrotasks', async(() => {
           const platform = platformDynamicServer(
               [{provide: INITIAL_CONFIG, useValue: {document: '<app></app>'}}]);
           platform.bootstrapModule(ExampleModule).then(ref => {
             const mock = ref.injector.get(MockBackend);
             const http = ref.injector.get(Http);
             expect(ref.injector.get<NgZone>(NgZone).hasPendingMacrotasks).toBeFalsy();
             ref.injector.get<NgZone>(NgZone).run(() => {
               NgZone.assertInAngularZone();
               mock.connections.subscribe((mc: MockConnection) => {
                 expect(ref.injector.get<NgZone>(NgZone).hasPendingMacrotasks).toBeTruthy();
                 mc.mockRespond(new Response(new ResponseOptions({body: 'success!', status: 200})));
               });
               http.get('http://localhost/testing').subscribe(resp => {
                 expect(resp.text()).toBe('success!');
               });
             });
           });
         }));

      it('works when HttpModule is included before ServerModule', async(() => {
           const platform = platformDynamicServer(
               [{provide: INITIAL_CONFIG, useValue: {document: '<app></app>'}}]);
           platform.bootstrapModule(HttpBeforeExampleModule).then(ref => {
             const mock = ref.injector.get(MockBackend);
             const http = ref.injector.get(Http);
             expect(ref.injector.get<NgZone>(NgZone).hasPendingMacrotasks).toBeFalsy();
             ref.injector.get<NgZone>(NgZone).run(() => {
               NgZone.assertInAngularZone();
               mock.connections.subscribe((mc: MockConnection) => {
                 expect(ref.injector.get<NgZone>(NgZone).hasPendingMacrotasks).toBeTruthy();
                 mc.mockRespond(new Response(new ResponseOptions({body: 'success!', status: 200})));
               });
               http.get('http://localhost/testing').subscribe(resp => {
                 expect(resp.text()).toBe('success!');
               });
             });
           });
         }));

      it('works when HttpModule is included after ServerModule', async(() => {
           const platform = platformDynamicServer(
               [{provide: INITIAL_CONFIG, useValue: {document: '<app></app>'}}]);
           platform.bootstrapModule(HttpAfterExampleModule).then(ref => {
             const mock = ref.injector.get(MockBackend);
             const http = ref.injector.get(Http);
             expect(ref.injector.get<NgZone>(NgZone).hasPendingMacrotasks).toBeFalsy();
             ref.injector.get<NgZone>(NgZone).run(() => {
               NgZone.assertInAngularZone();
               mock.connections.subscribe((mc: MockConnection) => {
                 expect(ref.injector.get<NgZone>(NgZone).hasPendingMacrotasks).toBeTruthy();
                 mc.mockRespond(new Response(new ResponseOptions({body: 'success!', status: 200})));
               });
               http.get('http://localhost/testing').subscribe(resp => {
                 expect(resp.text()).toBe('success!');
               });
             });
           });
         }));

      it('throws when given a relative URL', async(() => {
           const platform = platformDynamicServer(
               [{provide: INITIAL_CONFIG, useValue: {document: '<app></app>'}}]);
           platform.bootstrapModule(ExampleModule).then(ref => {
             const http = ref.injector.get(Http);
             expect(() => http.get('/testing'))
                 .toThrowError(
                     'URLs requested via Http on the server must be absolute. URL: /testing');
           });
         }));
    });
  });
})();
