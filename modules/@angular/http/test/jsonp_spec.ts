/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import 'rxjs/add/operator/mergeMap';

import {AsyncTestCompleter, SpyObject, afterEach, beforeEach, describe, inject, it} from '@angular/core/testing/testing_internal';
import {expect} from '@angular/platform-browser/testing/matchers';

import {JSONP_ERR_WRONG_METHOD, Jsonp, JsonpAdapter, JsonpBackend, JsonpInterceptor} from '../src/jsonp';
import {HttpRequest, HttpResponse} from '../src/request_response';


class MockBody {
  scripts: MockScript[] = [];

  appendChild(script: MockScript) { this.scripts.push(script); }

  removeChild(script: MockScript): void { script.removed = true; }
}

class MockScript {
  events: {[name: string]: Function} = {};
  src: string = '';
  removed: boolean = false;

  constructor(public body: MockBody) {}

  addEventListener(event: string, handler: Function): void { this.events[event] = handler; }

  removeEventListener(event: string, handler: Function): void {
    expect(this.events[event]).toBe(handler);
    delete this.events[event];
  }

  get parentNode(): MockBody { return this.body; }
}

class MockJsonpAdapter extends JsonpAdapter {
  mockBody: MockBody = new MockBody();
  callbacks: {[key: string]: Function} = {};

  createScript(): HTMLScriptElement {
    return new MockScript(this.mockBody) as any as HTMLScriptElement;
  }

  get body(): HTMLBodyElement { return this.mockBody as any as HTMLBodyElement; }

  get callbackMap(): {[key: string]: Function} { return this.callbacks; }
}

export function main() {
  describe('JsonpBackend', () => {
    let adapter: MockJsonpAdapter;
    let backend: JsonpBackend;

    beforeEach(() => {
      adapter = new MockJsonpAdapter();
      backend = new JsonpBackend(adapter);
    });

    it('throws when a request doesn\'t have a JSONP request method', () => {
      expect(() => backend.handle(new HttpRequest('http://google.com', {method: 'GET'})))
          .toThrowError(JSONP_ERR_WRONG_METHOD);
    });

    it('adds a script to the body when executed', () => {
      backend
          .handle(new HttpRequest('http://google.com?callback=JSONP_CALLBACK', {method: 'JSONP'}))
          .subscribe();
      expect(adapter.mockBody.scripts.length).toBe(1);
    });

    it('replaces JSONP_CALLBACK as the last parameter of the URL', () => {
      backend
          .handle(new HttpRequest('http://google.com?callback=JSONP_CALLBACK', {method: 'JSONP'}))
          .subscribe();
      expect(adapter.mockBody.scripts[0].src)
          .toBe('http://google.com?callback=__ng_jsonp__.__req0');
    });

    it('replaces JSONP_CALLBACK when it\'s not the last parameter of the URL', () => {
      backend
          .handle(new HttpRequest(
              'http://google.com?callback=JSONP_CALLBACK&other=hello+world', {method: 'JSONP'}))
          .subscribe();
      expect(adapter.mockBody.scripts[0].src)
          .toBe('http://google.com?callback=__ng_jsonp__.__req0&other=hello+world');
    });

    it('returns data as a response', inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         const response = {test: true};
         backend.handle(new HttpRequest('http://google.com', {method: 'JSONP'}))
             .mergeMap(res => res.json())
             .subscribe(data => {
               expect(data).toBe(response);
               async.done();
             });
         adapter.callbacks['__req0'](response);
         adapter.mockBody.scripts[0].events['load']();
       }));

    it('should ignore callbacks when disposed', () => {
      const spy = new SpyObject();
      const loadSpy = spy.spy('load');
      const errorSpy = spy.spy('error');
      const completeSpy = spy.spy('complete');
      const sub = backend.handle(new HttpRequest('http://google.com', {method: 'JSONP'}))
                      .subscribe(loadSpy, errorSpy, completeSpy);
      const load = adapter.mockBody.scripts[0].events['load'];
      const error = adapter.mockBody.scripts[0].events['error'];
      sub.unsubscribe();
      load();
      error({message: 'should not be seen'});
      expect(loadSpy).not.toHaveBeenCalled();
      expect(errorSpy).not.toHaveBeenCalled();
      expect(completeSpy).not.toHaveBeenCalled();
    });

    it('propagates error messages', inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         const response = {test: true};
         backend.handle(new HttpRequest('http://google.com', {method: 'JSONP'}))
             .subscribe(null, (err: HttpResponse) => {
               err.text().then(text => {
                 expect(text).toBe('an error has occurred');
                 async.done();
               });
             });
         adapter.mockBody.scripts[0].events['error'](new Error('an error has occurred'));
       }));
  });
}
