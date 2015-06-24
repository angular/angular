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
} from 'angular2/test_lib';
import {Http} from 'angular2/src/http/http';
import {Injector, bind} from 'angular2/di';
import {MockBackend} from 'angular2/src/http/backends/mock_backend';
import {Response} from 'angular2/src/http/static_response';
import {RequestMethods} from 'angular2/src/http/enums';
import {BaseRequestOptions, RequestOptions} from 'angular2/src/http/base_request_options';
import {ResponseOptions} from 'angular2/src/http/base_response_options';
import {Request} from 'angular2/src/http/static_request';
import {EventEmitter, ObservableWrapper} from 'angular2/src/facade/async';
import {ConnectionBackend} from 'angular2/src/http/interfaces';

class SpyObserver extends SpyObject {
  onNext: Function;
  onError: Function;
  onCompleted: Function;
  constructor() {
    super();
    this.onNext = this.spy('onNext');
    this.onError = this.spy('onError');
    this.onCompleted = this.spy('onCompleted');
  }
}

export function main() {
  describe('http', () => {
    var url = 'http://foo.bar';
    var http: Http;
    var injector: Injector;
    var backend: MockBackend;
    var baseResponse;
    beforeEach(() => {
      injector = Injector.resolveAndCreate([
        BaseRequestOptions,
        MockBackend,
        bind(Http).toFactory(
            function(backend: ConnectionBackend, defaultOptions: BaseRequestOptions) {
              return new Http(backend, defaultOptions);
            },
            [MockBackend, BaseRequestOptions])
      ]);
      http = injector.get(Http);
      backend = injector.get(MockBackend);
      baseResponse = new Response(new ResponseOptions({body: 'base response'}));
    });

    afterEach(() => backend.verifyNoPendingRequests());

    describe('Http', () => {
      describe('.request()', () => {
        it('should return an Observable',
           () => { expect(ObservableWrapper.isObservable(http.request(url))).toBe(true); });


        it('should accept a fully-qualified request as its only parameter',
           inject([AsyncTestCompleter], (async) => {
             ObservableWrapper.subscribe(backend.connections, c => {
               expect(c.request.url).toBe('https://google.com');
               c.mockRespond(new Response(new ResponseOptions({body: 'Thank you'})));
               async.done();
             });
             ObservableWrapper.subscribe(
                 http.request(new Request(new RequestOptions({url: 'https://google.com'}))),
                 (res) => {});
           }));


        it('should perform a get request for given url if only passed a string',
           inject([AsyncTestCompleter], (async) => {
             ObservableWrapper.subscribe(backend.connections, c => c.mockRespond(baseResponse));
             ObservableWrapper.subscribe(http.request('http://basic.connection'), res => {
               expect(res.text()).toBe('base response');
               async.done();
             });
           }));

        // TODO: make dart not complain about "argument type 'Map' cannot be assigned to the
        // parameter type 'IRequestOptions'"
        // xit('should perform a get request for given url if passed a dictionary',
        //     inject([AsyncTestCompleter], async => {
        //       ObservableWrapper.subscribe(backend.connections, c => c.mockRespond(baseResponse));
        //       ObservableWrapper.subscribe(http.request(url, {method: RequestMethods.GET}), res =>
        //       {
        //         expect(res.text()).toBe('base response');
        //         async.done();
        //       });
        //     }));
      });


      describe('.get()', () => {
        it('should perform a get request for given url', inject([AsyncTestCompleter], async => {
             ObservableWrapper.subscribe(backend.connections, c => {
               expect(c.request.method).toBe(RequestMethods.GET);
               backend.resolveAllConnections();
               async.done();
             });
             ObservableWrapper.subscribe(http.get(url), res => {});
           }));
      });


      describe('.post()', () => {
        it('should perform a post request for given url', inject([AsyncTestCompleter], async => {
             ObservableWrapper.subscribe(backend.connections, c => {
               expect(c.request.method).toBe(RequestMethods.POST);
               backend.resolveAllConnections();
               async.done();
             });
             ObservableWrapper.subscribe(http.post(url, 'post me'), res => {});
           }));


        it('should attach the provided body to the request', inject([AsyncTestCompleter], async => {
             var body = 'this is my post body';
             ObservableWrapper.subscribe(backend.connections, c => {
               expect(c.request.text()).toBe(body);
               backend.resolveAllConnections();
               async.done();
             });
             ObservableWrapper.subscribe(http.post(url, body), res => {});
           }));
      });


      describe('.put()', () => {
        it('should perform a put request for given url', inject([AsyncTestCompleter], async => {
             ObservableWrapper.subscribe(backend.connections, c => {
               expect(c.request.method).toBe(RequestMethods.PUT);
               backend.resolveAllConnections();
               async.done();
             });
             ObservableWrapper.subscribe(http.put(url, 'put me'), res => {});
           }));

        it('should attach the provided body to the request', inject([AsyncTestCompleter], async => {
             var body = 'this is my put body';
             ObservableWrapper.subscribe(backend.connections, c => {
               expect(c.request.text()).toBe(body);
               backend.resolveAllConnections();
               async.done();
             });
             ObservableWrapper.subscribe(http.put(url, body), res => {});
           }));
      });


      describe('.delete()', () => {
        it('should perform a delete request for given url', inject([AsyncTestCompleter], async => {
             ObservableWrapper.subscribe(backend.connections, c => {
               expect(c.request.method).toBe(RequestMethods.DELETE);
               backend.resolveAllConnections();
               async.done();
             });
             ObservableWrapper.subscribe(http.delete(url), res => {});
           }));
      });


      describe('.patch()', () => {
        it('should perform a patch request for given url', inject([AsyncTestCompleter], async => {
             ObservableWrapper.subscribe(backend.connections, c => {
               expect(c.request.method).toBe(RequestMethods.PATCH);
               backend.resolveAllConnections();
               async.done();
             });
             ObservableWrapper.subscribe(http.patch(url, 'this is my patch body'), res => {});
           }));

        it('should attach the provided body to the request', inject([AsyncTestCompleter], async => {
             var body = 'this is my patch body';
             ObservableWrapper.subscribe(backend.connections, c => {
               expect(c.request.text()).toBe(body);
               backend.resolveAllConnections();
               async.done();
             });
             ObservableWrapper.subscribe(http.patch(url, body), res => {});
           }));
      });


      describe('.head()', () => {
        it('should perform a head request for given url', inject([AsyncTestCompleter], async => {
             ObservableWrapper.subscribe(backend.connections, c => {
               expect(c.request.method).toBe(RequestMethods.HEAD);
               backend.resolveAllConnections();
               async.done();
             });
             ObservableWrapper.subscribe(http.head(url), res => {});
           }));
      });
    });
  });
}
