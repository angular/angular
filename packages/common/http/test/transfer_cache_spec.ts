/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DOCUMENT} from '../../index';
import {
  ApplicationRef,
  Component,
  Injectable,
  PLATFORM_ID,
  TransferState,
  makeStateKey,
} from '@angular/core';
import {fakeAsync, flush, TestBed} from '@angular/core/testing';
import {withBody} from '@angular/private/testing';
import {BehaviorSubject} from 'rxjs';

import {HttpClient, HttpResponse, provideHttpClient} from '../public_api';
import {
  BODY,
  HEADERS,
  HTTP_TRANSFER_CACHE_ORIGIN_MAP,
  RESPONSE_TYPE,
  STATUS,
  STATUS_TEXT,
  REQ_URL,
  withHttpTransferCache,
} from '../src/transfer_cache';
import {HttpTestingController, provideHttpClientTesting} from '../testing';
import {PLATFORM_BROWSER_ID, PLATFORM_SERVER_ID} from '../../src/platform_id';

interface RequestParams {
  method?: string;
  observe?: 'body' | 'response';
  transferCache?: {includeHeaders: string[]} | boolean;
  headers?: {[key: string]: string};
  body?: RequestBody;
}

type RequestBody =
  | ArrayBuffer
  | Blob
  | boolean
  | string
  | number
  | Object
  | (boolean | string | number | Object | null)[]
  | null;

describe('TransferCache', () => {
  @Component({
    selector: 'test-app-http',
    template: 'hello',
    standalone: false,
  })
  class SomeComponent {}

  describe('withHttpTransferCache', () => {
    let isStable: BehaviorSubject<boolean>;

    function makeRequestAndExpectOne(
      url: string,
      body: RequestBody,
      params?: RequestParams,
    ): string;
    function makeRequestAndExpectOne(
      url: string,
      body: RequestBody,
      params?: RequestParams & {observe: 'response'},
    ): HttpResponse<string>;
    function makeRequestAndExpectOne(url: string, body: RequestBody, params?: RequestParams): any {
      let response!: any;
      TestBed.inject(HttpClient)
        .request(params?.method ?? 'GET', url, params)
        .subscribe((r) => (response = r));
      TestBed.inject(HttpTestingController).expectOne(url).flush(body, {headers: params?.headers});
      return response;
    }

    function makeRequestAndExpectNone(
      url: string,
      method: string = 'GET',
      params?: RequestParams,
    ): HttpResponse<string> {
      let response!: HttpResponse<string>;
      TestBed.inject(HttpClient)
        .request(method, url, {observe: 'response', ...params})
        .subscribe((r) => (response = r));
      TestBed.inject(HttpTestingController).expectNone(url);
      return response;
    }

    beforeEach(() => {
      globalThis['ngServerMode'] = true;
    });

    afterEach(() => {
      globalThis['ngServerMode'] = undefined;
    });

    beforeEach(
      withBody('<test-app-http></test-app-http>', () => {
        TestBed.resetTestingModule();
        isStable = new BehaviorSubject<boolean>(false);

        @Injectable()
        class ApplicationRefPatched extends ApplicationRef {
          override get isStable() {
            return isStable;
          }
        }

        TestBed.configureTestingModule({
          declarations: [SomeComponent],
          providers: [
            {provide: PLATFORM_ID, useValue: PLATFORM_SERVER_ID},
            {provide: DOCUMENT, useFactory: () => document},
            {provide: ApplicationRef, useClass: ApplicationRefPatched},
            withHttpTransferCache({}),
            provideHttpClient(),
            provideHttpClientTesting(),
          ],
        });

        const appRef = TestBed.inject(ApplicationRef);
        appRef.bootstrap(SomeComponent);
      }),
    );

    it('should store HTTP calls in cache when application is not stable', () => {
      makeRequestAndExpectOne('/test', 'foo');
      const transferState = TestBed.inject(TransferState);
      const key = makeStateKey(Object.keys((transferState as any).store)[0]);
      expect(transferState.get(key, null)).toEqual(jasmine.objectContaining({[BODY]: 'foo'}));
    });

    it('should stop storing HTTP calls in `TransferState` after application becomes stable', fakeAsync(() => {
      makeRequestAndExpectOne('/test-1', 'foo');
      makeRequestAndExpectOne('/test-2', 'buzz');

      isStable.next(true);

      flush();

      makeRequestAndExpectOne('/test-3', 'bar');

      const transferState = TestBed.inject(TransferState);
      expect(JSON.parse(transferState.toJson()) as Record<string, unknown>).toEqual({
        '2400571479': {
          [BODY]: 'foo',
          [HEADERS]: {},
          [STATUS]: 200,
          [STATUS_TEXT]: 'OK',
          [REQ_URL]: '/test-1',
          [RESPONSE_TYPE]: 'json',
        },
        '2400572440': {
          [BODY]: 'buzz',
          [HEADERS]: {},
          [STATUS]: 200,
          [STATUS_TEXT]: 'OK',
          [REQ_URL]: '/test-2',
          [RESPONSE_TYPE]: 'json',
        },
      });
    }));

    it(`should use calls from cache when present and application is not stable`, () => {
      makeRequestAndExpectOne('/test-1', 'foo');
      // Do the same call, this time it should served from cache.
      makeRequestAndExpectNone('/test-1');
    });

    it(`should not use calls from cache when present and application is stable`, fakeAsync(() => {
      makeRequestAndExpectOne('/test-1', 'foo');

      isStable.next(true);
      flush();
      // Do the same call, this time it should go through as application is stable.
      makeRequestAndExpectOne('/test-1', 'foo');
    }));

    it(`should differentiate calls with different parameters`, async () => {
      // make calls with different parameters. All of which should be saved in the state.
      makeRequestAndExpectOne('/test-1?foo=1', 'foo');
      makeRequestAndExpectOne('/test-1', 'foo');
      makeRequestAndExpectOne('/test-1?foo=2', 'buzz');

      makeRequestAndExpectNone('/test-1?foo=1');
      await expectAsync(TestBed.inject(HttpClient).get('/test-1?foo=1').toPromise()).toBeResolvedTo(
        'foo',
      );
    });

    it('should skip cache when specified', () => {
      makeRequestAndExpectOne('/test-1?foo=1', 'foo', {transferCache: false});
      // The previous request wasn't cached so this one can't use the cache
      makeRequestAndExpectOne('/test-1?foo=1', 'foo');
      // But this one will
      makeRequestAndExpectNone('/test-1?foo=1');
    });

    it('should not cache a POST even with filter true specified', () => {
      makeRequestAndExpectOne('/test-1?foo=1', 'post-body', {method: 'POST'});

      // Previous POST request wasn't cached
      makeRequestAndExpectOne('/test-1?foo=1', 'body2', {method: 'POST'});

      // filter => true won't cache neither
      makeRequestAndExpectOne('/test-1?foo=1', 'post-body', {method: 'POST', transferCache: true});

      const response = makeRequestAndExpectOne('/test-1?foo=1', 'body2', {method: 'POST'});
      expect(response).toBe('body2');
    });

    it('should not cache headers', async () => {
      // HttpTransferCacheOptions: true = fallback to default = headers won't be cached
      makeRequestAndExpectOne('/test-1?foo=1', 'foo', {
        headers: {foo: 'foo', bar: 'bar'},
        transferCache: true,
      });

      // request returns the cache without any header.
      const response2 = makeRequestAndExpectNone('/test-1?foo=1');
      expect(response2.headers.keys().length).toBe(0);
    });

    it('should cache with headers', async () => {
      // headers are case not sensitive
      makeRequestAndExpectOne('/test-1?foo=1', 'foo', {
        headers: {foo: 'foo', bar: 'bar', 'BAZ': 'baz'},
        transferCache: {includeHeaders: ['foo', 'baz']},
      });

      const consoleWarnSpy = spyOn(console, 'warn');
      // request returns the cache with only 2 header entries.
      const response = makeRequestAndExpectNone('/test-1?foo=1', 'GET', {
        transferCache: {includeHeaders: ['foo', 'baz']},
      });
      expect(response.headers.keys().length).toBe(2);

      // foo has been kept
      const foo = response.headers.get('foo');
      expect(foo).toBe('foo');

      // foo wasn't removed, we won't log anything
      expect(consoleWarnSpy.calls.count()).toBe(0);

      // bar has been removed
      response.headers.get('bar');
      response.headers.get('some-other-header');

      expect(consoleWarnSpy.calls.count()).toBe(2);

      response.headers.get('some-other-header');

      // We ensure the warning is only logged once per header method + entry
      expect(consoleWarnSpy.calls.count()).toBe(2);

      response.headers.has('some-other-header');

      // Here the method is different, we get one more call.
      expect(consoleWarnSpy.calls.count()).toBe(3);
    });

    it('should not cache POST by default', () => {
      makeRequestAndExpectOne('/test-1?foo=1', 'foo', {method: 'POST'});
      makeRequestAndExpectOne('/test-1?foo=1', 'foo', {method: 'POST'});
    });

    it('should cache POST with the transferCache option', () => {
      makeRequestAndExpectOne('/test-1?foo=1', 'foo', {method: 'POST', transferCache: true});
      makeRequestAndExpectNone('/test-1?foo=1', 'POST', {transferCache: true});

      makeRequestAndExpectOne('/test-2?foo=1', 'foo', {
        method: 'POST',
        transferCache: {includeHeaders: []},
      });
      makeRequestAndExpectNone('/test-2?foo=1', 'POST', {transferCache: true});
    });

    it('should not cache request that requires authorization by default', async () => {
      makeRequestAndExpectOne('/test-auth', 'foo', {
        headers: {Authorization: 'Basic YWxhZGRpbjpvcGVuc2VzYW1l'},
      });

      makeRequestAndExpectOne('/test-auth', 'foo');
    });

    it('should not cache request that requires proxy authorization by default', async () => {
      makeRequestAndExpectOne('/test-auth', 'foo', {
        headers: {'Proxy-Authorization': 'Basic YWxhZGRpbjpvcGVuc2VzYW1l'},
      });

      makeRequestAndExpectOne('/test-auth', 'foo');
    });

    it('should cache POST with the differing body in string form', () => {
      makeRequestAndExpectOne('/test-1', null, {method: 'POST', transferCache: true, body: 'foo'});
      makeRequestAndExpectNone('/test-1', 'POST', {transferCache: true, body: 'foo'});
      makeRequestAndExpectOne('/test-1', null, {method: 'POST', transferCache: true, body: 'bar'});
    });

    it('should cache POST with the differing body in object form', () => {
      makeRequestAndExpectOne('/test-1', null, {
        method: 'POST',
        transferCache: true,
        body: {foo: true},
      });
      makeRequestAndExpectNone('/test-1', 'POST', {transferCache: true, body: {foo: true}});
      makeRequestAndExpectOne('/test-1', null, {
        method: 'POST',
        transferCache: true,
        body: {foo: false},
      });
    });

    it('should cache POST with the differing body in URLSearchParams form', () => {
      makeRequestAndExpectOne('/test-1', null, {
        method: 'POST',
        transferCache: true,
        body: new URLSearchParams('foo=1'),
      });
      makeRequestAndExpectNone('/test-1', 'POST', {
        transferCache: true,
        body: new URLSearchParams('foo=1'),
      });
      makeRequestAndExpectOne('/test-1', null, {
        method: 'POST',
        transferCache: true,
        body: new URLSearchParams('foo=2'),
      });
    });

    describe('caching in browser context', () => {
      beforeEach(() => {
        globalThis['ngServerMode'] = false;
      });

      afterEach(() => {
        globalThis['ngServerMode'] = undefined;
      });

      beforeEach(
        withBody('<test-app-http></test-app-http>', () => {
          TestBed.resetTestingModule();
          isStable = new BehaviorSubject<boolean>(false);

          @Injectable()
          class ApplicationRefPatched extends ApplicationRef {
            override get isStable() {
              return new BehaviorSubject<boolean>(false);
            }
          }

          TestBed.configureTestingModule({
            declarations: [SomeComponent],
            providers: [
              {provide: PLATFORM_ID, useValue: PLATFORM_BROWSER_ID},
              {provide: DOCUMENT, useFactory: () => document},
              {provide: ApplicationRef, useClass: ApplicationRefPatched},
              withHttpTransferCache({}),
              provideHttpClient(),
              provideHttpClientTesting(),
            ],
          });

          const appRef = TestBed.inject(ApplicationRef);
          appRef.bootstrap(SomeComponent);
          isStable = appRef.isStable as BehaviorSubject<boolean>;
        }),
      );

      it('should skip storing in transfer cache when platform is browser', () => {
        makeRequestAndExpectOne('/test-1?foo=1', 'foo');
        makeRequestAndExpectOne('/test-1?foo=1', 'foo');
      });
    });

    describe('caching with global setting', () => {
      beforeEach(
        withBody('<test-app-http></test-app-http>', () => {
          TestBed.resetTestingModule();
          isStable = new BehaviorSubject<boolean>(false);

          @Injectable()
          class ApplicationRefPatched extends ApplicationRef {
            override get isStable() {
              return new BehaviorSubject<boolean>(false);
            }
          }

          TestBed.configureTestingModule({
            declarations: [SomeComponent],
            providers: [
              {provide: PLATFORM_ID, useValue: PLATFORM_SERVER_ID},
              {provide: DOCUMENT, useFactory: () => document},
              {provide: ApplicationRef, useClass: ApplicationRefPatched},
              withHttpTransferCache({
                filter: (req) => {
                  if (req.url.includes('include')) {
                    return true;
                  } else if (req.url.includes('exclude')) {
                    return false;
                  } else {
                    return true;
                  }
                },
                includeHeaders: ['foo', 'bar'],
                includePostRequests: true,
                includeRequestsWithAuthHeaders: true,
              }),
              provideHttpClient(),
              provideHttpClientTesting(),
            ],
          });

          const appRef = TestBed.inject(ApplicationRef);
          appRef.bootstrap(SomeComponent);
          isStable = appRef.isStable as BehaviorSubject<boolean>;
        }),
      );

      it('should cache because of global filter', () => {
        makeRequestAndExpectOne('/include?foo=1', 'foo');
        makeRequestAndExpectNone('/include?foo=1');
      });

      it('should not cache because of global filter', () => {
        makeRequestAndExpectOne('/exclude?foo=1', 'foo');
        makeRequestAndExpectOne('/exclude?foo=1', 'foo');
      });

      it(`should cache request that requires authorization when 'includeRequestsWithAuthHeaders' is 'true'`, async () => {
        makeRequestAndExpectOne('/test-auth', 'foo', {
          headers: {Authorization: 'Basic YWxhZGRpbjpvcGVuc2VzYW1l'},
        });

        makeRequestAndExpectNone('/test-auth');
      });

      it(`should cache request that requires proxy authorization when 'includeRequestsWithAuthHeaders' is 'true'`, async () => {
        makeRequestAndExpectOne('/test-auth', 'foo', {
          headers: {'Proxy-Authorization': 'Basic YWxhZGRpbjpvcGVuc2VzYW1l'},
        });

        makeRequestAndExpectNone('/test-auth');
      });

      it('should cache a POST request', () => {
        makeRequestAndExpectOne('/include?foo=1', 'post-body', {method: 'POST'});

        // Previous POST request wasn't cached
        const response = makeRequestAndExpectNone('/include?foo=1', 'POST');
        expect(response.body).toBe('post-body');
      });

      it('should cache with headers', () => {
        //  nothing specified, should use global options = callback => include + headers
        makeRequestAndExpectOne('/include?foo=1', 'foo', {headers: {foo: 'foo', bar: 'bar'}});

        // This one was cached with headers
        const response = makeRequestAndExpectNone('/include?foo=1');
        expect(response.headers.keys().length).toBe(2);
      });

      it('should cache without headers because overridden', () => {
        //  nothing specified, should use global options = callback => include + headers
        makeRequestAndExpectOne('/include?foo=1', 'foo', {
          headers: {foo: 'foo', bar: 'bar'},
          transferCache: {includeHeaders: []},
        });

        // This one was cached with headers
        const response = makeRequestAndExpectNone('/include?foo=1');
        expect(response.headers.keys().length).toBe(0);
      });
    });

    describe('caching with public origins', () => {
      beforeEach(
        withBody('<test-app-http></test-app-http>', () => {
          TestBed.resetTestingModule();
          isStable = new BehaviorSubject<boolean>(false);

          @Injectable()
          class ApplicationRefPatched extends ApplicationRef {
            override get isStable() {
              return new BehaviorSubject<boolean>(false);
            }
          }

          TestBed.configureTestingModule({
            declarations: [SomeComponent],
            providers: [
              {provide: PLATFORM_ID, useValue: PLATFORM_SERVER_ID},
              {provide: DOCUMENT, useFactory: () => document},
              {provide: ApplicationRef, useClass: ApplicationRefPatched},
              withHttpTransferCache({}),
              provideHttpClient(),
              provideHttpClientTesting(),
              {
                provide: HTTP_TRANSFER_CACHE_ORIGIN_MAP,
                useValue: {
                  'http://internal-domain.com:1234': 'https://external-domain.net:443',
                },
              },
            ],
          });

          const appRef = TestBed.inject(ApplicationRef);
          appRef.bootstrap(SomeComponent);
          isStable = appRef.isStable as BehaviorSubject<boolean>;
        }),
      );

      it('should cache with public origin', () => {
        makeRequestAndExpectOne('http://internal-domain.com:1234/test-1?foo=1', 'foo');
        const cachedRequest = makeRequestAndExpectNone(
          'https://external-domain.net:443/test-1?foo=1',
        );
        expect(cachedRequest.url).toBe('https://external-domain.net:443/test-1?foo=1');
      });

      it('should cache normally when there is no mapping defined for the origin', () => {
        makeRequestAndExpectOne('https://other.internal-domain.com:1234/test-1?foo=1', 'foo');
        makeRequestAndExpectNone('https://other.internal-domain.com:1234/test-1?foo=1');
      });

      describe('when the origin map is configured with extra paths', () => {
        beforeEach(
          withBody('<test-app-http></test-app-http>', () => {
            TestBed.resetTestingModule();
            isStable = new BehaviorSubject<boolean>(false);

            @Injectable()
            class ApplicationRefPatched extends ApplicationRef {
              override get isStable() {
                return new BehaviorSubject<boolean>(false);
              }
            }

            TestBed.configureTestingModule({
              declarations: [SomeComponent],
              providers: [
                {provide: PLATFORM_ID, useValue: PLATFORM_SERVER_ID},
                {provide: DOCUMENT, useFactory: () => document},
                {provide: ApplicationRef, useClass: ApplicationRefPatched},
                withHttpTransferCache({}),
                provideHttpClient(),
                provideHttpClientTesting(),
                {
                  provide: HTTP_TRANSFER_CACHE_ORIGIN_MAP,
                  useValue: {
                    'http://internal-domain.com:1234': 'https://external-domain.net:443/path',
                  },
                },
              ],
            });

            const appRef = TestBed.inject(ApplicationRef);
            appRef.bootstrap(SomeComponent);
            isStable = appRef.isStable as BehaviorSubject<boolean>;
          }),
        );

        it('should throw an error when the origin map is configured with extra paths', () => {
          TestBed.inject(HttpClient)
            .request('GET', 'http://internal-domain.com:1234/path/test-1')
            .subscribe({
              error: (error: Error) => {
                expect(error.message).toBe(
                  'NG02804: Angular detected a URL with a path segment in the value provided for the ' +
                    '`HTTP_TRANSFER_CACHE_ORIGIN_MAP` token: https://external-domain.net:443/path. ' +
                    'The map should only contain origins without any other segments.',
                );
              },
            });
        });
      });

      describe('on the client', () => {
        beforeEach(
          withBody('<test-app-http></test-app-http>', () => {
            TestBed.resetTestingModule();
            isStable = new BehaviorSubject<boolean>(false);

            @Injectable()
            class ApplicationRefPatched extends ApplicationRef {
              override get isStable() {
                return new BehaviorSubject<boolean>(false);
              }
            }

            TestBed.configureTestingModule({
              declarations: [SomeComponent],
              providers: [
                {provide: DOCUMENT, useFactory: () => document},
                {provide: ApplicationRef, useClass: ApplicationRefPatched},
                withHttpTransferCache({}),
                provideHttpClient(),
                provideHttpClientTesting(),
                {
                  provide: HTTP_TRANSFER_CACHE_ORIGIN_MAP,
                  useValue: {
                    'http://internal-domain.com:1234': 'https://external-domain.net:443',
                  },
                },
                {provide: PLATFORM_ID, useValue: PLATFORM_SERVER_ID},
              ],
            });

            // Make a request on the server to fill the transfer state then reuse it in the browser
            makeRequestAndExpectOne('http://internal-domain.com:1234/test-1?foo=1', 'foo');
            const transferState = TestBed.inject(TransferState);

            TestBed.resetTestingModule();
            TestBed.configureTestingModule({
              declarations: [SomeComponent],
              providers: [
                {provide: DOCUMENT, useFactory: () => document},
                {provide: ApplicationRef, useClass: ApplicationRefPatched},
                withHttpTransferCache({}),
                provideHttpClient(),
                provideHttpClientTesting(),
                {
                  provide: HTTP_TRANSFER_CACHE_ORIGIN_MAP,
                  useValue: {
                    'http://internal-domain.com:1234': 'https://external-domain.net:443',
                  },
                },
                {provide: TransferState, useValue: transferState},
                {provide: PLATFORM_ID, useValue: PLATFORM_BROWSER_ID},
              ],
            });

            const appRef = TestBed.inject(ApplicationRef);
            appRef.bootstrap(SomeComponent);
            isStable = appRef.isStable as BehaviorSubject<boolean>;
          }),
        );

        it('should throw an error when origin mapping is defined', () => {
          TestBed.inject(HttpClient)
            .request('GET', 'https://external-domain.net:443/test-1?foo=1')
            .subscribe({
              error: (error: Error) => {
                expect(error.message).toBe(
                  'NG02803: Angular detected that the `HTTP_TRANSFER_CACHE_ORIGIN_MAP` token is configured and ' +
                    'present in the client side code. Please ensure that this token is only provided in the ' +
                    'server code of the application.',
                );
              },
            });
        });
      });
    });
  });
});
