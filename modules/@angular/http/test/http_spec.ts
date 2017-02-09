/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';

import {Injector, ReflectiveInjector} from '@angular/core';
import {TestBed, getTestBed} from '@angular/core/testing';
import {AsyncTestCompleter, afterEach, beforeEach, describe, inject, it} from '@angular/core/testing/testing_internal';
import {expect} from '@angular/platform-browser/testing/matchers';
import {Observable} from 'rxjs/Observable';

import {Http, HttpBackend, HttpHeaders, HttpModule, HttpRequest, HttpResponse, HttpUrlParams, Jsonp, JsonpBackend, JsonpModule, XhrBackend} from '../index';
import {MockBackend, MockRequest} from '../testing/mock_backend';


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
          {provide: HttpBackend, useClass: MockBackend},
          {provide: JsonpBackend, useClass: MockBackend}
        ]
      });
      injector = getTestBed();
    });

    it('should allow using jsonpInjectables and httpInjectables in same injector',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {

         http = injector.get(Http);
         jsonp = injector.get(Jsonp);
         jsonpBackend = injector.get(JsonpBackend) as any as MockBackend;
         xhrBackend = injector.get(HttpBackend) as any as MockBackend;

         let xhrCreatedRequests = 0;
         let jsonpCreatedRequests = 0;

         xhrBackend.mockRequests.subscribe(() => {
           xhrCreatedRequests++;
           expect(xhrCreatedRequests).toEqual(1);
           if (jsonpCreatedRequests) {
             async.done();
           }
         });

         http.get(url).subscribe(() => {});

         jsonpBackend.mockRequests.subscribe(() => {
           jsonpCreatedRequests++;
           expect(jsonpCreatedRequests).toEqual(1);
           if (xhrCreatedRequests) {
             async.done();
           }
         });

         jsonp.get(url).subscribe(() => {});
       }));
  });

  describe('http', () => {
    const url = 'http://foo.bar';
    let http: Http;
    let backend: MockBackend;
    let sampleResponse: HttpResponse;

    beforeEach(() => {
      backend = new MockBackend();
      http = new Http(backend, []);
      sampleResponse = new HttpResponse({body: 'base response'});
      spyOn(Http.prototype, 'request').and.callThrough();
    });

    afterEach(() => backend.verifyNoPendingRequests());

    describe('Http', () => {
      describe('.request()', () => {
        it('should return an Observable',
           () => { expect(http.request(url)).toBeAnInstanceOf(Observable); });

        it('should accept a fully-qualified request as its only parameter',
           inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
             backend.mockRequests.subscribe(req => {
               expect(req.request.url).toBe('https://google.com');
               req.respond(new HttpResponse({body: 'Thank you'}));
               async.done();
             });
             http.request(new HttpRequest('https://google.com')).subscribe();
           }));

        it('should accept a fully-qualified POST request as its only parameter',
           inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
             backend.mockRequests.subscribe(req => {
               expect(req.request.url).toBe('https://google.com');
               expect(req.request.method).toBe('POST');
               req.respond(new HttpResponse({body: 'Thank you'}));
               async.done();
             });
             http.request(new HttpRequest('https://google.com', {method: 'POST'})).subscribe();
           }));

        it('should perform a get request for given url if only passed a string',
           inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
             backend.mockRequests.subscribe(req => req.respond(sampleResponse));
             http.request(url)
                 .mergeMap(res => res.text())
                 .subscribe(text => expect(text).toBe('base response'), null, () => async.done());
           }));

        it('should perform a post request for given url if options include a method',
           inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
             backend.mockRequests.subscribe(req => {
               expect(req.request.method).toEqual('POST');
               req.respond(sampleResponse);
             });
             http.request(url, {method: 'POST'})
                 .mergeMap(res => res.text())
                 .subscribe(text => expect(text).toBe('base response'), null, () => async.done());
           }));

        it('should perform a post request for given url if options include a method',
           inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
             backend.mockRequests.subscribe(req => {
               expect(req.request.method).toEqual('POST');
               req.respond(sampleResponse);
             });
             http.request(url, {method: 'POST'})
                 .mergeMap(res => res.text())
                 .subscribe(text => expect(text).toBe('base response'), null, () => async.done());
           }));

        it('should perform a get request and complete the response',
           inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
             backend.mockRequests.subscribe(req => req.respond(sampleResponse));
             http.request(url)
                 .mergeMap(res => res.text())
                 .subscribe(text => expect(text).toBe('base response'), null, () => async.done());
           }));

        it('should perform multiple get requests and complete the responses',
           inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
             backend.mockRequests.subscribe(req => req.respond(sampleResponse));
             const obs = http.request(url).mergeMap(res => res.text());
             Observable.combineLatest(obs, obs).subscribe(texts => {
               texts.forEach(text => expect(text).toBe('base response'));
             }, null, () => async.done());
           }));

        it('should throw if url is not a string or Request', () => {
          const req = <HttpRequest>{};
          expect(() => http.request(req))
              .toThrowError('First argument must be a url string or HttpRequest instance.');
        });

        it('should attach default Accept header',
           inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
             backend.mockRequests.subscribe(req => {
               expect(req.request.headers.get('Accept')).toBe('application/json, text/plain, */*');
               req.respond(new HttpResponse({body: 'Thank you'}));
               async.done();
             });
             http.request(new HttpRequest('http://google.com')).subscribe();
           }));
      });

      describe('.get()', () => {
        it('should perform a get request for given url',
           inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
             backend.mockRequests.subscribe(req => {
               expect(req.request.method).toBe('GET');
               expect(http.request).toHaveBeenCalled();
               backend.resolveAllConnections();
               async.done();
             });
             expect(http.request).not.toHaveBeenCalled();
             http.get(url).subscribe();
           }));
      });

      describe('.post()', () => {
        it('should perform a post request for given url',
           inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
             backend.mockRequests.subscribe(req => {
               expect(req.request.method).toBe('POST');
               expect(http.request).toHaveBeenCalled();
               backend.resolveAllConnections();
               async.done();
             });
             expect(http.request).not.toHaveBeenCalled();
             http.post(url, 'post me').subscribe();
           }));

        it('should attach the provided body to the request',
           inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
             const body = 'this is my post body';
             backend.mockRequests.map(req => req.request.text()).subscribe(text => {
               expect(text).toBe(body);
               async.done();
               backend.resolveAllConnections();
             });
             http.post(url, body).subscribe();
           }));
      });

      describe('.put()', () => {
        it('should perform a put request for given url',
           inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
             backend.mockRequests.subscribe(req => {
               expect(req.request.method).toBe('PUT');
               expect(http.request).toHaveBeenCalled();
               backend.resolveAllConnections();
               async.done();
             });
             expect(http.request).not.toHaveBeenCalled();
             http.put(url, 'put me').subscribe();
           }));

        it('should attach the provided body to the request',
           inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
             const body = 'this is my put body';
             backend.mockRequests.map(req => req.request.text()).subscribe(text => {
               expect(text).toBe(body);
               async.done();
               backend.resolveAllConnections();
             });
             http.put(url, body).subscribe();
           }));
      });

      describe('.delete()', () => {
        it('should perform a delete request for given url',
           inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
             backend.mockRequests.subscribe(req => {
               expect(req.request.method).toBe('DELETE');
               expect(http.request).toHaveBeenCalled();
               backend.resolveAllConnections();
               async.done();
             });
             expect(http.request).not.toHaveBeenCalled();
             http.delete(url).subscribe();
           }));
      });

      describe('.patch()', () => {
        it('should perform a patch request for given url',
           inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
             backend.mockRequests.subscribe(req => {
               expect(req.request.method).toBe('PATCH');
               expect(http.request).toHaveBeenCalled();
               backend.resolveAllConnections();
               async.done();
             });
             expect(http.request).not.toHaveBeenCalled();
             http.patch(url, 'patch me').subscribe();
           }));

        it('should attach the provided body to the request',
           inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
             const body = 'this is my patch body';
             backend.mockRequests.map(req => req.request.text()).subscribe(text => {
               expect(text).toBe(body);
               async.done();
               backend.resolveAllConnections();
             });
             http.patch(url, body).subscribe();
           }));
      });


      describe('.head()', () => {
        it('should perform a head request for given url',
           inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
             backend.mockRequests.subscribe(req => {
               expect(req.request.method).toBe('HEAD');
               expect(http.request).toHaveBeenCalled();
               backend.resolveAllConnections();
               async.done();
             });
             expect(http.request).not.toHaveBeenCalled();
             http.head(url).subscribe();
           }));
      });


      describe('.options()', () => {
        it('should perform an options request for given url',
           inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
             backend.mockRequests.subscribe(req => {
               expect(req.request.method).toBe('OPTIONS');
               expect(http.request).toHaveBeenCalled();
               backend.resolveAllConnections();
               async.done();
             });
             expect(http.request).not.toHaveBeenCalled();
             http.options(url).subscribe();
           }));
      });

      describe('params', () => {
        it('should append search params to url',
           inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
             const params = new HttpUrlParams();
             params.append('q', 'puppies');
             backend.mockRequests.subscribe(mock => {
               expect(mock.request.url).toEqual('https://www.google.com?q=puppies');
               backend.resolveAllConnections();
               async.done();
             });
             http.get('https://www.google.com', {params}).subscribe();
           }));

        it('should append string search params to url',
           inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
             backend.mockRequests.subscribe(mock => {
               expect(mock.request.url).toEqual('https://www.google.com?q=piggies');
               backend.resolveAllConnections();
               async.done();
             });
             http.get('https://www.google.com', {params: 'q=piggies'}).subscribe();
           }));

        it('should produce valid url when url already contains a query',
           inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
             backend.mockRequests.subscribe(mock => {
               expect(mock.request.url).toEqual('https://www.google.com?q=angular&as_eq=1.x');
               backend.resolveAllConnections();
               async.done();
             });
             http.get('https://www.google.com?q=angular', {params: 'as_eq=1.x'}).subscribe();
           }));

        it('should append map params to url',
           inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
             backend.mockRequests.subscribe(mock => {
               expect(mock.request.url).toEqual('https://www.google.com?q=puppies');
               backend.resolveAllConnections();
               async.done();
             });
             http.get('https://www.google.com', {params: {q: 'puppies'}}).subscribe();
           }));
      });

      describe('string method names', () => {
        it('should allow case insensitive strings for method names',
           inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
             backend.mockRequests.subscribe(req => {
               expect(req.request.method).toBe('POST');
               req.respond(new HttpResponse({body: 'Thank you'}));
               async.done();
             });
             http.request(new HttpRequest('https://google.com', {method: 'PosT'})).subscribe();
           }));
      });

      describe('content type detection', () => {
        it('should skip content type detection if custom content type header is set',
           inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
             const headers = new HttpHeaders({'Content-Type': 'text/plain'});
             const body = {test: 'val'};
             backend.mockRequests.subscribe(req => {
               expect(req.request.headers.get('content-type')).toBe('text/plain');
               backend.resolveAllConnections();
               async.done();
             });
             http.post('http://google.com', body, {headers}).subscribe();
           }));

        it('should use object body and detect content type header to the request',
           inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
             const body = {test: 'val'};
             backend.mockRequests.subscribe(req => {
               expect(req.request.headers.get('content-type')).toBe('application/json');
               expect(req.request.text()).toBe('{"test":"val"}');
               backend.resolveAllConnections();
               async.done();
             });
             http.post('http://google.com', body).subscribe();
           }));

        it('should use number body and detect content type header to the request',
           inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
             const body = 42;
             backend.mockRequests.subscribe(req => {
               expect(req.request.headers.get('content-type')).toBe('text/plain');
               expect(req.request.text()).toBe('42');
               backend.resolveAllConnections();
               async.done();
             });
             http.post('http://google.com', body).subscribe();
           }));

        it('should use string body and detect content type header to the request',
           () => inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
             const body = 'some string';
             backend.mockRequests.subscribe(req => {
               expect(req.request.headers.get('content-type')).toBe('text/plain');
               backend.resolveAllConnections();
               async.done();
             });
             http.post('http://google.com', body).subscribe();
           }));

        it('should use URLSearchParams body and detect content type header to the request',
           inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
             const body = new HttpUrlParams();
             body.set('test1', 'val1');
             body.set('test2', 'val2');
             backend.mockRequests.subscribe(req => {
               expect(req.request.headers.get('content-type'))
                   .toBe('application/x-www-form-urlencoded;charset=UTF-8');
               expect(req.request.text()).toBe('test1=val1&test2=val2');
               backend.resolveAllConnections();
               async.done();
             });
             http.post('http://google.com', body).subscribe();
           }));

        if ((global as any)['Blob']) {
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

          it('should use FormData body and detect content type header to the request',
             inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
               const body = new FormData();
               body.append('test1', 'val1');
               body.append('test2', 123456);
               const blob = createBlob(['body { color: red; }'], 'text/css');
               body.append('userfile', blob);
               backend.mockRequests.subscribe(req => {
                 // TODO(alxhub): test content type.
                 backend.resolveAllConnections();
                 async.done();
               });
               http.post('http://google.com', body).subscribe();
             }));

          it('should use blob body and detect content type header to the request',
             inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
               const body = createBlob(['body { color: red; }'], 'text/css');
               backend.mockRequests.subscribe(req => {
                 expect(req.request.headers.get('content-type')).toEqual('text/css');
                 expect(req.request.blob()).toBe(body);
                 backend.resolveAllConnections();
                 async.done();
               });
               http.post('http://google.com', body).subscribe();
             }));

          it('should use blob body without type to the request',
             inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
               const body = createBlob(['body { color: red; }'], null);
               backend.mockRequests.subscribe(req => {
                 expect(req.request.headers.has('content-type')).toBeFalsy();
                 expect(req.request.blob()).toBe(body);
                 backend.resolveAllConnections();
                 async.done();
               });
               http.post('http://google.com', body).subscribe();
             }));

          it('should use blob body without type with custom content type header to the request',
             inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
               const headers = new HttpHeaders({'Content-Type': 'text/css'});
               const body = createBlob(['body { color: red; }'], null);
               backend.mockRequests.subscribe(req => {
                 expect(req.request.headers.get('content-type')).toBe('text/css');
                 expect(req.request.blob()).toBe(body);
                 backend.resolveAllConnections();
                 async.done();
               });
               http.post('http://google.com', body, {headers}).subscribe();
             }));
        }

        it('should use array buffer body to the request',
           inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
             const body = new ArrayBuffer(512);
             const longInt8View = new Uint8Array(body);
             for (let i = 0; i < longInt8View.length; i++) {
               longInt8View[i] = i % 255;
             }
             backend.mockRequests.subscribe(req => {
               expect(req.request.headers.has('content-type')).toBeFalsy();
               backend.resolveAllConnections();
               async.done();
             });
             http.post('http://google.com', body).subscribe();
           }));

        it('should use array buffer body without type with custom content type header to the request',
           inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
             const headers = new HttpHeaders({'Content-Type': 'text/css'});
             const body = new ArrayBuffer(512);
             const longInt8View = new Uint8Array(body);
             for (let i = 0; i < longInt8View.length; i++) {
               longInt8View[i] = i % 255;
             }
             backend.mockRequests.subscribe(req => {
               expect(req.request.headers.get('content-type')).toBe('text/css');
               backend.resolveAllConnections();
               async.done();
             });
             http.post('http://google.com', body, {headers}).subscribe();
           }));
      });
    });
  });
}
