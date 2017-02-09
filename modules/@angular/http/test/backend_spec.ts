/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import 'rxjs/add/operator/mergeMap';

import {AsyncTestCompleter, SpyObject, afterEach, beforeEach, beforeEachProviders, describe, expect, inject, it} from '@angular/core/testing/testing_internal';

import {XhrAdapter, XhrBackend} from '../src/backend';
import {HttpHeaders} from '../src/headers';
import {HttpRequest, HttpResponse} from '../src/request_response';


let abortSpy: any;
let sendSpy: any;
let openSpy: any;
let setRequestHeaderSpy: any;
let existingXHRs: MockBrowserXHR[] = [];

class MockBrowserXHR implements XhrAdapter {
  abort: any;
  send: any;
  open: any;
  response: any;
  responseType: string;
  responseText: string;
  setRequestHeader: any;
  callbacks = new Map<string, Function>();
  status: number;
  responseHeaders: string;
  responseURL: string;
  statusText: string;
  withCredentials: boolean;

  constructor() {
    const spy = new SpyObject();
    this.abort = abortSpy = spy.spy('abort');
    this.send = sendSpy = spy.spy('send');
    this.open = openSpy = spy.spy('open');
    this.setRequestHeader = setRequestHeaderSpy = spy.spy('setRequestHeader');
    // If responseType is supported by the browser, then it should be set to an empty string.
    // (https://www.w3.org/TR/XMLHttpRequest/#the-responsetype-attribute)
    this.responseType = '';
  }

  setStatusCode(status: number) { this.status = status; }

  setStatusText(statusText: string) { this.statusText = statusText; }

  setResponse(value: string) { this.response = value; }

  setResponseText(value: string) { this.responseText = value; }

  setResponseURL(value: string) { this.responseURL = value; }

  setResponseHeaders(value: string) { this.responseHeaders = value; }

  getAllResponseHeaders() { return this.responseHeaders || ''; }

  getResponseHeader(key: string) {
    return HttpHeaders.fromResponseHeaderString(this.responseHeaders).get(key);
  }

  addEventListener(type: string, cb: Function) { this.callbacks.set(type, cb); }

  removeEventListener(type: string, cb: Function) { this.callbacks.delete(type); }

  dispatchEvent(type: string) { this.callbacks.get(type)({}); }

  newXhr(): XMLHttpRequest {
    const xhr = new MockBrowserXHR();
    existingXHRs.push(xhr);
    return xhr as any as XMLHttpRequest;
  }
}

export function main() {
  describe('XhrBackend', () => {
    let backend: XhrBackend;
    let sampleRequest: HttpRequest;

    beforeEachProviders(() => [{provide: XhrAdapter, useClass: MockBrowserXHR}, XhrBackend, ]);

    beforeEach(inject([XhrBackend], (be: XhrBackend) => {
      backend = be;
      sampleRequest = new HttpRequest('https://google.com');
    }));

    afterEach(() => { existingXHRs = []; });
    it('should complete a request', inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         backend.handle(sampleRequest)
             .subscribe(res => expect(res.ok).toBeTruthy(), null, () => async.done());
         existingXHRs[0].setStatusCode(200);
         existingXHRs[0].dispatchEvent('load');
       }));

    it('should call abort when disposed', () => {
      const request = backend.handle(sampleRequest).subscribe();
      request.unsubscribe();
      expect(abortSpy).toHaveBeenCalled();
    });

    it('should create an error Response on error',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         backend.handle(sampleRequest).subscribe(null, res => {
           expect(res.ok).toBeFalsy();
           async.done();
         });
         existingXHRs[0].setStatusCode(500);
         existingXHRs[0].dispatchEvent('error');
       }));

    it('should set the status text and status code on error',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         backend.handle(sampleRequest).subscribe(null, res => {
           expect(res.ok).toBeFalsy();
           expect(res.status).toEqual(0);
           expect(res.statusText).toEqual('');
           async.done();
         });
         const xhr = existingXHRs[0];
         // status=0 with a text='' is common for CORS errors
         xhr.setStatusCode(0);
         xhr.setStatusText('');
         xhr.dispatchEvent('error');
       }));

    it('should call open with method and url when subscribed to', () => {
      const obs = backend.handle(sampleRequest);
      expect(openSpy).not.toHaveBeenCalled();
      obs.subscribe();
      expect(openSpy).toHaveBeenCalledWith('GET', sampleRequest.url);
    });

    it('should call send on the backend with request body when subscribed to',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         const body = 'Some body to love';
         const obs = backend.handle(new HttpRequest('http://google.com', {method: 'POST', body}));
         expect(sendSpy).not.toHaveBeenCalled();
         obs.subscribe();
         expect(sendSpy).toHaveBeenCalledWith(body);
         async.done();
       }));

    it('should attach headers to the request', () => {
      const headers =
          new HttpHeaders({'Content-Type': 'text/xml', 'Breaking-Bad': '<3', 'X-Multi': 'a'});
      headers.append('X-Multi', 'b');
      const req = new HttpRequest('http://google.com', {headers});
      backend.handle(req).subscribe();
      expect(setRequestHeaderSpy).toHaveBeenCalledWith('Content-Type', 'text/xml');
      expect(setRequestHeaderSpy).toHaveBeenCalledWith('Breaking-Bad', '<3');
      expect(setRequestHeaderSpy).toHaveBeenCalledWith('X-Multi', 'a,b');
    });

    it('should not override user provided Accept header', () => {
      const req =
          new HttpRequest('http://google.com', {headers: new HttpHeaders({'Accept': 'text/xml'})});
      backend.handle(req).subscribe();
      expect(setRequestHeaderSpy).toHaveBeenCalledWith('Accept', 'text/xml');
    });

    it('should return the correct status code',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         const statusCode = 418;
         backend.handle(sampleRequest).subscribe(null, err => {
           expect(err.status).toBe(statusCode);
           async.done();
         });
         existingXHRs[0].setStatusCode(statusCode);
         existingXHRs[0].dispatchEvent('load');
       }));

    it('should call next and complete on 200 codes',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         let nextCalled = false;
         let errorCalled = false;
         const statusCode = 200;

         backend.handle(sampleRequest)
             .subscribe(
                 res => {
                   nextCalled = true;
                   expect(res.status).toBe(statusCode);
                 },
                 errRes => async.fail('Error handler called'),
                 () => {
                   expect(nextCalled).toBeTruthy();
                   async.done();
                 });

         existingXHRs[0].setStatusCode(statusCode);
         existingXHRs[0].dispatchEvent('load');
       }));

    it('should set ok to true on 200 return',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         backend.handle(sampleRequest).subscribe(res => {
           expect(res.ok).toBeTruthy();
           async.done();
         });

         existingXHRs[0].setStatusCode(200);
         existingXHRs[0].dispatchEvent('load');
       }));

    it('should set ok to false on 300 return',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         const statusCode = 300;

         backend.handle(sampleRequest)
             .subscribe(res => async.fail('should not be called'), errRes => {
               expect(errRes.ok).toBeFalsy();
               async.done();
             });

         existingXHRs[0].setStatusCode(statusCode);
         existingXHRs[0].dispatchEvent('load');
       }));

    it('should call error and not complete on 300+ codes',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         let nextCalled = false;
         const errorCalled = false;
         const statusCode = 301;

         backend.handle(sampleRequest)
             .subscribe(
                 res => nextCalled = true,
                 errRes => {
                   expect(errRes.status).toBe(statusCode);
                   expect(nextCalled).toBeFalsy();
                   async.done();
                 },
                 () => { throw 'should not be called'; });

         existingXHRs[0].setStatusCode(statusCode);
         existingXHRs[0].dispatchEvent('load');
       }));

    it('should normalize IE\'s 1223 status code into 204',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         const statusCode = 1223;
         const normalizedCode = 204;
         backend.handle(sampleRequest).subscribe(res => {
           expect(res.status).toBe(normalizedCode);
           async.done();
         });

         existingXHRs[0].setStatusCode(statusCode);
         existingXHRs[0].dispatchEvent('load');
       }));

    it('should ignore response body for 204 status code',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         backend.handle(sampleRequest).mergeMap(res => res.text()).subscribe(text => {
           expect(text).toBe('');
           async.done();
         });

         existingXHRs[0].setStatusCode(204);
         existingXHRs[0].setResponseText('Doge');
         existingXHRs[0].dispatchEvent('load');
       }));

    it('should normalize responseText and response',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         const responseBody = 'Doge';
         const obs = backend.handle(sampleRequest).mergeMap(res => res.text());
         obs.subscribe(text1 => {
           expect(text1).toBe(responseBody);
           obs.subscribe(text2 => {
             expect(text2).toBe(responseBody);
             async.done();
           });
           existingXHRs[1].setStatusCode(200);
           existingXHRs[1].setResponse(responseBody);
           existingXHRs[1].dispatchEvent('load');
         });
         existingXHRs[0].setStatusCode(200);
         existingXHRs[0].setResponseText(responseBody);
         existingXHRs[0].dispatchEvent('load');
       }));

    it('should strip XSSI prefixes', inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         backend.handle(sampleRequest).mergeMap(req => req.text()).subscribe(text => {
           expect(text).toBe('{json: "object"}');
           async.done();
         });
         existingXHRs[0].setStatusCode(200);
         existingXHRs[0].setResponseText(')]}\'\n{json: "object"}');
         existingXHRs[0].dispatchEvent('load');
       }));

    it('should strip XSSI prefix from errors',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         backend.handle(sampleRequest).subscribe(null, (res: HttpResponse) => {
           res.text().then(text => {
             expect(text).toBe('{json: "object"}');
             async.done();
           });
         });
         existingXHRs[0].setStatusCode(404);
         existingXHRs[0].setResponseText(')]}\'\n{json: "object"}');
         existingXHRs[0].dispatchEvent('load');
       }));

    it('should parse response headers and add them to the response',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         const responseHeaderString = `Date: Fri, 20 Nov 2015 01:45:26 GMT
Content-Type: application/json; charset=utf-8
Transfer-Encoding: chunked
Connection: keep-alive`;

         backend.handle(sampleRequest).subscribe(res => {
           expect(res.headers.get('Date')).toEqual('Fri, 20 Nov 2015 01:45:26 GMT');
           expect(res.headers.get('Content-Type')).toEqual('application/json; charset=utf-8');
           expect(res.headers.get('Transfer-Encoding')).toEqual('chunked');
           expect(res.headers.get('Connection')).toEqual('keep-alive');
           async.done();
         });

         existingXHRs[0].setResponseHeaders(responseHeaderString);
         existingXHRs[0].setStatusCode(200);
         existingXHRs[0].dispatchEvent('load');
       }));

    // TODO(alxhub): Not possible to set Response.url currently
    it('should add the responseURL to the response',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         backend.handle(sampleRequest).subscribe(res => {
           expect(res.url).toEqual('http://google.com');
           async.done();
         });

         existingXHRs[0].setResponseURL('http://google.com');
         existingXHRs[0].setStatusCode(200);
         existingXHRs[0].dispatchEvent('load');
       }));

    // TODO(alxhub): Not possible to set Response.url currently
    it('should add use the X-Request-URL in CORS situations',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         const responseHeaders = `X-Request-URL: http://somedomain.com
Foo: Bar`;

         backend.handle(sampleRequest).subscribe(res => {
           expect(res.url).toEqual('http://somedomain.com');
           async.done();
         });

         existingXHRs[0].setResponseHeaders(responseHeaders);
         existingXHRs[0].setStatusCode(200);
         existingXHRs[0].dispatchEvent('load');
       }));

    // TODO(alxhub): Not possible to set Response.url currently
    it('should return request url if it cannot be retrieved from response',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         backend.handle(sampleRequest).subscribe(res => {
           expect(res.url).toEqual('https://google.com');
           async.done();
         });

         existingXHRs[0].setStatusCode(200);
         existingXHRs[0].dispatchEvent('load');
       }));

    it('should set the status text property from the XMLHttpRequest instance if present',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         const statusText = 'test';
         backend.handle(sampleRequest).subscribe(res => {
           expect(res.statusText).toBe(statusText);
           async.done();
         });

         existingXHRs[0].setStatusText(statusText);
         existingXHRs[0].setStatusCode(200);
         existingXHRs[0].dispatchEvent('load');
       }));

    it('should set status text to "OK" if it is not present in XMLHttpRequest instance',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         backend.handle(sampleRequest).subscribe(res => {
           expect(res.statusText).toBe('OK');
           async.done();
         });

         existingXHRs[0].setStatusCode(200);
         existingXHRs[0].dispatchEvent('load');
       }));

    it('should set withCredentials to true when defined in request options for CORS situations',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         const req = new HttpRequest('http://google.com', {withCredentials: true});
         backend.handle(req).subscribe(res => {
           expect(existingXHRs[0].withCredentials).toBeTruthy();
           async.done();
         });

         existingXHRs[0].setStatusCode(200);
         existingXHRs[0].dispatchEvent('load');
       }));

    it('should not throw invalidStateError if response without body',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         backend.handle(sampleRequest).mergeMap(req => req.json()).subscribe(json => {
           expect(json).toBe(null);
           async.done();
         });

         existingXHRs[0].setStatusCode(204);
         existingXHRs[0].dispatchEvent('load');
       }));
  });
}
