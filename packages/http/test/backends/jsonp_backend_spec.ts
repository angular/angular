/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ReflectiveInjector} from '@angular/core';
import {AsyncTestCompleter, SpyObject, afterEach, beforeEach, describe, inject, it} from '@angular/core/testing/src/testing_internal';
import {expect} from '@angular/platform-browser/testing/src/matchers';
import {BrowserJsonp} from '../../src/backends/browser_jsonp';
import {JSONPBackend, JSONPBackend_, JSONPConnection, JSONPConnection_} from '../../src/backends/jsonp_backend';
import {BaseRequestOptions, RequestOptions} from '../../src/base_request_options';
import {BaseResponseOptions, ResponseOptions} from '../../src/base_response_options';
import {ReadyState, RequestMethod, ResponseType} from '../../src/enums';
import {Request} from '../../src/static_request';

let existingScripts: MockBrowserJsonp[] = [];

class MockBrowserJsonp extends BrowserJsonp {
  src: string;
  callbacks = new Map<string, (data: any) => any>();

  addEventListener(type: string, cb: (data: any) => any) { this.callbacks.set(type, cb); }

  removeEventListener(type: string, cb: Function) { this.callbacks.delete(type); }

  dispatchEvent(type: string, argument: any = {}) {
    const cb = this.callbacks.get(type);
    if (cb) {
      cb(argument);
    }
  }

  build(url: string) {
    const script = new MockBrowserJsonp();
    script.src = url;
    existingScripts.push(script);
    return script;
  }

  send(node: any) { /* noop */
  }
  cleanup(node: any) { /* noop */
  }
}

export function main() {
  describe('JSONPBackend', () => {
    let backend: JSONPBackend_;
    let sampleRequest: Request;

    beforeEach(() => {
      const injector = ReflectiveInjector.resolveAndCreate([
        {provide: ResponseOptions, useClass: BaseResponseOptions},
        {provide: BrowserJsonp, useClass: MockBrowserJsonp},
        {provide: JSONPBackend, useClass: JSONPBackend_}
      ]);
      backend = injector.get(JSONPBackend);
      const base = new BaseRequestOptions();
      sampleRequest =
          new Request(base.merge(new RequestOptions({url: 'https://google.com'})) as any);
    });

    afterEach(() => { existingScripts = []; });

    it('should create a connection', () => {
      let instance: JSONPConnection = undefined !;
      expect(() => instance = backend.createConnection(sampleRequest)).not.toThrow();
      expect(instance).toBeAnInstanceOf(JSONPConnection);
    });


    describe('JSONPConnection', () => {
      it('should use the injected BaseResponseOptions to create the response',
         inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
           const connection = new JSONPConnection_(
               sampleRequest, new MockBrowserJsonp(),
               new ResponseOptions({type: ResponseType.Error}));
           connection.response.subscribe(res => {
             expect(res.type).toBe(ResponseType.Error);
             async.done();
           });
           connection.finished();
           existingScripts[0].dispatchEvent('load');
         }));

      it('should ignore load/callback when disposed',
         inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
           const connection = new JSONPConnection_(sampleRequest, new MockBrowserJsonp());
           const spy = new SpyObject();
           const loadSpy = spy.spy('load');
           const errorSpy = spy.spy('error');
           const returnSpy = spy.spy('cancelled');

           const request = connection.response.subscribe(loadSpy, errorSpy, returnSpy);
           request.unsubscribe();

           connection.finished('Fake data');
           existingScripts[0].dispatchEvent('load');

           setTimeout(() => {
             expect(connection.readyState).toBe(ReadyState.Cancelled);
             expect(loadSpy).not.toHaveBeenCalled();
             expect(errorSpy).not.toHaveBeenCalled();
             expect(returnSpy).not.toHaveBeenCalled();
             async.done();
           }, 10);
         }));

      it('should report error if loaded without invoking callback',
         inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
           const connection = new JSONPConnection_(sampleRequest, new MockBrowserJsonp());
           connection.response.subscribe(
               res => {
                 expect('response listener called').toBe(false);
                 async.done();
               },
               err => {
                 expect(err.text()).toEqual('JSONP injected script did not invoke callback.');
                 async.done();
               });

           existingScripts[0].dispatchEvent('load');
         }));

      it('should report error if script contains error',
         inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
           const connection = new JSONPConnection_(sampleRequest, new MockBrowserJsonp());

           connection.response.subscribe(
               res => {
                 expect('response listener called').toBe(false);
                 async.done();
               },
               err => {
                 expect(err.text()).toBe('Oops!');
                 async.done();
               });

           existingScripts[0].dispatchEvent('error', ({message: 'Oops!'}));
         }));

      it('should throw if request method is not GET', () => {
        [RequestMethod.Post, RequestMethod.Put, RequestMethod.Delete, RequestMethod.Options,
         RequestMethod.Head, RequestMethod.Patch]
            .forEach(method => {
              const base = new BaseRequestOptions();
              const req = new Request(base.merge(
                  new RequestOptions({url: 'https://google.com', method: method})) as any);
              expect(() => new JSONPConnection_(req, new MockBrowserJsonp()).response.subscribe())
                  .toThrowError();
            });
      });

      it('should respond with data passed to callback',
         inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
           const connection = new JSONPConnection_(sampleRequest, new MockBrowserJsonp());

           connection.response.subscribe(res => {
             expect(res.json()).toEqual(({fake_payload: true, blob_id: 12345}));
             async.done();
           });

           connection.finished(({fake_payload: true, blob_id: 12345}));
           existingScripts[0].dispatchEvent('load');
         }));
    });
  });
}
