import {
  AsyncTestCompleter,
  afterEach,
  beforeEach,
  ddescribe,
  describe,
  expect,
  iit,
  inject,
  it,
  xit,
  SpyObject
} from 'angular2/testing_internal';
import {ObservableWrapper} from 'angular2/src/facade/async';
import {BrowserXhr} from 'angular2/src/http/backends/browser_xhr';
import {XHRConnection, XHRBackend} from 'angular2/src/http/backends/xhr_backend';
import {provide, Injector, ReflectiveInjector} from 'angular2/core';
import {Request} from 'angular2/src/http/static_request';
import {Response} from 'angular2/src/http/static_response';
import {Headers} from 'angular2/src/http/headers';
import {Map} from 'angular2/src/facade/collection';
import {RequestOptions, BaseRequestOptions} from 'angular2/src/http/base_request_options';
import {BaseResponseOptions, ResponseOptions} from 'angular2/src/http/base_response_options';
import {ResponseType} from 'angular2/src/http/enums';

var abortSpy: any;
var sendSpy: any;
var openSpy: any;
var setRequestHeaderSpy: any;
var addEventListenerSpy: any;
var existingXHRs: MockBrowserXHR[] = [];
var unused: Response;

class MockBrowserXHR extends BrowserXhr {
  abort: any;
  send: any;
  open: any;
  response: any;
  responseText: string;
  setRequestHeader: any;
  callbacks = new Map<string, Function>();
  status: number;
  responseHeaders: string;
  responseURL: string;
  constructor() {
    super();
    var spy = new SpyObject();
    this.abort = abortSpy = spy.spy('abort');
    this.send = sendSpy = spy.spy('send');
    this.open = openSpy = spy.spy('open');
    this.setRequestHeader = setRequestHeaderSpy = spy.spy('setRequestHeader');
  }

  setStatusCode(status: number) { this.status = status; }

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

    beforeEach(() => {
      var injector = ReflectiveInjector.resolveAndCreate([
        provide(ResponseOptions, {useClass: BaseResponseOptions}),
        provide(BrowserXhr, {useClass: MockBrowserXHR}),
        XHRBackend
      ]);
      backend = injector.get(XHRBackend);
      var base = new BaseRequestOptions();
      sampleRequest = new Request(base.merge(new RequestOptions({url: 'https://google.com'})));
    });

    afterEach(() => { existingXHRs = []; });

    it('should create a connection',
       () => { expect(() => backend.createConnection(sampleRequest)).not.toThrow(); });


    describe('XHRConnection', () => {
      it('should use the injected BaseResponseOptions to create the response',
         inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
           var connection = new XHRConnection(sampleRequest, new MockBrowserXHR(),
                                              new ResponseOptions({type: ResponseType.Error}));
           connection.response.subscribe((res: Response) => {
             expect(res.type).toBe(ResponseType.Error);
             async.done();
           });
           existingXHRs[0].setStatusCode(200);
           existingXHRs[0].dispatchEvent('load');
         }));

      it('should complete a request', inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
           var connection = new XHRConnection(sampleRequest, new MockBrowserXHR(),
                                              new ResponseOptions({type: ResponseType.Error}));
           connection.response.subscribe((res: Response) => {
             expect(res.type).toBe(ResponseType.Error);
           }, null, () => { async.done(); });
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
           var connection = new XHRConnection(sampleRequest, new MockBrowserXHR(),
                                              new ResponseOptions({type: ResponseType.Error}));
           connection.response.subscribe(null, (res: Response) => {
             expect(res.type).toBe(ResponseType.Error);
             async.done();
           });
           existingXHRs[0].dispatchEvent('error');
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
        expect(setRequestHeaderSpy).toHaveBeenCalledWith('Content-Type', 'text/xml');
        expect(setRequestHeaderSpy).toHaveBeenCalledWith('Breaking-Bad', '<3');
        expect(setRequestHeaderSpy).toHaveBeenCalledWith('X-Multi', 'a,b');
      });

      it('should return the correct status code',
         inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
           var statusCode = 418;
           var connection = new XHRConnection(sampleRequest, new MockBrowserXHR(),
                                              new ResponseOptions({status: statusCode}));

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
           var connection = new XHRConnection(sampleRequest, new MockBrowserXHR(),
                                              new ResponseOptions({status: statusCode}));

           connection.response.subscribe(
               (res: Response) => {
                 nextCalled = true;
                 expect(res.status).toBe(statusCode);
               },
               errRes => { errorCalled = true; }, () => {
                 expect(nextCalled).toBe(true);
                 expect(errorCalled).toBe(false);
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
           var connection = new XHRConnection(sampleRequest, new MockBrowserXHR(),
                                              new ResponseOptions({status: statusCode}));

           connection.response.subscribe((res: Response) => { nextCalled = true; }, errRes => {
             expect(errRes.status).toBe(statusCode);
             expect(nextCalled).toBe(false);
             async.done();
           }, () => { throw 'should not be called'; });

           existingXHRs[0].setStatusCode(statusCode);
           existingXHRs[0].dispatchEvent('load');
         }));
      it('should normalize IE\'s 1223 status code into 204',
         inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
           var statusCode = 1223;
           var normalizedCode = 204;
           var connection = new XHRConnection(sampleRequest, new MockBrowserXHR(),
                                              new ResponseOptions({status: statusCode}));

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

      it('should parse response headers and add them to the response',
         inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
           var statusCode = 200;
           var connection = new XHRConnection(sampleRequest, new MockBrowserXHR(),
                                              new ResponseOptions({status: statusCode}));

           let responseHeaderString =
               `Date: Fri, 20 Nov 2015 01:45:26 GMT
               Content-Type: application/json; charset=utf-8
               Transfer-Encoding: chunked
               Connection: keep-alive`

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
           var connection = new XHRConnection(sampleRequest, new MockBrowserXHR(),
                                              new ResponseOptions({status: statusCode}));

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
           var connection = new XHRConnection(sampleRequest, new MockBrowserXHR(),
                                              new ResponseOptions({status: statusCode}));
           var responseHeaders = `X-Request-URL: http://somedomain.com
           Foo: Bar`

                                 connection.response.subscribe((res: Response) => {
                                   expect(res.url).toEqual('http://somedomain.com');
                                   async.done();
                                 });

           existingXHRs[0].setResponseHeaders(responseHeaders);
           existingXHRs[0].setStatusCode(statusCode);
           existingXHRs[0].dispatchEvent('load');
         }));
    });
  });
}
