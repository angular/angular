/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {HttpHeaders} from '@angular/common/http/src/headers';
import {HttpRequest} from '@angular/common/http/src/request';
import {HttpXsrfCookieExtractor, HttpXsrfTokenExtractor, xsrfInterceptor} from '@angular/common/http/src/xsrf';
import {HttpClientTestingBackend} from '@angular/common/http/testing/src/backend';
import {createEnvironmentInjector, EnvironmentInjector} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {Observable} from 'rxjs';

import {HttpEvent} from '../public_api';
import {HttpHandlerFn} from '../src/interceptor_fn';

class SampleTokenExtractor extends HttpXsrfTokenExtractor {
  constructor(private token: string|null) {
    super();
  }

  override getToken(): string|null {
    return this.token;
  }
}

{
  describe('HttpXsrfInterceptor', () => {
    let backend: HttpClientTestingBackend;

    function testInterceptor(req: HttpRequest<unknown>): Observable<HttpEvent<unknown>> {
      return TestBed.inject(EnvironmentInjector)
          .runInContext(() => xsrfInterceptor(req, backend.handle.bind(backend)));
    }

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [{provide: HttpXsrfTokenExtractor, useValue: new SampleTokenExtractor('test')}]
      });
      backend = new HttpClientTestingBackend();
    });

    it('applies XSRF protection to outgoing requests', () => {
      testInterceptor(new HttpRequest('POST', '/test', {})).subscribe();
      const req = backend.expectOne('/test');
      expect(req.request.headers.get('X-XSRF-TOKEN')).toEqual('test');
      req.flush({});
    });
    it('does not apply XSRF protection when request is a GET', () => {
      testInterceptor(new HttpRequest('GET', '/test')).subscribe();
      const req = backend.expectOne('/test');
      expect(req.request.headers.has('X-XSRF-TOKEN')).toEqual(false);
      req.flush({});
    });
    it('does not apply XSRF protection when request is a HEAD', () => {
      testInterceptor(new HttpRequest('HEAD', '/test')).subscribe();
      const req = backend.expectOne('/test');
      expect(req.request.headers.has('X-XSRF-TOKEN')).toEqual(false);
      req.flush({});
    });
    it('does not overwrite existing header', () => {
      testInterceptor(new HttpRequest('POST', '/test', {}, {
        headers: new HttpHeaders().set('X-XSRF-TOKEN', 'blah')
      })).subscribe();
      const req = backend.expectOne('/test');
      expect(req.request.headers.get('X-XSRF-TOKEN')).toEqual('blah');
      req.flush({});
    });
    it('does not set the header for a null token', () => {
      TestBed.configureTestingModule({
        providers: [{provide: HttpXsrfTokenExtractor, useValue: new SampleTokenExtractor(null)}],
      });
      testInterceptor(new HttpRequest('POST', '/test', {})).subscribe();
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
      extractor = new HttpXsrfCookieExtractor(document, 'browser', 'XSRF-TOKEN');
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
}

function getParseCount(extractor: HttpXsrfCookieExtractor): number {
  return (extractor as any).parseCount;
}
