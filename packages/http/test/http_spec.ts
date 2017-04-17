/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector, ReflectiveInjector} from '@angular/core';
import {TestBed, getTestBed} from '@angular/core/testing';
import {AsyncTestCompleter, afterEach, beforeEach, describe, inject, it} from '@angular/core/testing/src/testing_internal';
import {expect} from '@angular/platform-browser/testing/src/matchers';
import {Observable} from 'rxjs/Observable';
import {zip} from 'rxjs/observable/zip';

import {BaseRequestOptions, ConnectionBackend, Http, HttpModule, JSONPBackend, Jsonp, JsonpModule, Request, RequestMethod, RequestOptions, Response, ResponseContentType, ResponseOptions, URLSearchParams, XHRBackend} from '../index';
import {stringToArrayBuffer} from '../src/http_utils';
import {MockBackend, MockConnection} from '../testing/src/mock_backend';

export function main() {
  describe('injectables', () => {
    const url = 'http://foo.bar';
    let http: Http;
    let injector: Injector;
    let jsonpBackend: MockBackend;
    let xhrBackend: MockBackend;
    let jsonp: Jsonp;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [HttpModule, JsonpModule],
        providers: [
          {provide: XHRBackend, useClass: MockBackend},
          {provide: JSONPBackend, useClass: MockBackend}
        ]
      });
      injector = getTestBed();
    });

    it('should allow using jsonpInjectables and httpInjectables in same injector',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {

         http = injector.get(Http);
         jsonp = injector.get(Jsonp);
         jsonpBackend = injector.get(JSONPBackend) as MockBackend;
         xhrBackend = injector.get(XHRBackend) as any as MockBackend;

         let xhrCreatedConnections = 0;
         let jsonpCreatedConnections = 0;

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
    const url = 'http://foo.bar';
    let http: Http;
    let injector: Injector;
    let backend: MockBackend;
    let baseResponse: Response;
    let jsonp: Jsonp;

    beforeEach(() => {
      injector = ReflectiveInjector.resolveAndCreate([
        BaseRequestOptions, MockBackend, {
          provide: Http,
          useFactory: function(backend: ConnectionBackend, defaultOptions: BaseRequestOptions) {
            return new Http(backend, defaultOptions);
          },
          deps: [MockBackend, BaseRequestOptions]
        },
        {
          provide: Jsonp,
          useFactory: function(backend: ConnectionBackend, defaultOptions: BaseRequestOptions) {
            return new Jsonp(backend, defaultOptions);
          },
          deps: [MockBackend, BaseRequestOptions]
        }
      ]);
      http = injector.get(Http);
      jsonp = injector.get(Jsonp);
      backend = injector.get(MockBackend);
      baseResponse = new Response(new ResponseOptions({body: 'base response'}));
      spyOn(Http.prototype, 'request').and.callThrough();
    });

    afterEach(() => backend.verifyNoPendingRequests());

    describe('Http', () => {
      describe('.request()', () => {
        it('should return an Observable',
           () => { expect(http.request(url)).toBeAnInstanceOf(Observable); });


        it('should accept a fully-qualified request as its only parameter',
           inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
             backend.connections.subscribe((c: MockConnection) => {
               expect(c.request.url).toBe('https://google.com');
               c.mockRespond(new Response(new ResponseOptions({body: 'Thank you'})));
               async.done();
             });
             http.request(new Request(new RequestOptions({url: 'https://google.com'})))
                 .subscribe((res: Response) => {});
           }));

        it('should accept a fully-qualified request as its only parameter',
           inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
             backend.connections.subscribe((c: MockConnection) => {
               expect(c.request.url).toBe('https://google.com');
               expect(c.request.method).toBe(RequestMethod.Post);
               c.mockRespond(new Response(new ResponseOptions({body: 'Thank you'})));
               async.done();
             });
             http.request(new Request(new RequestOptions(
                              {url: 'https://google.com', method: RequestMethod.Post})))
                 .subscribe((res: Response) => {});
           }));


        it('should perform a get request for given url if only passed a string',
           inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
             backend.connections.subscribe((c: MockConnection) => c.mockRespond(baseResponse));
             http.request('http://basic.connection').subscribe((res: Response) => {
               expect(res.text()).toBe('base response');
               async.done();
             });
           }));

        it('should perform a post request for given url if options include a method',
           inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
             backend.connections.subscribe((c: MockConnection) => {
               expect(c.request.method).toEqual(RequestMethod.Post);
               c.mockRespond(baseResponse);
             });
             const requestOptions = new RequestOptions({method: RequestMethod.Post});
             http.request('http://basic.connection', requestOptions).subscribe((res: Response) => {
               expect(res.text()).toBe('base response');
               async.done();
             });
           }));

        it('should perform a post request for given url if options include a method',
           inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
             backend.connections.subscribe((c: MockConnection) => {
               expect(c.request.method).toEqual(RequestMethod.Post);
               c.mockRespond(baseResponse);
             });
             const requestOptions = {method: RequestMethod.Post};
             http.request('http://basic.connection', requestOptions).subscribe((res: Response) => {
               expect(res.text()).toBe('base response');
               async.done();
             });
           }));

        it('should perform a get request and complete the response',
           inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
             backend.connections.subscribe((c: MockConnection) => c.mockRespond(baseResponse));
             http.request('http://basic.connection')
                 .subscribe(
                     (res: Response) => { expect(res.text()).toBe('base response'); }, null !,
                     () => { async.done(); });
           }));

        it('should perform multiple get requests and complete the responses',
           inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
             backend.connections.subscribe((c: MockConnection) => c.mockRespond(baseResponse));

             http.request('http://basic.connection').subscribe((res: Response) => {
               expect(res.text()).toBe('base response');
             });
             http.request('http://basic.connection')
                 .subscribe(
                     (res: Response) => { expect(res.text()).toBe('base response'); }, null !,
                     () => { async.done(); });
           }));

        it('should throw if url is not a string or Request', () => {
          const req = <Request>{};
          expect(() => http.request(req))
              .toThrowError('First argument must be a url string or Request instance.');
        });
      });


      describe('.get()', () => {
        it('should perform a get request for given url',
           inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
             backend.connections.subscribe((c: MockConnection) => {
               expect(c.request.method).toBe(RequestMethod.Get);
               expect(http.request).toHaveBeenCalled();
               backend.resolveAllConnections();
               async.done();
             });
             expect(http.request).not.toHaveBeenCalled();
             http.get(url).subscribe((res: Response) => {});
           }));
      });


      describe('.post()', () => {
        it('should perform a post request for given url',
           inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
             backend.connections.subscribe((c: MockConnection) => {
               expect(c.request.method).toBe(RequestMethod.Post);
               expect(http.request).toHaveBeenCalled();
               backend.resolveAllConnections();
               async.done();
             });
             expect(http.request).not.toHaveBeenCalled();
             http.post(url, 'post me').subscribe((res: Response) => {});
           }));


        it('should attach the provided body to the request',
           inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
             const body = 'this is my post body';
             backend.connections.subscribe((c: MockConnection) => {
               expect(c.request.text()).toBe(body);
               backend.resolveAllConnections();
               async.done();
             });
             http.post(url, body).subscribe((res: Response) => {});
           }));
      });


      describe('.put()', () => {
        it('should perform a put request for given url',
           inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
             backend.connections.subscribe((c: MockConnection) => {
               expect(c.request.method).toBe(RequestMethod.Put);
               expect(http.request).toHaveBeenCalled();
               backend.resolveAllConnections();
               async.done();
             });
             expect(http.request).not.toHaveBeenCalled();
             http.put(url, 'put me').subscribe((res: Response) => {});
           }));

        it('should attach the provided body to the request',
           inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
             const body = 'this is my put body';
             backend.connections.subscribe((c: MockConnection) => {
               expect(c.request.text()).toBe(body);
               backend.resolveAllConnections();
               async.done();
             });
             http.put(url, body).subscribe((res: Response) => {});
           }));
      });


      describe('.delete()', () => {
        it('should perform a delete request for given url',
           inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
             backend.connections.subscribe((c: MockConnection) => {
               expect(c.request.method).toBe(RequestMethod.Delete);
               expect(http.request).toHaveBeenCalled();
               backend.resolveAllConnections();
               async.done();
             });
             expect(http.request).not.toHaveBeenCalled();
             http.delete(url).subscribe((res: Response) => {});
           }));
      });


      describe('.patch()', () => {
        it('should perform a patch request for given url',
           inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
             backend.connections.subscribe((c: MockConnection) => {
               expect(c.request.method).toBe(RequestMethod.Patch);
               expect(http.request).toHaveBeenCalled();
               backend.resolveAllConnections();
               async.done();
             });
             expect(http.request).not.toHaveBeenCalled();
             http.patch(url, 'this is my patch body').subscribe((res: Response) => {});
           }));

        it('should attach the provided body to the request',
           inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
             const body = 'this is my patch body';
             backend.connections.subscribe((c: MockConnection) => {
               expect(c.request.text()).toBe(body);
               backend.resolveAllConnections();
               async.done();
             });
             http.patch(url, body).subscribe((res: Response) => {});
           }));
      });


      describe('.head()', () => {
        it('should perform a head request for given url',
           inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
             backend.connections.subscribe((c: MockConnection) => {
               expect(c.request.method).toBe(RequestMethod.Head);
               expect(http.request).toHaveBeenCalled();
               backend.resolveAllConnections();
               async.done();
             });
             expect(http.request).not.toHaveBeenCalled();
             http.head(url).subscribe((res: Response) => {});
           }));
      });


      describe('.options()', () => {
        it('should perform an options request for given url',
           inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
             backend.connections.subscribe((c: MockConnection) => {
               expect(c.request.method).toBe(RequestMethod.Options);
               expect(http.request).toHaveBeenCalled();
               backend.resolveAllConnections();
               async.done();
             });
             expect(http.request).not.toHaveBeenCalled();
             http.options(url).subscribe((res: Response) => {});
           }));
      });


      describe('searchParams', () => {
        it('should append search params to url',
           inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
             const params = new URLSearchParams();
             params.append('q', 'puppies');
             backend.connections.subscribe((c: MockConnection) => {
               expect(c.request.url).toEqual('https://www.google.com?q=puppies');
               backend.resolveAllConnections();
               async.done();
             });
             http.get('https://www.google.com', new RequestOptions({search: params}))
                 .subscribe((res: Response) => {});
           }));

        it('should append string search params to url',
           inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
             backend.connections.subscribe((c: MockConnection) => {
               expect(c.request.url).toEqual('https://www.google.com?q=piggies');
               backend.resolveAllConnections();
               async.done();
             });
             http.get('https://www.google.com', new RequestOptions({search: 'q=piggies'}))
                 .subscribe((res: Response) => {});
           }));

        it('should produce valid url when url already contains a query',
           inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
             backend.connections.subscribe((c: MockConnection) => {
               expect(c.request.url).toEqual('https://www.google.com?q=angular&as_eq=1.x');
               backend.resolveAllConnections();
               async.done();
             });
             http.get('https://www.google.com?q=angular', new RequestOptions({search: 'as_eq=1.x'}))
                 .subscribe((res: Response) => {});
           }));
      });

      describe('params', () => {
        it('should append params to url',
           inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
             backend.connections.subscribe((c: MockConnection) => {
               expect(c.request.url).toEqual('https://www.google.com?q=puppies');
               backend.resolveAllConnections();
               async.done();
             });
             http.get('https://www.google.com', {params: {q: 'puppies'}})
                 .subscribe((res: Response) => {});
           }));
      });

      describe('string method names', () => {
        it('should allow case insensitive strings for method names', () => {
          inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
            backend.connections.subscribe((c: MockConnection) => {
              expect(c.request.method).toBe(RequestMethod.Post);
              c.mockRespond(new Response(new ResponseOptions({body: 'Thank you'})));
              async.done();
            });
            http.request(
                    new Request(new RequestOptions({url: 'https://google.com', method: 'PosT'})))
                .subscribe((res: Response) => {});
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
          const req = <Request>{};
          expect(() => jsonp.request(req))
              .toThrowError('First argument must be a url string or Request instance.');
        });
      });
    });

    describe('response buffer', () => {

      it('should attach the provided buffer to the response',
         inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
           backend.connections.subscribe((c: MockConnection) => {
             expect(c.request.responseType).toBe(ResponseContentType.ArrayBuffer);
             c.mockRespond(new Response(new ResponseOptions({body: new ArrayBuffer(32)})));
             async.done();
           });
           http.get(
                   'https://www.google.com',
                   new RequestOptions({responseType: ResponseContentType.ArrayBuffer}))
               .subscribe((res: Response) => {});
         }));

      it('should be able to consume a buffer containing a String as any response type',
         inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
           backend.connections.subscribe((c: MockConnection) => c.mockRespond(baseResponse));
           http.get('https://www.google.com').subscribe((res: Response) => {
             expect(res.arrayBuffer()).toBeAnInstanceOf(ArrayBuffer);
             expect(res.text()).toBe('base response');
             async.done();
           });
         }));


      it('should be able to consume a buffer containing an ArrayBuffer as any response type',
         inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
           const arrayBuffer = stringToArrayBuffer('{"response": "ok"}');
           backend.connections.subscribe(
               (c: MockConnection) =>
                   c.mockRespond(new Response(new ResponseOptions({body: arrayBuffer}))));
           http.get('https://www.google.com').subscribe((res: Response) => {
             expect(res.arrayBuffer()).toBe(arrayBuffer);
             expect(res.text()).toEqual('{"response": "ok"}');
             expect(res.json()).toEqual({response: 'ok'});
             async.done();
           });
         }));

      it('should be able to consume a buffer containing an Object as any response type',
         inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
           const simpleObject = {'content': 'ok'};
           backend.connections.subscribe(
               (c: MockConnection) =>
                   c.mockRespond(new Response(new ResponseOptions({body: simpleObject}))));
           http.get('https://www.google.com').subscribe((res: Response) => {
             expect(res.arrayBuffer()).toBeAnInstanceOf(ArrayBuffer);
             expect(res.text()).toEqual(JSON.stringify(simpleObject, null, 2));
             expect(res.json()).toBe(simpleObject);
             async.done();
           });
         }));

      it('should preserve encoding of ArrayBuffer response',
         inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
           const message = 'é@θЂ';
           const arrayBuffer = stringToArrayBuffer(message);
           backend.connections.subscribe(
               (c: MockConnection) =>
                   c.mockRespond(new Response(new ResponseOptions({body: arrayBuffer}))));
           http.get('https://www.google.com').subscribe((res: Response) => {
             expect(res.arrayBuffer()).toBeAnInstanceOf(ArrayBuffer);
             expect(res.text()).toEqual(message);
             async.done();
           });
         }));

      it('should preserve encoding of String response',
         inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
           const message = 'é@θЂ';
           backend.connections.subscribe(
               (c: MockConnection) =>
                   c.mockRespond(new Response(new ResponseOptions({body: message}))));
           http.get('https://www.google.com').subscribe((res: Response) => {
             expect(res.arrayBuffer()).toEqual(stringToArrayBuffer(message));
             async.done();
           });
         }));

      it('should have an equivalent response independently of the buffer used',
         inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
           const message = {'param': 'content'};

           backend.connections.subscribe((c: MockConnection) => {
             const body = (): any => {
               switch (c.request.responseType) {
                 case ResponseContentType.Text:
                   return JSON.stringify(message, null, 2);
                 case ResponseContentType.Json:
                   return message;
                 case ResponseContentType.ArrayBuffer:
                   return stringToArrayBuffer(JSON.stringify(message, null, 2));
               }
             };
             c.mockRespond(new Response(new ResponseOptions({body: body()})));
           });

           zip(http.get(
                   'https://www.google.com',
                   new RequestOptions({responseType: ResponseContentType.Text})),
               http.get(
                   'https://www.google.com',
                   new RequestOptions({responseType: ResponseContentType.Json})),
               http.get(
                   'https://www.google.com',
                   new RequestOptions({responseType: ResponseContentType.ArrayBuffer})))
               .subscribe((res: Array<any>) => {
                 expect(res[0].text()).toEqual(res[1].text());
                 expect(res[1].text()).toEqual(res[2].text());
                 async.done();
               });
         }));
    });
  });
}
