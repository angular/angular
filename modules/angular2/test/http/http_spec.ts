import {
  AsyncTestCompleter,
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
import {Http, HttpFactory} from 'angular2/src/http/http';
import {XHRBackend} from 'angular2/src/http/backends/xhr_backend';
import {Injector, bind} from 'angular2/di';
import {MockBackend} from 'angular2/src/http/backends/mock_backend';
import {Response} from 'angular2/src/http/static_response';
import {RequestMethods} from 'angular2/src/http/enums';
import {BaseRequestOptions} from 'angular2/src/http/base_request_options';
import {Request} from 'angular2/src/http/static_request';

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
    var http;
    var injector;
    var backend: MockBackend;
    var baseResponse;
    var sampleObserver;
    var httpFactory;
    beforeEach(() => {
      injector = Injector.resolveAndCreate([
        BaseRequestOptions,
        MockBackend,
        bind(XHRBackend).toClass(MockBackend),
        bind(HttpFactory).toFactory(HttpFactory, [MockBackend, BaseRequestOptions]),
        bind(Http).toFactory(
            function(backend: XHRBackend, defaultOptions: BaseRequestOptions) {
              return new Http(backend, defaultOptions);
            },
            [MockBackend, BaseRequestOptions])
      ]);
      http = injector.get(Http);
      httpFactory = injector.get(HttpFactory);
      backend = injector.get(MockBackend);
      baseResponse = new Response('base response');
      sampleObserver = new SpyObserver();
    });

    afterEach(() => backend.verifyNoPendingRequests());

    describe('HttpFactory', () => {
      it('should return an Observable', () => {
        expect(typeof httpFactory(url).subscribe).toBe('function');
        backend.resolveAllConnections();
      });


      it('should perform a get request for given url if only passed a string',
         inject([AsyncTestCompleter], (async) => {
           var connection;
           backend.connections.subscribe((c) => connection = c);
           var subscription = httpFactory('http://basic.connection')
                                  .subscribe(res => {
                                    expect(res.text()).toBe('base response');
                                    async.done();
                                  });
           connection.mockRespond(baseResponse)
         }));

      it('should accept a fully-qualified request as its only parameter', () => {
        var req = new Request('https://google.com');
        backend.connections.subscribe(c => { expect(c.request.url).toBe('https://google.com'); });
        httpFactory(req).subscribe(() => {});
      });


      it('should perform a get request for given url if passed a ConnectionConfig instance',
         inject([AsyncTestCompleter], async => {
           var connection;
           backend.connections.subscribe((c) => connection = c);
           httpFactory('http://basic.connection', {method: RequestMethods.GET})
               .subscribe(res => {
                 expect(res.text()).toBe('base response');
                 async.done();
               });
           connection.mockRespond(baseResponse)
         }));


      it('should perform a get request for given url if passed a dictionary',
         inject([AsyncTestCompleter], async => {
           var connection;
           backend.connections.subscribe((c) => connection = c);
           httpFactory(url, {method: RequestMethods.GET})
               .subscribe(res => {
                 expect(res.text()).toBe('base response');
                 async.done();
               });
           connection.mockRespond(baseResponse)
         }));
    });


    describe('Http', () => {
      describe('.request()', () => {
        it('should return an Observable', () => {
          expect(typeof http.request(url).subscribe).toBe('function');
          backend.resolveAllConnections();
        });


        it('should accept a fully-qualified request as its only parameter', () => {
          var req = new Request('https://google.com');
          backend.connections.subscribe(c => {
            expect(c.request.url).toBe('https://google.com');
          });
          http.request(req).subscribe(() =>{});
        });
      });


      it('should perform a get request for given url if only passed a string',
         inject([AsyncTestCompleter], (async) => {
           var connection;
           backend.connections.subscribe((c) => connection = c);
           var subscription = http.request('http://basic.connection')
                                  .subscribe(res => {
                                    expect(res.text()).toBe('base response');
                                    async.done();
                                  });
           connection.mockRespond(baseResponse)
         }));


      it('should perform a get request for given url if passed a ConnectionConfig instance',
         inject([AsyncTestCompleter], async => {
           var connection;
           backend.connections.subscribe((c) => connection = c);
           http.request('http://basic.connection', {method: RequestMethods.GET})
               .subscribe(res => {
                 expect(res.text()).toBe('base response');
                 async.done();
               });
           connection.mockRespond(baseResponse);
         }));


      it('should perform a get request for given url if passed a dictionary',
         inject([AsyncTestCompleter], async => {
           var connection;
           backend.connections.subscribe((c) => connection = c);
           http.request(url, {method: RequestMethods.GET})
               .subscribe(res => {
                 expect(res.text()).toBe('base response');
                 async.done();
               });
           connection.mockRespond(baseResponse);
         }));


      describe('.get()', () => {
        it('should perform a get request for given url', inject([AsyncTestCompleter], async => {
             backend.connections.subscribe((c) => {
               expect(c.request.method).toBe(RequestMethods.GET);
               backend.resolveAllConnections();
               async.done();
             });
             http.get(url).subscribe(res => {});
           }));
      });


      describe('.post()', () => {
        it('should perform a post request for given url', inject([AsyncTestCompleter], async => {
             backend.connections.subscribe((c) => {
               expect(c.request.method).toBe(RequestMethods.POST);
               backend.resolveAllConnections();
               async.done();
             });
             http.post(url).subscribe(res => {});
           }));


        it('should attach the provided body to the request', inject([AsyncTestCompleter], async => {
             var body = 'this is my put body';
             backend.connections.subscribe((c) => {
               expect(c.request.text()).toBe(body);
               backend.resolveAllConnections();
               async.done();
             });
             http.post(url, body).subscribe(res => {});
           }));
      });


      describe('.put()', () => {
        it('should perform a put request for given url', inject([AsyncTestCompleter], async => {
             backend.connections.subscribe((c) => {
               expect(c.request.method).toBe(RequestMethods.PUT);
               backend.resolveAllConnections();
               async.done();
             });
             http.put(url).subscribe(res => {});
           }));

        it('should attach the provided body to the request', inject([AsyncTestCompleter], async => {
             var body = 'this is my put body';
             backend.connections.subscribe((c) => {
               expect(c.request.text()).toBe(body);
               backend.resolveAllConnections();
               async.done();
             });
             http.put(url, body).subscribe(res => {});
           }));
      });


      describe('.delete()', () => {
        it('should perform a delete request for given url', inject([AsyncTestCompleter], async => {
             backend.connections.subscribe((c) => {
               expect(c.request.method).toBe(RequestMethods.DELETE);
               backend.resolveAllConnections();
               async.done();
             });
             http.delete(url).subscribe(res => {});
           }));
      });


      describe('.patch()', () => {
        it('should perform a patch request for given url', inject([AsyncTestCompleter], async => {
             backend.connections.subscribe((c) => {
               expect(c.request.method).toBe(RequestMethods.PATCH);
               backend.resolveAllConnections();
               async.done();
             });
             http.patch(url).subscribe(res => {});
           }));

        it('should attach the provided body to the request', inject([AsyncTestCompleter], async => {
             var body = 'this is my put body';
             backend.connections.subscribe((c) => {
               expect(c.request.text()).toBe(body);
               backend.resolveAllConnections();
               async.done();
             });
             http.patch(url, body).subscribe(res => {});
           }));
      });


      describe('.head()', () => {
        it('should perform a head request for given url', inject([AsyncTestCompleter], async => {
             backend.connections.subscribe((c) => {
               expect(c.request.method).toBe(RequestMethods.HEAD);
               backend.resolveAllConnections();
               async.done();
             });
             http.head(url).subscribe(res => {});
           }));
      });
    });
  });
}
