/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable} from '@angular/core';
import {AsyncTestCompleter, SpyObject, afterEach, beforeEach, beforeEachProviders, describe, expect, inject, it} from '@angular/core/testing/testing_internal';
import {__platform_browser_private__} from '@angular/platform-browser';

import {BrowserXhr} from '../../src/backends/browser_xhr';
import {CookieXSRFStrategy, XHRBackend, XHRConnection} from '../../src/backends/xhr_backend';
import {BaseRequestOptions, RequestOptions} from '../../src/base_request_options';
import {BaseResponseOptions, ResponseOptions} from '../../src/base_response_options';
import {ResponseContentType, ResponseType} from '../../src/enums';
import {Json} from '../../src/facade/lang';
import {Headers} from '../../src/headers';
import {XSRFStrategy} from '../../src/interfaces';
import {Request} from '../../src/static_request';
import {Response} from '../../src/static_response';
import {URLSearchParams} from '../../src/url_search_params';

var abortSpy: any;
var sendSpy: any;
var openSpy: any;
var setRequestHeaderSpy: any;
var existingXHRs: MockBrowserXHR[] = [];

class MockBrowserXHR extends BrowserXhr {
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
    super();
    var spy = new SpyObject();
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

  dispatchEvent(type: string) { this.callbacks.get(type)({}); }

  build() {
    var xhr = new MockBrowserXHR();
    existingXHRs.push(xhr);
    return xhr;
  }
}

export function main() {
  describe('XHRBackend', () => {
    var backend: XHRBackend;
    var sampleRequest: Request;

    beforeEachProviders(
        () =>
            [{provide: ResponseOptions, useClass: BaseResponseOptions},
             {provide: BrowserXhr, useClass: MockBrowserXHR}, XHRBackend,
             {provide: XSRFStrategy, useValue: new CookieXSRFStrategy()},
    ]);

    beforeEach(inject([XHRBackend], (be: XHRBackend) => {
      backend = be;
      let base = new BaseRequestOptions();
      sampleRequest = new Request(base.merge(new RequestOptions({url: 'https://google.com'})));
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

    const getDOM = __platform_browser_private__.getDOM;
    if (getDOM().supportsCookies()) {
      describe('XSRF support', () => {
        it('sets an XSRF header by default', () => {
          getDOM().setCookie('XSRF-TOKEN', 'magic XSRF value');
          backend.createConnection(sampleRequest);
          expect(sampleRequest.headers.get('X-XSRF-TOKEN')).toBe('magic XSRF value');
        });
        it('respects existing headers', () => {
          getDOM().setCookie('XSRF-TOKEN', 'magic XSRF value');
          sampleRequest.headers.set('X-XSRF-TOKEN', 'already set');
          backend.createConnection(sampleRequest);
          expect(sampleRequest.headers.get('X-XSRF-TOKEN')).toBe('already set');
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
           var connection = new XHRConnection(
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
           var connection = new XHRConnection(
               sampleRequest, new MockBrowserXHR(),
               new ResponseOptions({type: ResponseType.Error}));
           connection.response.subscribe(
               (res: Response) => { expect(res.type).toBe(ResponseType.Error); }, null,
               () => { async.done(); });
           existingXHRs[0].setStatusCode(200);
           existingXHRs[0].dispatchEvent('load');
         }));

      it('should call abort when disposed', () => {
        var connection = new XHRConnection(sampleRequest, new MockBrowserXHR());
        var request = connection.response.subscribe();
        request.unsubscribe();
        expect(abortSpy).toHaveBeenCalled();
      });

      it('should create an error Response on error',
         inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
           var connection = new XHRConnection(
               sampleRequest, new MockBrowserXHR(),
               new ResponseOptions({type: ResponseType.Error}));
           connection.response.subscribe(null, (res: Response) => {
             expect(res.type).toBe(ResponseType.Error);
             async.done();
           });
           existingXHRs[0].dispatchEvent('error');
         }));

      it('should set the status text and status code on error',
         inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
           var connection = new XHRConnection(
               sampleRequest, new MockBrowserXHR(),
               new ResponseOptions({type: ResponseType.Error}));
           connection.response.subscribe(null, (res: Response) => {
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
        var connection = new XHRConnection(sampleRequest, new MockBrowserXHR());
        expect(openSpy).not.toHaveBeenCalled();
        connection.response.subscribe();
        expect(openSpy).toHaveBeenCalledWith('GET', sampleRequest.url);
      });

      it('should call send on the backend with request body when subscribed to', () => {
        var body = 'Some body to love';
        var base = new BaseRequestOptions();
        var connection = new XHRConnection(
            new Request(base.merge(new RequestOptions({body: body}))), new MockBrowserXHR());
        expect(sendSpy).not.toHaveBeenCalled();
        connection.response.subscribe();
        expect(sendSpy).toHaveBeenCalledWith(body);
      });

      it('should attach headers to the request', () => {
        var headers =
            new Headers({'Content-Type': 'text/xml', 'Breaking-Bad': '<3', 'X-Multi': ['a', 'b']});

        var base = new BaseRequestOptions();
        var connection = new XHRConnection(
            new Request(base.merge(new RequestOptions({headers: headers}))), new MockBrowserXHR());
        connection.response.subscribe();
        expect(setRequestHeaderSpy).toHaveBeenCalledWith('content-type', 'text/xml');
        expect(setRequestHeaderSpy).toHaveBeenCalledWith('breaking-bad', '<3');
        expect(setRequestHeaderSpy).toHaveBeenCalledWith('x-multi', 'a,b');
      });

      it('should skip content type detection if custom content type header is set', () => {
        let headers = new Headers({'Content-Type': 'text/plain'});
        let body = {test: 'val'};
        let base = new BaseRequestOptions();
        let connection = new XHRConnection(
            new Request(base.merge(new RequestOptions({body: body, headers: headers}))),
            new MockBrowserXHR());
        connection.response.subscribe();
        expect(setRequestHeaderSpy).toHaveBeenCalledWith('content-type', 'text/plain');
        expect(setRequestHeaderSpy).not.toHaveBeenCalledWith('content-type', 'application/json');
      });

      it('should use object body and detect content type header to the request', () => {
        var body = {test: 'val'};
        var base = new BaseRequestOptions();
        var connection = new XHRConnection(
            new Request(base.merge(new RequestOptions({body: body}))), new MockBrowserXHR());
        connection.response.subscribe();
        expect(sendSpy).toHaveBeenCalledWith(Json.stringify(body));
        expect(setRequestHeaderSpy).toHaveBeenCalledWith('content-type', 'application/json');
      });

      it('should use number body and detect content type header to the request', () => {
        var body = 23;
        var base = new BaseRequestOptions();
        var connection = new XHRConnection(
            new Request(base.merge(new RequestOptions({body: body}))), new MockBrowserXHR());
        connection.response.subscribe();
        expect(sendSpy).toHaveBeenCalledWith('23');
        expect(setRequestHeaderSpy).toHaveBeenCalledWith('content-type', 'text/plain');
      });

      it('should use string body and detect content type header to the request', () => {
        var body = 'some string';
        var base = new BaseRequestOptions();
        var connection = new XHRConnection(
            new Request(base.merge(new RequestOptions({body: body}))), new MockBrowserXHR());
        connection.response.subscribe();
        expect(sendSpy).toHaveBeenCalledWith(body);
        expect(setRequestHeaderSpy).toHaveBeenCalledWith('content-type', 'text/plain');
      });

      it('should use URLSearchParams body and detect content type header to the request', () => {
        var body = new URLSearchParams();
        body.set('test1', 'val1');
        body.set('test2', 'val2');
        var base = new BaseRequestOptions();
        var connection = new XHRConnection(
            new Request(base.merge(new RequestOptions({body: body}))), new MockBrowserXHR());
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
          var body = new FormData();
          body.append('test1', 'val1');
          body.append('test2', 123456);
          var blob = createBlob(['body { color: red; }'], 'text/css');
          body.append('userfile', blob);
          var base = new BaseRequestOptions();
          var connection = new XHRConnection(
              new Request(base.merge(new RequestOptions({body: body}))), new MockBrowserXHR());
          connection.response.subscribe();
          expect(sendSpy).toHaveBeenCalledWith(body);
          expect(setRequestHeaderSpy).not.toHaveBeenCalledWith();
        });

        it('should use blob body and detect content type header to the request', () => {
          var body = createBlob(['body { color: red; }'], 'text/css');
          var base = new BaseRequestOptions();
          var connection = new XHRConnection(
              new Request(base.merge(new RequestOptions({body: body}))), new MockBrowserXHR());
          connection.response.subscribe();
          expect(sendSpy).toHaveBeenCalledWith(body);
          expect(setRequestHeaderSpy).toHaveBeenCalledWith('content-type', 'text/css');
        });

        it('should use blob body without type to the request', () => {
          var body = createBlob(['body { color: red; }'], null);
          var base = new BaseRequestOptions();
          var connection = new XHRConnection(
              new Request(base.merge(new RequestOptions({body: body}))), new MockBrowserXHR());
          connection.response.subscribe();
          expect(sendSpy).toHaveBeenCalledWith(body);
          expect(setRequestHeaderSpy).not.toHaveBeenCalledWith();
        });

        it('should use blob body without type with custom content type header to the request',
           () => {
             var headers = new Headers({'Content-Type': 'text/css'});
             var body = createBlob(['body { color: red; }'], null);
             var base = new BaseRequestOptions();
             var connection = new XHRConnection(
                 new Request(base.merge(new RequestOptions({body: body, headers: headers}))),
                 new MockBrowserXHR());
             connection.response.subscribe();
             expect(sendSpy).toHaveBeenCalledWith(body);
             expect(setRequestHeaderSpy).toHaveBeenCalledWith('content-type', 'text/css');
           });

        it('should use array buffer body to the request', () => {
          var body = new ArrayBuffer(512);
          var longInt8View = new Uint8Array(body);
          for (var i = 0; i < longInt8View.length; i++) {
            longInt8View[i] = i % 255;
          }
          var base = new BaseRequestOptions();
          var connection = new XHRConnection(
              new Request(base.merge(new RequestOptions({body: body}))), new MockBrowserXHR());
          connection.response.subscribe();
          expect(sendSpy).toHaveBeenCalledWith(body);
          expect(setRequestHeaderSpy).not.toHaveBeenCalledWith();
        });

        it('should use array buffer body without type with custom content type header to the request',
           () => {
             var headers = new Headers({'Content-Type': 'text/css'});
             var body = new ArrayBuffer(512);
             var longInt8View = new Uint8Array(body);
             for (var i = 0; i < longInt8View.length; i++) {
               longInt8View[i] = i % 255;
             }
             var base = new BaseRequestOptions();
             var connection = new XHRConnection(
                 new Request(base.merge(new RequestOptions({body: body, headers: headers}))),
                 new MockBrowserXHR());
             connection.response.subscribe();
             expect(sendSpy).toHaveBeenCalledWith(body);
             expect(setRequestHeaderSpy).toHaveBeenCalledWith('content-type', 'text/css');
           });
      }

      it('should return the correct status code',
         inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
           var statusCode = 418;
           var connection = new XHRConnection(
               sampleRequest, new MockBrowserXHR(), new ResponseOptions({status: statusCode}));

           connection.response.subscribe(
               (res: Response) => {

               },
               errRes => {
                 expect(errRes.status).toBe(statusCode);
                 async.done();
               });

           existingXHRs[0].setStatusCode(statusCode);
           existingXHRs[0].dispatchEvent('load');
         }));

      it('should call next and complete on 200 codes',
         inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
           var nextCalled = false;
           var errorCalled = false;
           var statusCode = 200;
           var connection = new XHRConnection(
               sampleRequest, new MockBrowserXHR(), new ResponseOptions({status: statusCode}));

           connection.response.subscribe(
               (res: Response) => {
                 nextCalled = true;
                 expect(res.status).toBe(statusCode);
               },
               errRes => { errorCalled = true; },
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
           var statusCode = 200;
           var connection = new XHRConnection(
               sampleRequest, new MockBrowserXHR(), new ResponseOptions({status: statusCode}));

           connection.response.subscribe(res => {
             expect(res.ok).toBe(true);
             async.done();
           });

           existingXHRs[0].setStatusCode(statusCode);
           existingXHRs[0].dispatchEvent('load');
         }));

      it('should set ok to false on 300 return',
         inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
           var statusCode = 300;
           var connection = new XHRConnection(
               sampleRequest, new MockBrowserXHR(), new ResponseOptions({status: statusCode}));

           connection.response.subscribe(
               res => { throw 'should not be called'; },
               errRes => {
                 expect(errRes.ok).toBe(false);
                 async.done();
               });

           existingXHRs[0].setStatusCode(statusCode);
           existingXHRs[0].dispatchEvent('load');
         }));

      it('should call error and not complete on 300+ codes',
         inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
           var nextCalled = false;
           var errorCalled = false;
           var statusCode = 301;
           var connection = new XHRConnection(
               sampleRequest, new MockBrowserXHR(), new ResponseOptions({status: statusCode}));

           connection.response.subscribe(
               (res: Response) => { nextCalled = true; },
               errRes => {
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
           var statusCode = 1223;
           var normalizedCode = 204;
           var connection = new XHRConnection(
               sampleRequest, new MockBrowserXHR(), new ResponseOptions({status: statusCode}));

           connection.response.subscribe((res: Response) => {
             expect(res.status).toBe(normalizedCode);
             async.done();
           });

           existingXHRs[0].setStatusCode(statusCode);
           existingXHRs[0].dispatchEvent('load');
         }));

      it('should normalize responseText and response',
         inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
           var responseBody = 'Doge';

           var connection1 =
               new XHRConnection(sampleRequest, new MockBrowserXHR(), new ResponseOptions());

           var connection2 =
               new XHRConnection(sampleRequest, new MockBrowserXHR(), new ResponseOptions());

           connection1.response.subscribe((res: Response) => {
             expect(res.text()).toBe(responseBody);

             connection2.response.subscribe(ress => {
               expect(ress.text()).toBe(responseBody);
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
           var conn = new XHRConnection(sampleRequest, new MockBrowserXHR(), new ResponseOptions());
           conn.response.subscribe((res: Response) => {
             expect(res.text()).toBe('{json: "object"}');
             async.done();
           });
           existingXHRs[0].setStatusCode(200);
           existingXHRs[0].setResponseText(')]}\'\n{json: "object"}');
           existingXHRs[0].dispatchEvent('load');
         }));

      it('should strip XSSI prefixes', inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
           var conn = new XHRConnection(sampleRequest, new MockBrowserXHR(), new ResponseOptions());
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
           var conn = new XHRConnection(sampleRequest, new MockBrowserXHR(), new ResponseOptions());
           conn.response.subscribe(null, (res: Response) => {
             expect(res.text()).toBe('{json: "object"}');
             async.done();
           });
           existingXHRs[0].setStatusCode(404);
           existingXHRs[0].setResponseText(')]}\'\n{json: "object"}');
           existingXHRs[0].dispatchEvent('load');
         }));

      it('should parse response headers and add them to the response',
         inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
           var statusCode = 200;
           var connection = new XHRConnection(
               sampleRequest, new MockBrowserXHR(), new ResponseOptions({status: statusCode}));

           let responseHeaderString = `Date: Fri, 20 Nov 2015 01:45:26 GMT
Content-Type: application/json; charset=utf-8
Transfer-Encoding: chunked
Connection: keep-alive`;

           connection.response.subscribe((res: Response) => {
             expect(res.headers.get('Date')).toEqual('Fri, 20 Nov 2015 01:45:26 GMT');
             expect(res.headers.get('Content-Type')).toEqual('application/json; charset=utf-8');
             expect(res.headers.get('Transfer-Encoding')).toEqual('chunked');
             expect(res.headers.get('Connection')).toEqual('keep-alive');
             async.done();
           });

           existingXHRs[0].setResponseHeaders(responseHeaderString);
           existingXHRs[0].setStatusCode(statusCode);
           existingXHRs[0].dispatchEvent('load');
         }));

      it('should add the responseURL to the response',
         inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
           var statusCode = 200;
           var connection = new XHRConnection(
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
           var statusCode = 200;
           var connection = new XHRConnection(
               sampleRequest, new MockBrowserXHR(), new ResponseOptions({status: statusCode}));
           var responseHeaders = `X-Request-URL: http://somedomain.com
           Foo: Bar`;

           connection.response.subscribe((res: Response) => {
             expect(res.url).toEqual('http://somedomain.com');
             async.done();
           });

           existingXHRs[0].setResponseHeaders(responseHeaders);
           existingXHRs[0].setStatusCode(statusCode);
           existingXHRs[0].dispatchEvent('load');
         }));

      it('should set the status text property from the XMLHttpRequest instance if present',
         inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
           var statusText = 'test';
           var connection = new XHRConnection(sampleRequest, new MockBrowserXHR());

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
           var connection = new XHRConnection(sampleRequest, new MockBrowserXHR());

           connection.response.subscribe((res: Response) => {
             expect(res.statusText).toBe('OK');
             async.done();
           });

           existingXHRs[0].setStatusCode(200);
           existingXHRs[0].dispatchEvent('load');
         }));

      it('should set withCredentials to true when defined in request options for CORS situations',
         inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
           var statusCode = 200;
           sampleRequest.withCredentials = true;
           var mockXhr = new MockBrowserXHR();
           var connection =
               new XHRConnection(sampleRequest, mockXhr, new ResponseOptions({status: statusCode}));
           var responseHeaders = `X-Request-URL: http://somedomain.com
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
           var statusCode = 200;
           var base = new BaseRequestOptions();
           var connection = new XHRConnection(
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
