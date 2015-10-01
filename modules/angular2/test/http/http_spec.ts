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
import {Injector, bind} from 'angular2/core';
import {MockBackend, MockConnection} from 'angular2/src/http/backends/mock_backend';
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

var Rx = require('@reactivex/rxjs/dist/cjs/Rx');
let{Observable, Subject} = Rx;

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


         xhrBackend.connections.subscribe(() => {
           xhrCreatedConnections++;
           expect(xhrCreatedConnections).toEqual(1);
           if (jsonpCreatedConnections) {
             async.done();
           }
         });

         http.get(url).subscribe(() => {});

         jsonpBackend.connections.subscribe(() => {
           jsonpCreatedConnections++;
           expect(jsonpCreatedConnections).toEqual(1);
           if (xhrCreatedConnections) {
             async.done();
           }
         });

         jsonp.request(url).subscribe(() => {});
       }));
  });

  describe('http', () => {
    var url = 'http://foo.bar';
    var http: Http;
    var injector: Injector;
    var backend: MockBackend;
    var baseResponse;
    var jsonp: Jsonp;
    beforeEach(() => {
      injector = Injector.resolveAndCreate([
        BaseRequestOptions,
        MockBackend,
        bind(Http).toFactory(
            function(backend: ConnectionBackend, defaultOptions: BaseRequestOptions) {
              return new Http(backend, defaultOptions);
            },
            [MockBackend, BaseRequestOptions]),
        bind(Jsonp).toFactory(
            function(backend: ConnectionBackend, defaultOptions: BaseRequestOptions) {
              return new Jsonp(backend, defaultOptions);
            },
            [MockBackend, BaseRequestOptions])
      ]);
      http = injector.get(Http);
      jsonp = injector.get(Jsonp);
      backend = injector.get(MockBackend);
      baseResponse = new Response(new ResponseOptions({body: 'base response'}));
    });

    afterEach(() => backend.verifyNoPendingRequests());

    describe('Http', () => {
      describe('.request()', () => {
        it('should return an Observable',
           () => { expect(http.request(url)).toBeAnInstanceOf(Observable); });


        it('should accept a fully-qualified request as its only parameter',
           inject([AsyncTestCompleter], (async) => {
             backend.connections.subscribe(c => {
               expect(c.request.url).toBe('https://google.com');
               c.mockRespond(new Response(new ResponseOptions({body: 'Thank you'})));
               async.done();
             });
             http.request(new Request(new RequestOptions({url: 'https://google.com'})))
                 .subscribe((res) => {});
           }));


        it('should perform a get request for given url if only passed a string',
           inject([AsyncTestCompleter], (async) => {
             backend.connections.subscribe(c => c.mockRespond(baseResponse));
             http.request('http://basic.connection')
                 .subscribe(res => {
                   expect(res.text()).toBe('base response');
                   async.done();
                 });
           }));

        it('should perform a get request and complete the response',
           inject([AsyncTestCompleter], (async) => {
             backend.connections.subscribe(c => c.mockRespond(baseResponse));
             http.request('http://basic.connection')
                 .subscribe(res => { expect(res.text()).toBe('base response'); }, null,
                            () => { async.done(); });
           }));

        it('should perform multiple get requests and complete the responses',
           inject([AsyncTestCompleter], (async) => {
             backend.connections.subscribe(c => c.mockRespond(baseResponse));

             http.request('http://basic.connection')
                 .subscribe(res => { expect(res.text()).toBe('base response'); });
             http.request('http://basic.connection')
                 .subscribe(res => { expect(res.text()).toBe('base response'); }, null,
                            () => { async.done(); });
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


        it('should throw if url is not a string or Request', () => {
          var req = <Request>{};
          expect(() => http.request(req))
              .toThrowError('First argument must be a url string or Request instance.');
        });
      });


      describe('.get()', () => {
        it('should perform a get request for given url', inject([AsyncTestCompleter], async => {
             backend.connections.subscribe(c => {
               expect(c.request.method).toBe(RequestMethods.Get);
               backend.resolveAllConnections();
               async.done();
             });
             http.get(url).subscribe(res => {});
           }));
      });


      describe('.post()', () => {
        it('should perform a post request for given url', inject([AsyncTestCompleter], async => {
             backend.connections.subscribe(c => {
               expect(c.request.method).toBe(RequestMethods.Post);
               backend.resolveAllConnections();
               async.done();
             });
             http.post(url, 'post me').subscribe(res => {});
           }));


        it('should attach the provided body to the request', inject([AsyncTestCompleter], async => {
             var body = 'this is my post body';
             backend.connections.subscribe(c => {
               expect(c.request.text()).toBe(body);
               backend.resolveAllConnections();
               async.done();
             });
             http.post(url, body).subscribe(res => {});
           }));
      });


      describe('.put()', () => {
        it('should perform a put request for given url', inject([AsyncTestCompleter], async => {
             backend.connections.subscribe(c => {
               expect(c.request.method).toBe(RequestMethods.Put);
               backend.resolveAllConnections();
               async.done();
             });
             http.put(url, 'put me').subscribe(res => {});
           }));

        it('should attach the provided body to the request', inject([AsyncTestCompleter], async => {
             var body = 'this is my put body';
             backend.connections.subscribe(c => {
               expect(c.request.text()).toBe(body);
               backend.resolveAllConnections();
               async.done();
             });
             http.put(url, body).subscribe(res => {});
           }));
      });


      describe('.delete()', () => {
        it('should perform a delete request for given url', inject([AsyncTestCompleter], async => {
             backend.connections.subscribe(c => {
               expect(c.request.method).toBe(RequestMethods.Delete);
               backend.resolveAllConnections();
               async.done();
             });
             http.delete(url).subscribe(res => {});
           }));
      });


      describe('.patch()', () => {
        it('should perform a patch request for given url', inject([AsyncTestCompleter], async => {
             backend.connections.subscribe(c => {
               expect(c.request.method).toBe(RequestMethods.Patch);
               backend.resolveAllConnections();
               async.done();
             });
             http.patch(url, 'this is my patch body').subscribe(res => {});
           }));

        it('should attach the provided body to the request', inject([AsyncTestCompleter], async => {
             var body = 'this is my patch body';
             backend.connections.subscribe(c => {
               expect(c.request.text()).toBe(body);
               backend.resolveAllConnections();
               async.done();
             });
             http.patch(url, body).subscribe(res => {});
           }));
      });


      describe('.head()', () => {
        it('should perform a head request for given url', inject([AsyncTestCompleter], async => {
             backend.connections.subscribe(c => {
               expect(c.request.method).toBe(RequestMethods.Head);
               backend.resolveAllConnections();
               async.done();
             });
             http.head(url).subscribe(res => {});
           }));
      });


      describe('searchParams', () => {
        it('should append search params to url', inject([AsyncTestCompleter], async => {
             var params = new URLSearchParams();
             params.append('q', 'puppies');
             backend.connections.subscribe(c => {
               expect(c.request.url).toEqual('https://www.google.com?q=puppies');
               backend.resolveAllConnections();
               async.done();
             });
             http.get('https://www.google.com', new RequestOptions({search: params}))
                 .subscribe(res => {});
           }));


        it('should append string search params to url', inject([AsyncTestCompleter], async => {
             backend.connections.subscribe(c => {
               expect(c.request.url).toEqual('https://www.google.com?q=piggies');
               backend.resolveAllConnections();
               async.done();
             });
             http.get('https://www.google.com', new RequestOptions({search: 'q=piggies'}))
                 .subscribe(res => {});
           }));


        it('should produce valid url when url already contains a query',
           inject([AsyncTestCompleter], async => {
             backend.connections.subscribe(c => {
               expect(c.request.url).toEqual('https://www.google.com?q=angular&as_eq=1.x');
               backend.resolveAllConnections();
               async.done();
             });
             http.get('https://www.google.com?q=angular', new RequestOptions({search: 'as_eq=1.x'}))
                 .subscribe(res => {});
           }));
      });

      describe('string method names', () => {
        it('should allow case insensitive strings for method names', () => {
          inject([AsyncTestCompleter], (async) => {
            backend.connections.subscribe(c => {
              expect(c.request.method)
                  .toBe(RequestMethods.Post)
                      c.mockRespond(new Response(new ResponseOptions({body: 'Thank you'})));
              async.done();
            });
            http.request(
                    new Request(new RequestOptions({url: 'https://google.com', method: 'PosT'})))
                .subscribe((res) => {});
          });
        });

        it('should throw when invalid string parameter is passed for method name', () => {
          expect(() => {
            http.request(
                new Request(new RequestOptions({url: 'https://google.com', method: 'Invalid'})));
          }).toThrowError('Invalid request method. The method "Invalid" is not supported.');
        });
      });
    });

    describe('Jsonp', () => {
      describe('.request()', () => {
        it('should throw if url is not a string or Request', () => {
          var req = <Request>{};
          expect(() => jsonp.request(req))
              .toThrowError('First argument must be a url string or Request instance.');
        });
      });
    });
  });
}
