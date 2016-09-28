/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ReflectiveInjector} from '@angular/core';
import {AsyncTestCompleter, SpyObject, afterEach, beforeEach, describe, inject, it} from '@angular/core/testing/testing_internal';
import {expect} from '@angular/platform-browser/testing/matchers';
import {BrowserJsonp} from '../../src/backends/browser_jsonp';
import {JSONPBackend, JSONPBackend_, JSONPConnection, JSONPConnection_} from '../../src/backends/jsonp_backend';
import {BaseRequestOptions, RequestOptions} from '../../src/base_request_options';
import {BaseResponseOptions, ResponseOptions} from '../../src/base_response_options';
import {ReadyState, RequestMethod, ResponseType} from '../../src/enums';
import {isPresent} from '../../src/facade/lang';
import {Request} from '../../src/static_request';

var existingScripts: MockBrowserJsonp[] = [];

class MockBrowserJsonp extends BrowserJsonp {
  src: string;
  callbacks = new Map<string, (data: any) => any>();
  constructor() { super(); }

  addEventListener(type: string, cb: (data: any) => any) { this.callbacks.set(type, cb); }

  removeEventListener(type: string, cb: Function) { this.callbacks.delete(type); }

  dispatchEvent(type: string, argument?: any) {
    if (!isPresent(argument)) {
      argument = {};
    }
    let cb = this.callbacks.get(type);
    if (isPresent(cb)) {
      cb(argument);
    }
  }

  build(url: string) {
    var script = new MockBrowserJsonp();
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
      let injector = ReflectiveInjector.resolveAndCreate([
        {provide: ResponseOptions, useClass: BaseResponseOptions},
        {provide: BrowserJsonp, useClass: MockBrowserJsonp},
        {provide: JSONPBackend, useClass: JSONPBackend_}
      ]);
      backend = injector.get(JSONPBackend);
      let base = new BaseRequestOptions();
      sampleRequest = new Request(base.merge(new RequestOptions({url: 'https://google.com'})));
    });

    afterEach(() => { existingScripts = []; });

    it('should create a connection', () => {
      var instance: JSONPConnection;
      expect(() => instance = backend.createConnection(sampleRequest)).not.toThrow();
      expect(instance).toBeAnInstanceOf(JSONPConnection);
    });


    describe('JSONPConnection', () => {
      it('should use the injected BaseResponseOptions to create the response',
         inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
           let connection = new JSONPConnection_(
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
           var connection = new JSONPConnection_(sampleRequest, new MockBrowserJsonp());
           let spy = new SpyObject();
           let loadSpy = spy.spy('load');
           let errorSpy = spy.spy('error');
           let returnSpy = spy.spy('cancelled');

           let request = connection.response.subscribe(loadSpy, errorSpy, returnSpy);
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
           let connection = new JSONPConnection_(sampleRequest, new MockBrowserJsonp());
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
           let connection = new JSONPConnection_(sampleRequest, new MockBrowserJsonp());

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
              let base = new BaseRequestOptions();
              let req = new Request(
                  base.merge(new RequestOptions({url: 'https://google.com', method: method})));
              expect(() => new JSONPConnection_(req, new MockBrowserJsonp()).response.subscribe())
                  .toThrowError();
            });
      });

      it('should respond with data passed to callback',
         inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
           let connection = new JSONPConnection_(sampleRequest, new MockBrowserJsonp());

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
