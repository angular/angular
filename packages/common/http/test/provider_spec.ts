/**
 * @license
 * Copyright Google LLC All Rights Reserved.sonpCallbackContext
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DOCUMENT, XhrFactory} from '../../index';
import {
  FetchBackend,
  HTTP_INTERCEPTORS,
  HttpBackend,
  HttpClient,
  HttpClientModule,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
  HttpXhrBackend,
  JsonpClientBackend,
} from '../index';
import {HttpClientTestingModule, HttpTestingController, provideHttpClientTesting} from '../testing';
import {
  ApplicationRef,
  createEnvironmentInjector,
  EnvironmentInjector,
  ErrorHandler,
  inject,
  InjectionToken,
  PLATFORM_ID,
  Provider,
} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {EMPTY, Observable, from} from 'rxjs';

import {HttpInterceptorFn, resetFetchBackendWarningFlag} from '../src/interceptor';
import {
  HttpFeature,
  HttpFeatureKind,
  provideHttpClient,
  withFetch,
  withInterceptors,
  withInterceptorsFromDi,
  withJsonpSupport,
  withNoXsrfProtection,
  withRequestsMadeViaParent,
  withXsrfConfiguration,
} from '../src/provider';

describe('without provideHttpClientTesting', () => {
  it('should contribute to stability', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([() => from(Promise.resolve(new HttpResponse()))])),
      ],
    });

    let stable = false;
    const appRef = TestBed.inject(ApplicationRef);
    TestBed.inject(ApplicationRef).isStable.subscribe((v) => {
      stable = v;
    });

    expect(stable).toBe(true);
    TestBed.inject(HttpClient).get('/test', {responseType: 'text'}).subscribe();
    expect(stable).toBe(false);
    await expectAsync(appRef.whenStable()).toBeResolved();
  });

  it('can use an ErrorHandler that injects HttpClient', () => {
    // This test ensures there is no circular dependency:
    // possible loops are:
    // INTERNAL_APPLICATION_ERROR_HANDLER -> ErrorHandler -> HttpClient -> PendingTasks -> ChangeDetectionScheduler -> INTERNAL_APPLICATION_ERROR_HANDLER
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([() => from(Promise.resolve(new HttpResponse()))])),
        {
          provide: ErrorHandler,
          useClass: class extends ErrorHandler {
            client = inject(HttpClient);
            override handleError(error: any): void {}
          },
        },
      ],
    });

    expect(() => TestBed.inject(ApplicationRef)).not.toThrow();
  });
});

describe('provideHttpClient', () => {
  beforeEach(() => {
    setCookie('');
    TestBed.resetTestingModule();
  });

  afterEach(() => {
    let controller: HttpTestingController;
    try {
      controller = TestBed.inject(HttpTestingController);
    } catch (err) {
      // A failure here means that TestBed wasn't successfully configured. Some tests intentionally
      // test configuration errors and therefore exit without setting up TestBed for HTTP, so just
      // exit here without performing verification on the `HttpTestingController` in that case.
      return;
    }
    controller.verify();
  });

  it('should configure HttpClient', () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    TestBed.inject(HttpClient).get('/test', {responseType: 'text'}).subscribe();
    TestBed.inject(HttpTestingController).expectOne('/test').flush('');
  });

  it('should not contribute to stability', () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    let stable = false;
    TestBed.inject(ApplicationRef).isStable.subscribe((v) => {
      stable = v;
    });

    expect(stable).toBe(true);
    TestBed.inject(HttpClient).get('/test', {responseType: 'text'}).subscribe();
    expect(stable).toBe(true);
    TestBed.inject(HttpTestingController).expectOne('/test').flush('');
    expect(stable).toBe(true);
  });

  it('should not use legacy interceptors by default', () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideLegacyInterceptor('legacy'),
        provideHttpClientTesting(),
      ],
    });

    TestBed.inject(HttpClient).get('/test', {responseType: 'text'}).subscribe();
    const req = TestBed.inject(HttpTestingController).expectOne('/test');
    expect(req.request.headers.has('X-Tag')).toBeFalse();
    req.flush('');
  });

  it('withInterceptorsFromDi() should enable legacy interceptors', () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideLegacyInterceptor('alpha'),
        provideLegacyInterceptor('beta'),
        provideHttpClientTesting(),
      ],
    });

    TestBed.inject(HttpClient).get('/test', {responseType: 'text'}).subscribe();
    const req = TestBed.inject(HttpTestingController).expectOne('/test');
    expect(req.request.headers.get('X-Tag')).toEqual('alpha,beta');
    req.flush('');
  });

  describe('interceptor functions', () => {
    it('should allow configuring interceptors', () => {
      TestBed.configureTestingModule({
        providers: [
          provideHttpClient(
            withInterceptors([
              makeLiteralTagInterceptorFn('alpha'),
              makeLiteralTagInterceptorFn('beta'),
            ]),
          ),
          provideHttpClientTesting(),
        ],
      });

      TestBed.inject(HttpClient).get('/test', {responseType: 'text'}).subscribe();
      const req = TestBed.inject(HttpTestingController).expectOne('/test');
      expect(req.request.headers.get('X-Tag')).toEqual('alpha,beta');
      req.flush('');
    });

    it('should accept multiple separate interceptor configs', () => {
      TestBed.configureTestingModule({
        providers: [
          provideHttpClient(
            withInterceptors([makeLiteralTagInterceptorFn('alpha')]),
            withInterceptors([makeLiteralTagInterceptorFn('beta')]),
          ),
          provideHttpClientTesting(),
        ],
      });

      TestBed.inject(HttpClient).get('/test', {responseType: 'text'}).subscribe();
      const req = TestBed.inject(HttpTestingController).expectOne('/test');
      expect(req.request.headers.get('X-Tag')).toEqual('alpha,beta');
      req.flush('');
    });

    it('should allow injection from an interceptor context', () => {
      const ALPHA = new InjectionToken<string>('alpha', {
        providedIn: 'root',
        factory: () => 'alpha',
      });
      const BETA = new InjectionToken<string>('beta', {providedIn: 'root', factory: () => 'beta'});

      TestBed.configureTestingModule({
        providers: [
          provideHttpClient(
            withInterceptors([makeTokenTagInterceptorFn(ALPHA), makeTokenTagInterceptorFn(BETA)]),
          ),
          provideHttpClientTesting(),
        ],
      });

      TestBed.inject(HttpClient).get('/test', {responseType: 'text'}).subscribe();
      const req = TestBed.inject(HttpTestingController).expectOne('/test');
      expect(req.request.headers.get('X-Tag')).toEqual('alpha,beta');
      req.flush('');
    });

    it('should allow combination with legacy interceptors, before the legacy stack', () => {
      TestBed.configureTestingModule({
        providers: [
          provideHttpClient(
            withInterceptors([makeLiteralTagInterceptorFn('functional')]),
            withInterceptorsFromDi(),
          ),
          provideHttpClientTesting(),
          provideLegacyInterceptor('legacy'),
        ],
      });

      TestBed.inject(HttpClient).get('/test', {responseType: 'text'}).subscribe();
      const req = TestBed.inject(HttpTestingController).expectOne('/test');
      expect(req.request.headers.get('X-Tag')).toEqual('functional,legacy');
      req.flush('');
    });

    it('should allow combination with legacy interceptors, after the legacy stack', () => {
      TestBed.configureTestingModule({
        providers: [
          provideHttpClient(
            withInterceptorsFromDi(),
            withInterceptors([makeLiteralTagInterceptorFn('functional')]),
          ),
          provideHttpClientTesting(),
          provideLegacyInterceptor('legacy'),
        ],
      });

      TestBed.inject(HttpClient).get('/test', {responseType: 'text'}).subscribe();
      const req = TestBed.inject(HttpTestingController).expectOne('/test');
      expect(req.request.headers.get('X-Tag')).toEqual('legacy,functional');
      req.flush('');
    });
  });

  describe('xsrf protection', () => {
    it('should enable xsrf protection by default', () => {
      TestBed.configureTestingModule({
        providers: [
          provideHttpClient(),
          provideHttpClientTesting(),
          {provide: PLATFORM_ID, useValue: 'test'},
        ],
      });

      setXsrfToken('abcdefg');

      TestBed.inject(HttpClient).post('/test', '', {responseType: 'text'}).subscribe();
      const req = TestBed.inject(HttpTestingController).expectOne('/test');
      expect(req.request.headers.get('X-XSRF-TOKEN')).toEqual('abcdefg');
      req.flush('');
    });

    it('withXsrfConfiguration() should allow customization of xsrf config', () => {
      TestBed.configureTestingModule({
        providers: [
          provideHttpClient(
            withXsrfConfiguration({
              cookieName: 'XSRF-CUSTOM-COOKIE',
              headerName: 'X-Custom-Xsrf-Header',
            }),
          ),
          provideHttpClientTesting(),
          {provide: PLATFORM_ID, useValue: 'test'},
        ],
      });

      setCookie('XSRF-CUSTOM-COOKIE=abcdefg');
      TestBed.inject(HttpClient).post('/test', '', {responseType: 'text'}).subscribe();
      const req = TestBed.inject(HttpTestingController).expectOne('/test');
      expect(req.request.headers.get('X-Custom-Xsrf-Header')).toEqual('abcdefg');
      req.flush('');
    });

    it('withNoXsrfProtection() should disable xsrf protection', () => {
      TestBed.configureTestingModule({
        providers: [
          provideHttpClient(withNoXsrfProtection()),
          provideHttpClientTesting(),
          {provide: PLATFORM_ID, useValue: 'test'},
        ],
      });
      setXsrfToken('abcdefg');

      TestBed.inject(HttpClient).post('/test', '', {responseType: 'text'}).subscribe();
      const req = TestBed.inject(HttpTestingController).expectOne('/test');
      expect(req.request.headers.has('X-Custom-Xsrf-Header')).toBeFalse();
      req.flush('');
    });

    it('should error if withXsrfConfiguration() and withNoXsrfProtection() are combined', () => {
      expect(() => {
        TestBed.configureTestingModule({
          providers: [
            provideHttpClient(withNoXsrfProtection(), withXsrfConfiguration({})),
            provideHttpClientTesting(),
            {provide: PLATFORM_ID, useValue: 'test'},
          ],
        });
      }).toThrow();
    });
  });

  describe('JSONP support', () => {
    it('should not be enabled by default', () => {
      TestBed.configureTestingModule({
        providers: [provideHttpClient(), provideHttpClientTesting()],
      });

      TestBed.inject(HttpClient).jsonp('/test', 'callback').subscribe();

      // Because no JSONP interceptor should be registered, this request should go to the testing
      // backend.
      TestBed.inject(HttpTestingController).expectOne('/test?callback=JSONP_CALLBACK').flush('');
    });

    it('should be enabled when using withJsonpSupport()', () => {
      TestBed.configureTestingModule({
        providers: [
          provideHttpClient(withJsonpSupport()),
          provideHttpClientTesting(),
          FAKE_JSONP_BACKEND_PROVIDER,
        ],
      });

      TestBed.inject(HttpClient).jsonp('/test', 'callback').subscribe();
      TestBed.inject(HttpTestingController).expectNone('/test?callback=JSONP_CALLBACK');
    });
  });

  describe('withRequestsMadeViaParent()', () => {
    for (const backend of ['fetch', 'xhr']) {
      describe(`given '${backend}' backend`, () => {
        const commonHttpFeatures: HttpFeature<HttpFeatureKind>[] = [];
        if (backend === 'fetch') {
          commonHttpFeatures.push(withFetch());
        }

        it('should have independent HTTP setups if not explicitly specified', async () => {
          TestBed.configureTestingModule({
            providers: [provideHttpClient(...commonHttpFeatures), provideHttpClientTesting()],
          });

          const child = createEnvironmentInjector(
            [
              provideHttpClient(),
              {
                provide: XhrFactory,
                useValue: {
                  build: () => {
                    throw new Error('Request reached the "backend".');
                  },
                },
              },
            ],
            TestBed.inject(EnvironmentInjector),
          );

          // Because `child` is an entirely independent HTTP context, it is not connected to the
          // HTTP testing backend from the parent injector, and requests attempted via the child's
          // `HttpClient` will fail.
          await expectAsync(child.get(HttpClient).get('/test').toPromise()).toBeRejected();
        });

        it('should connect child to parent configuration if specified', () => {
          TestBed.configureTestingModule({
            providers: [provideHttpClient(...commonHttpFeatures), provideHttpClientTesting()],
          });

          const child = createEnvironmentInjector(
            [provideHttpClient(withRequestsMadeViaParent())],
            TestBed.inject(EnvironmentInjector),
          );

          // `child` is now to the parent HTTP context and therefore the testing backend, and so a
          // request made via its `HttpClient` can be made.
          child.get(HttpClient).get('/test', {responseType: 'text'}).subscribe();
          const req = TestBed.inject(HttpTestingController).expectOne('/test');
          req.flush('');
        });

        it('should include interceptors from both parent and child contexts', () => {
          TestBed.configureTestingModule({
            providers: [
              provideHttpClient(
                ...commonHttpFeatures,
                withInterceptors([makeLiteralTagInterceptorFn('parent')]),
              ),
              provideHttpClientTesting(),
            ],
          });

          const child = createEnvironmentInjector(
            [
              provideHttpClient(
                withRequestsMadeViaParent(),
                withInterceptors([makeLiteralTagInterceptorFn('child')]),
              ),
            ],
            TestBed.inject(EnvironmentInjector),
          );

          child.get(HttpClient).get('/test', {responseType: 'text'}).subscribe();
          const req = TestBed.inject(HttpTestingController).expectOne('/test');
          expect(req.request.headers.get('X-Tag')).toEqual('child,parent');
          req.flush('');
        });

        it('should be able to connect to a legacy-provided HttpClient context', () => {
          TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [provideLegacyInterceptor('parent')],
          });

          const child = createEnvironmentInjector(
            [
              provideHttpClient(
                ...commonHttpFeatures,
                withRequestsMadeViaParent(),
                withInterceptors([makeLiteralTagInterceptorFn('child')]),
              ),
            ],
            TestBed.inject(EnvironmentInjector),
          );

          child.get(HttpClient).get('/test', {responseType: 'text'}).subscribe();
          const req = TestBed.inject(HttpTestingController).expectOne('/test');
          expect(req.request.headers.get('X-Tag')).toEqual('child,parent');
          req.flush('');
        });
      });
    }
  });

  describe('compatibility with Http NgModules', () => {
    it('should function when configuring HTTP both ways in the same injector', () => {
      TestBed.configureTestingModule({
        imports: [HttpClientModule],
        providers: [
          provideHttpClient(),
          // Interceptor support from HttpClientModule should be functional
          provideLegacyInterceptor('alpha'),
          provideLegacyInterceptor('beta'),
          provideHttpClientTesting(),
        ],
      });

      TestBed.inject(HttpClient).get('/test', {responseType: 'text'}).subscribe();
      const req = TestBed.inject(HttpTestingController).expectOne('/test');
      expect(req.request.headers.get('X-Tag')).toEqual('alpha,beta');
      req.flush('');
    });
  });

  describe('fetch support', () => {
    it('withFetch', () => {
      resetFetchBackendWarningFlag();

      const consoleWarnSpy = spyOn(console, 'warn');

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          // Setting this flag to verify that there are no
          // `console.warn` produced for cases when `fetch`
          // is enabled and we are running in a browser.
          {provide: PLATFORM_ID, useValue: 'browser'},
          provideHttpClient(withFetch()),
        ],
      });
      const fetchBackend = TestBed.inject(HttpBackend);
      expect(fetchBackend).toBeInstanceOf(FetchBackend);

      // Make sure there are no warnings produced.
      expect(consoleWarnSpy.calls.count()).toBe(0);
    });

    it(`'withFetch' should not override provided backend`, () => {
      class CustomBackendExtends extends HttpXhrBackend {}

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          provideHttpClient(withFetch()),
          {provide: HttpBackend, useClass: CustomBackendExtends},
        ],
      });

      const backend = TestBed.inject(HttpBackend);
      expect(backend).toBeInstanceOf(CustomBackendExtends);
    });

    it(`fetch API should be used in child when 'withFetch' was used in parent injector`, () => {
      TestBed.configureTestingModule({
        providers: [provideHttpClient(withFetch()), provideHttpClientTesting()],
      });

      const child = createEnvironmentInjector(
        [provideHttpClient()],
        TestBed.inject(EnvironmentInjector),
      );

      const backend = child.get(HttpBackend);
      expect(backend).toBeInstanceOf(FetchBackend);
    });

    it('should not warn if fetch is not configured when running in a browser', () => {
      resetFetchBackendWarningFlag();

      const consoleWarnSpy = spyOn(console, 'warn');

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          // Setting this flag to verify that there are no
          // `console.warn` produced for cases when `fetch`
          // is enabled and we are running in a browser.
          {provide: PLATFORM_ID, useValue: 'browser'},
          provideHttpClient(),
        ],
      });

      TestBed.inject(HttpHandler);

      // Make sure there are no warnings produced.
      expect(consoleWarnSpy.calls.count()).toBe(0);
    });

    it('should warn during SSR if fetch is not configured', () => {
      resetFetchBackendWarningFlag();

      const consoleWarnSpy = spyOn(console, 'warn');

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          // Setting this flag to verify that there is a
          // `console.warn` produced in case `fetch` is not
          // enabled while running code on the server.
          {provide: PLATFORM_ID, useValue: 'server'},
          provideHttpClient(),
        ],
      });

      TestBed.inject(HttpHandler);

      expect(consoleWarnSpy.calls.count()).toBe(1);
      expect(consoleWarnSpy.calls.argsFor(0)[0]).toContain(
        'NG02801: Angular detected that `HttpClient` is not configured to use `fetch` APIs.',
      );
    });
  });
});

function setXsrfToken(token: string): void {
  setCookie(`XSRF-TOKEN=${token}`);
}

function setCookie(cookie: string): void {
  Object.defineProperty(TestBed.inject(DOCUMENT), 'cookie', {
    get: () => cookie,
    configurable: true,
  });
}

function provideLegacyInterceptor(tag: string): Provider {
  class LegacyTagInterceptor implements HttpInterceptor {
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
      return next.handle(addTagToRequest(req, tag));
    }
  }

  const token = new InjectionToken(`LegacyTagInterceptor[${tag}]`, {
    providedIn: 'root',
    factory: () => new LegacyTagInterceptor(),
  });

  return {
    provide: HTTP_INTERCEPTORS,
    useExisting: token,
    multi: true,
  };
}

function makeLiteralTagInterceptorFn(tag: string): HttpInterceptorFn {
  return (req, next) => next(addTagToRequest(req, tag));
}

function makeTokenTagInterceptorFn(tag: InjectionToken<string>): HttpInterceptorFn {
  return (req, next) => next(addTagToRequest(req, inject(tag)));
}

function addTagToRequest(req: HttpRequest<unknown>, tag: string): HttpRequest<unknown> {
  const prevTagHeader = req.headers.get('X-Tag') ?? '';
  const tagHeader = prevTagHeader.length > 0 ? prevTagHeader + ',' + tag : tag;

  return req.clone({
    setHeaders: {
      'X-Tag': tagHeader,
    },
  });
}

const FAKE_JSONP_BACKEND_PROVIDER = {
  provide: JsonpClientBackend,
  useValue: {
    handle: (req: HttpRequest<never>) => EMPTY,
  },
};
