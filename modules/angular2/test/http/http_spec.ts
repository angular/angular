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
import {Injector, bind} from 'angular2/di';
import {MockBackend, MockConnection} from 'angular2/src/http/backends/mock_backend';
import {EventEmitter, ObservableWrapper} from 'angular2/src/core/facade/async';
import {
  BaseRequestOptions,
  ConnectionBackend,
  Request,
  RequestMethods,
  RequestOptions,
  Response,
  ResponseOptions,
  URLSearchParams,
  JSONP_BINDINGS,
  HTTP_BINDINGS,
  XHRBackend,
  JSONPBackend,
  Http,
  Jsonp
} from 'angular2/http';

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
  describe('injectables', () => {
    var url = 'http://foo.bar';
    var http: Http;
    var parentInjector: Injector;
    var childInjector: Injector;
    var jsonpBackend: MockBackend;
    var xhrBackend: MockBackend;
    var jsonp: Jsonp;
    var http: Http;

    it('should allow using jsonpInjectables and httpInjectables in same injector',
       inject([AsyncTestCompleter], (async) => {
         parentInjector = Injector.resolveAndCreate(
             [bind(XHRBackend).toClass(MockBackend), bind(JSONPBackend).toClass(MockBackend)]);

         childInjector = parentInjector.resolveAndCreateChild([
           HTTP_BINDINGS,
           JSONP_BINDINGS,
           bind(XHRBackend).toClass(MockBackend),
           bind(JSONPBackend).toClass(MockBackend)
         ]);

         http = childInjector.get(Http);
         jsonp = childInjector.get(Jsonp);
         jsonpBackend = childInjector.get(JSONPBackend);
         xhrBackend = childInjector.get(XHRBackend);

         var xhrCreatedConnections = 0;
         var jsonpCreatedConnections = 0;


         ObservableWrapper.subscribe(xhrBackend.connections, () => {
           xhrCreatedConnections++;
           expect(xhrCreatedConnections).toEqual(1);
           if (jsonpCreatedConnections) {
             async.done();
           }
         });

         ObservableWrapper.subscribe(http.get(url), () => {});

         ObservableWrapper.subscribe(jsonpBackend.connections, () => {
           jsonpCreatedConnections++;
           expect(jsonpCreatedConnections).toEqual(1);
           if (xhrCreatedConnections) {
             async.done();
           }
         });

         ObservableWrapper.subscribe(jsonp.request(url), () => {});
       }));
  });

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
             ObservableWrapper.subscribe<MockConnection>(backend.connections, c => {
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
             ObservableWrapper.subscribe<MockConnection>(backend.connections,
                                                         c => c.mockRespond(baseResponse));
             ObservableWrapper.subscribe<Response>(http.request('http://basic.connection'), res => {
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
             ObservableWrapper.subscribe<MockConnection>(backend.connections, c => {
               expect(c.request.method).toBe(RequestMethods.Get);
               backend.resolveAllConnections();
               async.done();
             });
             ObservableWrapper.subscribe(http.get(url), res => {});
           }));
      });


      describe('.post()', () => {
        it('should perform a post request for given url', inject([AsyncTestCompleter], async => {
             ObservableWrapper.subscribe<MockConnection>(backend.connections, c => {
               expect(c.request.method).toBe(RequestMethods.Post);
               backend.resolveAllConnections();
               async.done();
             });
             ObservableWrapper.subscribe(http.post(url, 'post me'), res => {});
           }));


        it('should attach the provided body to the request', inject([AsyncTestCompleter], async => {
             var body = 'this is my post body';
             ObservableWrapper.subscribe<MockConnection>(backend.connections, c => {
               expect(c.request.text()).toBe(body);
               backend.resolveAllConnections();
               async.done();
             });
             ObservableWrapper.subscribe(http.post(url, body), res => {});
           }));
      });


      describe('.put()', () => {
        it('should perform a put request for given url', inject([AsyncTestCompleter], async => {
             ObservableWrapper.subscribe<MockConnection>(backend.connections, c => {
               expect(c.request.method).toBe(RequestMethods.Put);
               backend.resolveAllConnections();
               async.done();
             });
             ObservableWrapper.subscribe(http.put(url, 'put me'), res => {});
           }));

        it('should attach the provided body to the request', inject([AsyncTestCompleter], async => {
             var body = 'this is my put body';
             ObservableWrapper.subscribe<MockConnection>(backend.connections, c => {
               expect(c.request.text()).toBe(body);
               backend.resolveAllConnections();
               async.done();
             });
             ObservableWrapper.subscribe(http.put(url, body), res => {});
           }));
      });


      describe('.delete()', () => {
        it('should perform a delete request for given url', inject([AsyncTestCompleter], async => {
             ObservableWrapper.subscribe<MockConnection>(backend.connections, c => {
               expect(c.request.method).toBe(RequestMethods.Delete);
               backend.resolveAllConnections();
               async.done();
             });
             ObservableWrapper.subscribe(http.delete(url), res => {});
           }));
      });


      describe('.patch()', () => {
        it('should perform a patch request for given url', inject([AsyncTestCompleter], async => {
             ObservableWrapper.subscribe<MockConnection>(backend.connections, c => {
               expect(c.request.method).toBe(RequestMethods.Patch);
               backend.resolveAllConnections();
               async.done();
             });
             ObservableWrapper.subscribe(http.patch(url, 'this is my patch body'), res => {});
           }));

        it('should attach the provided body to the request', inject([AsyncTestCompleter], async => {
             var body = 'this is my patch body';
             ObservableWrapper.subscribe<MockConnection>(backend.connections, c => {
               expect(c.request.text()).toBe(body);
               backend.resolveAllConnections();
               async.done();
             });
             ObservableWrapper.subscribe(http.patch(url, body), res => {});
           }));
      });


      describe('.head()', () => {
        it('should perform a head request for given url', inject([AsyncTestCompleter], async => {
             ObservableWrapper.subscribe<MockConnection>(backend.connections, c => {
               expect(c.request.method).toBe(RequestMethods.Head);
               backend.resolveAllConnections();
               async.done();
             });
             ObservableWrapper.subscribe(http.head(url), res => {});
           }));
      });


      describe('searchParams', () => {
        it('should append search params to url', inject([AsyncTestCompleter], async => {
             var params = new URLSearchParams();
             params.append('q', 'puppies');
             ObservableWrapper.subscribe<MockConnection>(backend.connections, c => {
               expect(c.request.url).toEqual('https://www.google.com?q=puppies');
               backend.resolveAllConnections();
               async.done();
             });
             ObservableWrapper.subscribe(
                 http.get('https://www.google.com', new RequestOptions({search: params})),
                 res => {});
           }));


        it('should append string search params to url', inject([AsyncTestCompleter], async => {
             ObservableWrapper.subscribe<MockConnection>(backend.connections, c => {
               expect(c.request.url).toEqual('https://www.google.com?q=piggies');
               backend.resolveAllConnections();
               async.done();
             });
             ObservableWrapper.subscribe(
                 http.get('https://www.google.com', new RequestOptions({search: 'q=piggies'})),
                 res => {});
           }));


        it('should produce valid url when url already contains a query',
           inject([AsyncTestCompleter], async => {
             ObservableWrapper.subscribe<MockConnection>(backend.connections, c => {
               expect(c.request.url).toEqual('https://www.google.com?q=angular&as_eq=1.x');
               backend.resolveAllConnections();
               async.done();
             });
             ObservableWrapper.subscribe(http.get('https://www.google.com?q=angular',
                                                  new RequestOptions({search: 'as_eq=1.x'})),
                                         res => {});
           }));
      });
    });
  });
}
