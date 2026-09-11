/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {MockPlatformLocation} from '@angular/common/testing';
import {createEnvironmentInjector, EnvironmentInjector} from '@angular/core';
import {TestBed} from '@angular/core/testing';

import {PlatformLocation} from '../..';
import {HttpClient} from '../src/client';
import {HttpHeaders} from '../src/headers';
import {HttpInterceptorFn} from '../src/interceptor';
import {
  provideHttpClient,
  withInterceptors,
  withRequestsMadeViaParent,
  withXsrfConfiguration,
} from '../src/provider';
import {HttpXsrfTokenExtractor} from '../src/xsrf';
import {HttpTestingController, provideHttpClientTesting} from '../testing';

class SampleTokenExtractor extends HttpXsrfTokenExtractor {
  override getToken(): string | null {
    return 'test-token';
  }
}

describe('XSRF protection after request origin rewrites', () => {
  const crossOriginRewrite: HttpInterceptorFn = (req, next) =>
    next(req.clone({url: 'https://api.example.test/update'}));

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([crossOriginRewrite])),
        provideHttpClientTesting(),
        {provide: HttpXsrfTokenExtractor, useClass: SampleTokenExtractor},
        {
          provide: PlatformLocation,
          useFactory: () => new MockPlatformLocation({startUrl: 'https://app.example.test/'}),
        },
      ],
    });
  });

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
  });

  it('removes an Angular-added XSRF header when a later interceptor changes the origin', () => {
    TestBed.inject(HttpClient).post('/update', '', {responseType: 'text'}).subscribe();

    const req = TestBed.inject(HttpTestingController).expectOne('https://api.example.test/update');
    expect(req.request.headers.has('X-XSRF-TOKEN')).toBeFalse();
    req.flush('');
  });

  it('keeps an Angular-added XSRF header when a later interceptor stays same-origin', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(
          withInterceptors([
            (req, next) => next(req.clone({url: 'https://app.example.test/rewritten'})),
          ]),
        ),
        provideHttpClientTesting(),
        {provide: HttpXsrfTokenExtractor, useClass: SampleTokenExtractor},
        {
          provide: PlatformLocation,
          useFactory: () => new MockPlatformLocation({startUrl: 'https://app.example.test/'}),
        },
      ],
    });

    TestBed.inject(HttpClient).post('/update', '', {responseType: 'text'}).subscribe();

    const req = TestBed.inject(HttpTestingController).expectOne(
      'https://app.example.test/rewritten',
    );
    expect(req.request.headers.get('X-XSRF-TOKEN')).toBe('test-token');
    req.flush('');
  });

  it('preserves user-provided values while removing only the Angular-added token', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(
          withInterceptors([
            (req, next) =>
              next(
                req.clone({
                  url: 'https://api.example.test/update',
                  headers: req.headers.append('X-XSRF-TOKEN', 'user-value'),
                }),
              ),
          ]),
        ),
        provideHttpClientTesting(),
        {provide: HttpXsrfTokenExtractor, useClass: SampleTokenExtractor},
        {
          provide: PlatformLocation,
          useFactory: () => new MockPlatformLocation({startUrl: 'https://app.example.test/'}),
        },
      ],
    });

    TestBed.inject(HttpClient).post('/update', '', {responseType: 'text'}).subscribe();

    const req = TestBed.inject(HttpTestingController).expectOne('https://api.example.test/update');
    expect(req.request.headers.getAll('X-XSRF-TOKEN')).toEqual(['user-value']);
    req.flush('');
  });

  it('does not remove an XSRF-like header that Angular did not add', () => {
    TestBed.inject(HttpClient)
      .post('/update', '', {
        headers: new HttpHeaders().set('X-XSRF-TOKEN', 'application-value'),
        responseType: 'text',
      })
      .subscribe();

    const req = TestBed.inject(HttpTestingController).expectOne('https://api.example.test/update');
    expect(req.request.headers.get('X-XSRF-TOKEN')).toBe('application-value');
    req.flush('');
  });

  it('validates only at the terminal backend when requests delegate through a parent client', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([crossOriginRewrite])),
        provideHttpClientTesting(),
        {provide: HttpXsrfTokenExtractor, useClass: SampleTokenExtractor},
        {
          provide: PlatformLocation,
          useFactory: () => new MockPlatformLocation({startUrl: 'https://app.example.test/'}),
        },
      ],
    });

    const child = createEnvironmentInjector(
      [
        provideHttpClient(
          withRequestsMadeViaParent(),
          withXsrfConfiguration({headerName: 'X-Child-XSRF'}),
        ),
      ],
      TestBed.inject(EnvironmentInjector),
    );

    child.get(HttpClient).post('/update', '', {responseType: 'text'}).subscribe();

    const req = TestBed.inject(HttpTestingController).expectOne('https://api.example.test/update');
    expect(req.request.headers.has('X-Child-XSRF')).toBeFalse();
    expect(req.request.headers.has('X-XSRF-TOKEN')).toBeFalse();
    req.flush('');
    child.destroy();
  });

  it('does not validate before a delegated parent chain reaches its terminal backend', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(
          withInterceptors([
            (req, next) => next(req.clone({url: 'https://app.example.test/final'})),
          ]),
        ),
        provideHttpClientTesting(),
        {provide: HttpXsrfTokenExtractor, useClass: SampleTokenExtractor},
        {
          provide: PlatformLocation,
          useFactory: () => new MockPlatformLocation({startUrl: 'https://app.example.test/'}),
        },
      ],
    });

    const middle = createEnvironmentInjector(
      [provideHttpClient(withRequestsMadeViaParent(), withInterceptors([crossOriginRewrite]))],
      TestBed.inject(EnvironmentInjector),
    );
    const child = createEnvironmentInjector(
      [provideHttpClient(withRequestsMadeViaParent())],
      middle,
    );

    child.get(HttpClient).post('/update', '', {responseType: 'text'}).subscribe();

    const req = TestBed.inject(HttpTestingController).expectOne('https://app.example.test/final');
    expect(req.request.headers.get('X-XSRF-TOKEN')).toBe('test-token');
    req.flush('');
    child.destroy();
    middle.destroy();
  });
});
