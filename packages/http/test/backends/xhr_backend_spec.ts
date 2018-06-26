/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable} from '@angular/core';
import {AsyncTestCompleter, SpyObject, afterEach, beforeEach, beforeEachProviders, describe, expect, inject, it} from '@angular/core/testing/src/testing_internal';
import {BrowserXhr} from '@angular/http/src/backends/browser_xhr';
import {CookieXSRFStrategy, XHRBackend, XHRConnection} from '@angular/http/src/backends/xhr_backend';
import {BaseRequestOptions, RequestOptions} from '@angular/http/src/base_request_options';
import {BaseResponseOptions, ResponseOptions} from '@angular/http/src/base_response_options';
import {ResponseContentType, ResponseType} from '@angular/http/src/enums';
import {Headers} from '@angular/http/src/headers';
import {XSRFStrategy} from '@angular/http/src/interfaces';
import {Request} from '@angular/http/src/static_request';
import {Response} from '@angular/http/src/static_response';
import {URLSearchParams} from '@angular/http/src/url_search_params';
import {ɵgetDOM as getDOM} from '@angular/platform-browser';

let abortSpy: any;
let sendSpy: any;
let openSpy: any;
let setRequestHeaderSpy: any;
let existingXHRs: MockBrowserXHR[] = [];

class MockBrowserXHR extends BrowserXhr {
  abort: any;
  send: any;
  open: any;
  response: any;
  responseType: string;
  // TODO(issue/24571): remove '!'.
  responseText !: string;
  setRequestHeader: any;
  callbacks = new Map<string, Function>();
  // TODO(issue/24571): remove '!'.
  status !: number;
  // TODO(issue/24571): remove '!'.
  responseHeaders !: string;
  // TODO(issue/24571): remove '!'.
  responseURL !: string;
  // TODO(issue/24571): remove '!'.
  statusText !: string;
  // TODO(issue/24571): remove '!'.
  withCredentials !: boolean;

  constructor() {
    super();
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
    return Headers.fromResponseHeaderString(this.responseHeaders).get(key);
  }

  addEventListener(type: string, cb: Function) { this.callbacks.set(type, cb); }

  removeEventListener(type: string, cb: Function) { this.callbacks.delete(type); }

  dispatchEvent(type: string) { this.callbacks.get(type) !({}); }

  build() {
    const xhr = new MockBrowserXHR();
    existingXHRs.push(xhr);
    return xhr;
  }
}

{
  describe('XHRBackend', () => {
    let backend: XHRBackend;
    let sampleRequest: Request;

    beforeEachProviders(
        () =>
            [{provide: ResponseOptions, useClass: BaseResponseOptions},
             {provide: BrowserXhr, useClass: MockBrowserXHR}, XHRBackend,
             {provide: XSRFStrategy, useValue: new CookieXSRFStrategy()},
    ]);

    beforeEach(inject([XHRBackend], (be: XHRBackend) => {
      backend = be;
      const base = new BaseRequestOptions();
      sampleRequest =
          new Request(base.merge(new RequestOptions({url: 'https://google.com'})) as any);
    }));

    afterEach(() => { existingXHRs = []; });

    describe('creating a connection', () => {
      @Injectable()
      class NoopXsrfStrategy implements XSRFStrategy {
        configureRequest(req: Request) {}
      }
      beforeEachProviders(() => [{provide: XSRFStrategy, useClass: NoopXsrfStrategy}]);

      it('succeeds',
         () => { expect(() => backend.createConnection(sampleRequest)).not.toThrow(); });
    });

    if (getDOM().supportsCookies()) {
      describe('XSRF support', () => {
        it('sets an XSRF header by default', () => {
          getDOM().setCookie('XSRF-TOKEN', 'magic XSRF value');
          backend.createConnection(sampleRequest);
          expect(sampleRequest.headers.get('X-XSRF-TOKEN')).toBe('magic XSRF value');
        });
        it('should allow overwriting of existing headers', () => {
          getDOM().setCookie('XSRF-TOKEN', 'magic XSRF value');
          sampleRequest.headers.set('X-XSRF-TOKEN', 'already set');
          backend.createConnection(sampleRequest);
          expect(sampleRequest.headers.get('X-XSRF-TOKEN')).toBe('magic XSRF value');
        });

        describe('configuration', () => {
          beforeEachProviders(() => [{
                                provide: XSRFStrategy,
                                useValue: new CookieXSRFStrategy('my cookie', 'X-MY-HEADER')
                              }]);

          it('uses the configured names', () => {
            getDOM().setCookie('my cookie', 'XSRF value');
            backend.createConnection(sampleRequest);
            expect(sampleRequest.headers.get('X-MY-HEADER')).toBe('XSRF value');
          });
        });
      });
    }

    describe('XHRConnection', () => {
      it('should use the injected BaseResponseOptions to create the response',
         inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
           const connection = new XHRConnection(
               sampleRequest, new MockBrowserXHR(),
               new ResponseOptions({type: ResponseType.Error}));
           connection.response.subscribe((res: Response) => {
             expect(res.type).toBe(ResponseType.Error);
             async.done();
           });
           existingXHRs[0].setStatusCode(200);
           existingXHRs[0].dispatchEvent('load');
         }));

      it('should complete a request', inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
           const connection = new XHRConnection(
               sampleRequest, new MockBrowserXHR(),
               new ResponseOptions({type: ResponseType.Error}));
           connection.response.subscribe(
               (res: Response) => { expect(res.type).toBe(ResponseType.Error); }, null !,
               () => { async.done(); });
           existingXHRs[0].setStatusCode(200);
           existingXHRs[0].dispatchEvent('load');
         }));

      it('should call abort when disposed', () => {
        const connection = new XHRConnection(sampleRequest, new MockBrowserXHR());
        const request = connection.response.subscribe();
        request.unsubscribe();
        expect(abortSpy).toHaveBeenCalled();
      });

      it('should create an error Response on error',
         inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
           const connection = new XHRConnection(
               sampleRequest, new MockBrowserXHR(),
               new ResponseOptions({type: ResponseType.Error}));
           connection.response.subscribe(null !, (res: Response) => {
             expect(res.type).toBe(ResponseType.Error);
             async.done();
           });
           existingXHRs[0].dispatchEvent('error');
         }));

      it('should set the status text and status code on error',
         inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
           const connection = new XHRConnection(
               sampleRequest, new MockBrowserXHR(),
               new ResponseOptions({type: ResponseType.Error}));
           connection.response.subscribe(null !, (res: Response) => {
             expect(res.type).toBe(ResponseType.Error);
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
        const connection = new XHRConnection(sampleRequest, new MockBrowserXHR());
        expect(openSpy).not.toHaveBeenCalled();
        connection.response.subscribe();
        expect(openSpy).toHaveBeenCalledWith('GET', sampleRequest.url);
      });

      it('should call send on the backend with request body when subscribed to', () => {
        const body = 'Some body to love';
        const base = new BaseRequestOptions();
        const connection = new XHRConnection(
            new Request(base.merge(new RequestOptions({body: body})) as any), new MockBrowserXHR());
        expect(sendSpy).not.toHaveBeenCalled();
        connection.response.subscribe();
        expect(sendSpy).toHaveBeenCalledWith(body);
      });

      it('should attach headers to the request', () => {
        const headers =
            new Headers({'Content-Type': 'text/xml', 'Breaking-Bad': '<3', 'X-Multi': ['a', 'b']});

        const base = new BaseRequestOptions();
        const connection = new XHRConnection(
            new Request(base.merge(new RequestOptions({headers: headers})) as any),
            new MockBrowserXHR());
        connection.response.subscribe();
        expect(setRequestHeaderSpy).toHaveBeenCalledWith('Content-Type', 'text/xml');
        expect(setRequestHeaderSpy).toHaveBeenCalledWith('Breaking-Bad', '<3');
        expect(setRequestHeaderSpy).toHaveBeenCalledWith('X-Multi', 'a,b');
      });

      it('should attach default Accept header', () => {
        const headers = new Headers();
        const base = new BaseRequestOptions();
        const connection = new XHRConnection(
            new Request(base.merge(new RequestOptions({headers})) as any), new MockBrowserXHR());
        connection.response.subscribe();
        expect(setRequestHeaderSpy)
            .toHaveBeenCalledWith('Accept', 'application/json, text/plain, */*');
      });

      it('should not override user provided Accept header', () => {
        const headers = new Headers({'Accept': 'text/xml'});
        const base = new BaseRequestOptions();
        const connection = new XHRConnection(
            new Request(base.merge(new RequestOptions({headers})) as any), new MockBrowserXHR());
        connection.response.subscribe();
        expect(setRequestHeaderSpy).toHaveBeenCalledWith('Accept', 'text/xml');
      });

      it('should skip content type detection if custom content type header is set', () => {
        const headers = new Headers({'Content-Type': 'text/plain'});
        const body = {test: 'val'};
        const base = new BaseRequestOptions();
        const connection = new XHRConnection(
            new Request(base.merge(new RequestOptions({body: body, headers: headers})) as any),
            new MockBrowserXHR());
        connection.response.subscribe();
        expect(setRequestHeaderSpy).toHaveBeenCalledWith('Content-Type', 'text/plain');
        expect(setRequestHeaderSpy).not.toHaveBeenCalledWith('Content-Type', 'application/json');
        expect(setRequestHeaderSpy).not.toHaveBeenCalledWith('content-type', 'application/json');
      });

      it('should use object body and detect content type header to the request', () => {
        const body = {test: 'val'};
        const base = new BaseRequestOptions();
        const connection = new XHRConnection(
            new Request(base.merge(new RequestOptions({body: body})) as any), new MockBrowserXHR());
        connection.response.subscribe();
        expect(sendSpy).toHaveBeenCalledWith(JSON.stringify(body, null, 2));
        expect(setRequestHeaderSpy).toHaveBeenCalledWith('content-type', 'application/json');
      });

      it('should use number body and detect content type header to the request', () => {
        const body = 23;
        const base = new BaseRequestOptions();
        const connection = new XHRConnection(
            new Request(base.merge(new RequestOptions({body: body})) as any), new MockBrowserXHR());
        connection.response.subscribe();
        expect(sendSpy).toHaveBeenCalledWith('23');
        expect(setRequestHeaderSpy).toHaveBeenCalledWith('content-type', 'text/plain');
      });

      it('should use string body and detect content type header to the request', () => {
        const body = 'some string';
        const base = new BaseRequestOptions();
        const connection = new XHRConnection(
            new Request(base.merge(new RequestOptions({body: body})) as any), new MockBrowserXHR());
        connection.response.subscribe();
        expect(sendSpy).toHaveBeenCalledWith(body);
        expect(setRequestHeaderSpy).toHaveBeenCalledWith('content-type', 'text/plain');
      });

      it('should use URLSearchParams body and detect content type header to the request', () => {
        const body = new URLSearchParams();
        body.set('test1', 'val1');
        body.set('test2', 'val2');
        const base = new BaseRequestOptions();
        const connection = new XHRConnection(
            new Request(base.merge(new RequestOptions({body: body})) as any), new MockBrowserXHR());
        connection.response.subscribe();
        expect(sendSpy).toHaveBeenCalledWith('test1=val1&test2=val2');
        expect(setRequestHeaderSpy)
            .toHaveBeenCalledWith(
                'content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
      });

      if ((global as any /** TODO #9100 */)['Blob']) {
        // `new Blob(...)` throws an 'Illegal constructor' exception in Android browser <= 4.3,
        // but a BlobBuilder can be used instead
        const createBlob = (data: Array<string>, datatype: string) => {
          let newBlob: Blob;
          try {
            newBlob = new Blob(data || [], datatype ? {type: datatype} : {});
          } catch (e) {
            const BlobBuilder = (<any>global).BlobBuilder || (<any>global).WebKitBlobBuilder ||
                (<any>global).MozBlobBuilder || (<any>global).MSBlobBuilder;
            const builder = new BlobBuilder();
            builder.append(data);
            newBlob = builder.getBlob(datatype);
          }
          return newBlob;
        };

        it('should use FormData body and detect content type header to the request', () => {
          const body = new FormData();
          body.append('test1', 'val1');
          body.append('test2', '123456');
          const blob = createBlob(['body { color: red; }'], 'text/css');
          body.append('userfile', blob);
          const base = new BaseRequestOptions();
          const connection = new XHRConnection(
              new Request(base.merge(new RequestOptions({body: body})) as any),
              new MockBrowserXHR());
          connection.response.subscribe();
          expect(sendSpy).toHaveBeenCalledWith(body);
          expect(setRequestHeaderSpy).not.toHaveBeenCalledWith();
        });

        it('should use blob body and detect content type header to the request', () => {
          const body = createBlob(['body { color: red; }'], 'text/css');
          const base = new BaseRequestOptions();
          const connection = new XHRConnection(
              new Request(base.merge(new RequestOptions({body: body})) as any),
              new MockBrowserXHR());
          connection.response.subscribe();
          expect(sendSpy).toHaveBeenCalledWith(body);
          expect(setRequestHeaderSpy).toHaveBeenCalledWith('content-type', 'text/css');
        });

        it('should use blob body without type to the request', () => {
          const body = createBlob(['body { color: red; }'], null !);
          const base = new BaseRequestOptions();
          const connection = new XHRConnection(
              new Request(base.merge(new RequestOptions({body: body}))), new MockBrowserXHR());
          connection.response.subscribe();
          expect(sendSpy).toHaveBeenCalledWith(body);
          expect(setRequestHeaderSpy).not.toHaveBeenCalledWith();
        });

        it('should use blob body without type with custom content type header to the request',
           () => {
             const headers = new Headers({'Content-Type': 'text/css'});
             const body = createBlob(['body { color: red; }'], null !);
             const base = new BaseRequestOptions();
             const connection = new XHRConnection(
                 new Request(base.merge(new RequestOptions({body: body, headers: headers}))),
                 new MockBrowserXHR());
             connection.response.subscribe();
             expect(sendSpy).toHaveBeenCalledWith(body);
             expect(setRequestHeaderSpy).toHaveBeenCalledWith('Content-Type', 'text/css');
           });

        it('should use array buffer body to the request', () => {
          const body = new ArrayBuffer(512);
          const longInt8View = new Uint8Array(body);
          for (let i = 0; i < longInt8View.length; i++) {
            longInt8View[i] = i % 255;
          }
          const base = new BaseRequestOptions();
          const connection = new XHRConnection(
              new Request(base.merge(new RequestOptions({body: body}))), new MockBrowserXHR());
          connection.response.subscribe();
          expect(sendSpy).toHaveBeenCalledWith(body);
          expect(setRequestHeaderSpy).not.toHaveBeenCalledWith();
        });

        it('should use array buffer body without type with custom content type header to the request',
           () => {
             const headers = new Headers({'Content-Type': 'text/css'});
             const body = new ArrayBuffer(512);
             const longInt8View = new Uint8Array(body);
             for (let i = 0; i < longInt8View.length; i++) {
               longInt8View[i] = i % 255;
             }
             const base = new BaseRequestOptions();
             const connection = new XHRConnection(
                 new Request(base.merge(new RequestOptions({body: body, headers: headers}))),
                 new MockBrowserXHR());
             connection.response.subscribe();
             expect(sendSpy).toHaveBeenCalledWith(body);
             expect(setRequestHeaderSpy).toHaveBeenCalledWith('Content-Type', 'text/css');
           });
      }

      it('should return the correct status code',
         inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
           const statusCode = 418;
           const connection = new XHRConnection(
               sampleRequest, new MockBrowserXHR(), new ResponseOptions({status: statusCode}));

           connection.response.subscribe(
               (res: Response) => {

               },
               (errRes: Response) => {
                 expect(errRes.status).toBe(statusCode);
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
           const connection = new XHRConnection(
               sampleRequest, new MockBrowserXHR(), new ResponseOptions({status: statusCode}));

           connection.response.subscribe(
               (res: Response) => {
                 nextCalled = true;
                 expect(res.status).toBe(statusCode);
               },
               (errRes: Response) => { errorCalled = true; },
               () => {
                 expect(nextCalled).toBe(true);
                 expect(errorCalled).toBe(false);
                 async.done();
               });

           existingXHRs[0].setStatusCode(statusCode);
           existingXHRs[0].dispatchEvent('load');
         }));

      it('should set ok to true on 200 return',
         inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
           const statusCode = 200;
           const connection = new XHRConnection(
               sampleRequest, new MockBrowserXHR(), new ResponseOptions({status: statusCode}));

           connection.response.subscribe((res: Response) => {
             expect(res.ok).toBe(true);
             async.done();
           });

           existingXHRs[0].setStatusCode(statusCode);
           existingXHRs[0].dispatchEvent('load');
         }));

      it('should set ok to false on 300 return',
         inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
           const statusCode = 300;
           const connection = new XHRConnection(
               sampleRequest, new MockBrowserXHR(), new ResponseOptions({status: statusCode}));

           connection.response.subscribe(
               (res: Response) => { throw 'should not be called'; },
               (errRes: Response) => {
                 expect(errRes.ok).toBe(false);
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
           const connection = new XHRConnection(
               sampleRequest, new MockBrowserXHR(), new ResponseOptions({status: statusCode}));

           connection.response.subscribe(
               (res: Response) => { nextCalled = true; },
               (errRes: Response) => {
                 expect(errRes.status).toBe(statusCode);
                 expect(nextCalled).toBe(false);
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
           const connection = new XHRConnection(
               sampleRequest, new MockBrowserXHR(), new ResponseOptions({status: statusCode}));

           connection.response.subscribe((res: Response) => {
             expect(res.status).toBe(normalizedCode);
             async.done();
           });

           existingXHRs[0].setStatusCode(statusCode);
           existingXHRs[0].dispatchEvent('load');
         }));

      it('should ignore response body for 204 status code',
         inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
           const statusCode = 204;
           const connection = new XHRConnection(
               sampleRequest, new MockBrowserXHR(), new ResponseOptions({status: statusCode}));

           connection.response.subscribe((res: Response) => {
             expect(res.text()).toBe('');
             async.done();
           });

           existingXHRs[0].setStatusCode(statusCode);
           existingXHRs[0].setResponseText('Doge');
           existingXHRs[0].dispatchEvent('load');
         }));

      it('should normalize responseText and response',
         inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
           const responseBody = 'Doge';

           const connection1 =
               new XHRConnection(sampleRequest, new MockBrowserXHR(), new ResponseOptions());

           const connection2 =
               new XHRConnection(sampleRequest, new MockBrowserXHR(), new ResponseOptions());

           connection1.response.subscribe((res: Response) => {
             expect(res.text()).toBe(responseBody);

             connection2.response.subscribe((res: Response) => {
               expect(res.text()).toBe(responseBody);
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
           const conn =
               new XHRConnection(sampleRequest, new MockBrowserXHR(), new ResponseOptions());
           conn.response.subscribe((res: Response) => {
             expect(res.text()).toBe('{json: "object"}');
             async.done();
           });
           existingXHRs[0].setStatusCode(200);
           existingXHRs[0].setResponseText(')]}\'\n{json: "object"}');
           existingXHRs[0].dispatchEvent('load');
         }));

      it('should strip XSSI prefixes', inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
           const conn =
               new XHRConnection(sampleRequest, new MockBrowserXHR(), new ResponseOptions());
           conn.response.subscribe((res: Response) => {
             expect(res.text()).toBe('{json: "object"}');
             async.done();
           });
           existingXHRs[0].setStatusCode(200);
           existingXHRs[0].setResponseText(')]}\',\n{json: "object"}');
           existingXHRs[0].dispatchEvent('load');
         }));

      it('should strip XSSI prefix from errors',
         inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
           const conn =
               new XHRConnection(sampleRequest, new MockBrowserXHR(), new ResponseOptions());
           conn.response.subscribe(null !, (res: Response) => {
             expect(res.text()).toBe('{json: "object"}');
             async.done();
           });
           existingXHRs[0].setStatusCode(404);
           existingXHRs[0].setResponseText(')]}\'\n{json: "object"}');
           existingXHRs[0].dispatchEvent('load');
         }));

      it('should parse response headers and add them to the response',
         inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
           const statusCode = 200;
           const connection = new XHRConnection(
               sampleRequest, new MockBrowserXHR(), new ResponseOptions({status: statusCode}));

           const responseHeaderString = `Date: Fri, 20 Nov 2015 01:45:26 GMT
Content-Type: application/json; charset=utf-8
Transfer-Encoding: chunked
Connection: keep-alive`;

           connection.response.subscribe((res: Response) => {
             expect(res.headers !.get('Date')).toEqual('Fri, 20 Nov 2015 01:45:26 GMT');
             expect(res.headers !.get('Content-Type')).toEqual('application/json; charset=utf-8');
             expect(res.headers !.get('Transfer-Encoding')).toEqual('chunked');
             expect(res.headers !.get('Connection')).toEqual('keep-alive');
             async.done();
           });

           existingXHRs[0].setResponseHeaders(responseHeaderString);
           existingXHRs[0].setStatusCode(statusCode);
           existingXHRs[0].dispatchEvent('load');
         }));

      it('should add the responseURL to the response',
         inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
           const statusCode = 200;
           const connection = new XHRConnection(
               sampleRequest, new MockBrowserXHR(), new ResponseOptions({status: statusCode}));

           connection.response.subscribe((res: Response) => {
             expect(res.url).toEqual('http://google.com');
             async.done();
           });

           existingXHRs[0].setResponseURL('http://google.com');
           existingXHRs[0].setStatusCode(statusCode);
           existingXHRs[0].dispatchEvent('load');
         }));

      it('should add use the X-Request-URL in CORS situations',
         inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
           const statusCode = 200;
           const connection = new XHRConnection(
               sampleRequest, new MockBrowserXHR(), new ResponseOptions({status: statusCode}));
           const responseHeaders = `X-Request-URL: http://somedomain.com
           Foo: Bar`;

           connection.response.subscribe((res: Response) => {
             expect(res.url).toEqual('http://somedomain.com');
             async.done();
           });

           existingXHRs[0].setResponseHeaders(responseHeaders);
           existingXHRs[0].setStatusCode(statusCode);
           existingXHRs[0].dispatchEvent('load');
         }));

      it('should return request url if it cannot be retrieved from response',
         inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
           const statusCode = 200;
           const connection = new XHRConnection(
               sampleRequest, new MockBrowserXHR(), new ResponseOptions({status: statusCode}));

           connection.response.subscribe((res: Response) => {
             expect(res.url).toEqual('https://google.com');
             async.done();
           });

           existingXHRs[0].setStatusCode(statusCode);
           existingXHRs[0].dispatchEvent('load');
         }));

      it('should set the status text property from the XMLHttpRequest instance if present',
         inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
           const statusText = 'test';
           const connection = new XHRConnection(sampleRequest, new MockBrowserXHR());

           connection.response.subscribe((res: Response) => {
             expect(res.statusText).toBe(statusText);
             async.done();
           });

           existingXHRs[0].setStatusText(statusText);
           existingXHRs[0].setStatusCode(200);
           existingXHRs[0].dispatchEvent('load');
         }));

      it('should set status text to "OK" if it is not present in XMLHttpRequest instance',
         inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
           const connection = new XHRConnection(sampleRequest, new MockBrowserXHR());

           connection.response.subscribe((res: Response) => {
             expect(res.statusText).toBe('OK');
             async.done();
           });

           existingXHRs[0].setStatusCode(200);
           existingXHRs[0].dispatchEvent('load');
         }));

      it('should set withCredentials to true when defined in request options for CORS situations',
         inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
           const statusCode = 200;
           sampleRequest.withCredentials = true;
           const mockXhr = new MockBrowserXHR();
           const connection =
               new XHRConnection(sampleRequest, mockXhr, new ResponseOptions({status: statusCode}));
           const responseHeaders = `X-Request-URL: http://somedomain.com
           Foo: Bar`;

           connection.response.subscribe((res: Response) => {
             expect(res.url).toEqual('http://somedomain.com');
             expect(existingXHRs[0].withCredentials).toBeTruthy();
             async.done();
           });

           existingXHRs[0].setResponseHeaders(responseHeaders);
           existingXHRs[0].setStatusCode(statusCode);
           existingXHRs[0].dispatchEvent('load');
         }));

      it('should set the responseType attribute to blob when the corresponding response content type is present',
         inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
           const statusCode = 200;
           const base = new BaseRequestOptions();
           const connection = new XHRConnection(
               new Request(
                   base.merge(new RequestOptions({responseType: ResponseContentType.Blob}))),
               new MockBrowserXHR());

           connection.response.subscribe((res: Response) => {
             expect(existingXHRs[0].responseType).toBe('blob');
             async.done();
           });

           existingXHRs[0].setStatusCode(statusCode);
           existingXHRs[0].dispatchEvent('load');
         }));

      it('should not throw invalidStateError if response without body and responseType not equal to text',
         inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
           const base = new BaseRequestOptions();
           const connection = new XHRConnection(
               new Request(
                   base.merge(new RequestOptions({responseType: ResponseContentType.Json}))),
               new MockBrowserXHR());

           connection.response.subscribe((res: Response) => {
             expect(res.json()).toBe(null);
             async.done();
           });

           existingXHRs[0].setStatusCode(204);
           existingXHRs[0].dispatchEvent('load');
         }));
    });
  });
}
