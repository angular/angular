/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {HttpHeaders} from '../src/headers';
import {HttpRequest} from '../src/request';
import {
  HttpXsrfCookieExtractor,
  HttpXsrfInterceptor,
  HttpXsrfTokenExtractor,
  XSRF_ENABLED,
  XSRF_HEADER_NAME,
} from '../src/xsrf';
import {HttpClientTestingBackend} from '../testing/src/backend';
import {TestBed} from '@angular/core/testing';
import {from, isObservable, Observable} from 'rxjs';

class SampleTokenExtractor extends HttpXsrfTokenExtractor {
  constructor(private token: string | null) {
    super();
  }

  override getToken(): string | null {
    return this.token;
  }
}

function toObservable<T>(result: Observable<T> | Promise<T>): Observable<T> {
  if (isObservable(result)) {
    return result;
  }
  return from(result);
}

describe('HttpXsrfInterceptor', () => {
  let backend: HttpClientTestingBackend;
  let interceptor: HttpXsrfInterceptor;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: HttpXsrfTokenExtractor,
          useValue: new SampleTokenExtractor('test'),
        },
        {
          provide: XSRF_HEADER_NAME,
          useValue: 'X-XSRF-TOKEN',
        },
        {
          provide: XSRF_ENABLED,
          useValue: true,
        },
        HttpXsrfInterceptor,
      ],
    });
    interceptor = TestBed.inject(HttpXsrfInterceptor);
    backend = new HttpClientTestingBackend();
  });
  it('applies XSRF protection to outgoing requests', () => {
    toObservable(interceptor.intercept(new HttpRequest('POST', '/test', {}), backend)).subscribe();
    const req = backend.expectOne('/test');
    expect(req.request.headers.get('X-XSRF-TOKEN')).toEqual('test');
    req.flush({});
  });
  it('does not apply XSRF protection when request is a GET', () => {
    toObservable(interceptor.intercept(new HttpRequest('GET', '/test'), backend)).subscribe();
    const req = backend.expectOne('/test');
    expect(req.request.headers.has('X-XSRF-TOKEN')).toEqual(false);
    req.flush({});
  });
  it('does not apply XSRF protection when request is a HEAD', () => {
    toObservable(interceptor.intercept(new HttpRequest('HEAD', '/test'), backend)).subscribe();
    const req = backend.expectOne('/test');
    expect(req.request.headers.has('X-XSRF-TOKEN')).toEqual(false);
    req.flush({});
  });
  it('does not overwrite existing header', () => {
    toObservable(interceptor
      .intercept(
        new HttpRequest(
          'POST',
          '/test',
          {},
          {headers: new HttpHeaders().set('X-XSRF-TOKEN', 'blah')},
        ),
        backend,
      ))
      .subscribe();
    const req = backend.expectOne('/test');
    expect(req.request.headers.get('X-XSRF-TOKEN')).toEqual('blah');
    req.flush({});
  });
  it('does not set the header for a null token', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        {
          provide: HttpXsrfTokenExtractor,
          useValue: new SampleTokenExtractor(null),
        },
        {
          provide: XSRF_HEADER_NAME,
          useValue: 'X-XSRF-TOKEN',
        },
        {
          provide: XSRF_ENABLED,
          useValue: true,
        },
        HttpXsrfInterceptor,
      ],
    });
    interceptor = TestBed.inject(HttpXsrfInterceptor);
    toObservable(interceptor.intercept(new HttpRequest('POST', '/test', {}), backend)).subscribe();
    const req = backend.expectOne('/test');
    expect(req.request.headers.has('X-XSRF-TOKEN')).toEqual(false);
    req.flush({});
  });
  afterEach(() => {
    backend.verify();
  });
});
describe('HttpXsrfCookieExtractor', () => {
  let document: {[key: string]: string};
  let extractor: HttpXsrfCookieExtractor;
  beforeEach(() => {
    document = {
      cookie: 'XSRF-TOKEN=test',
    };
    extractor = new HttpXsrfCookieExtractor(document, 'XSRF-TOKEN');
  });
  it('parses the cookie from document.cookie', () => {
    expect(extractor.getToken()).toEqual('test');
  });
  it('does not re-parse if document.cookie has not changed', () => {
    expect(extractor.getToken()).toEqual('test');
    expect(extractor.getToken()).toEqual('test');
    expect(getParseCount(extractor)).toEqual(1);
  });
  it('re-parses if document.cookie changes', () => {
    expect(extractor.getToken()).toEqual('test');
    document['cookie'] = 'XSRF-TOKEN=blah';
    expect(extractor.getToken()).toEqual('blah');
    expect(getParseCount(extractor)).toEqual(2);
  });
});

function getParseCount(extractor: HttpXsrfCookieExtractor): number {
  return (extractor as any).parseCount;
}
