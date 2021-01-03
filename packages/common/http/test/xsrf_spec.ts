/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {HttpHeaders} from '@angular/common/http/src/headers';
import {HttpRequest} from '@angular/common/http/src/request';
import {HttpXsrfCookieExtractor, HttpXsrfInterceptor, HttpXsrfTokenExtractor} from '@angular/common/http/src/xsrf';

import {HttpClientTestingBackend} from '@angular/common/http/testing/src/backend';

class SampleTokenExtractor extends HttpXsrfTokenExtractor {
  constructor(private token: string|null) {
    super();
  }

  getToken(): string|null {
    return this.token;
  }
}

{
  describe('HttpXsrfInterceptor', () => {
    let backend: HttpClientTestingBackend;
    const interceptor = new HttpXsrfInterceptor(new SampleTokenExtractor('test'), 'X-XSRF-TOKEN');
    beforeEach(() => {
      backend = new HttpClientTestingBackend();
    });
    it('applies XSRF protection to outgoing requests', () => {
      interceptor.intercept(new HttpRequest('POST', '/test', {}), backend).subscribe();
      const req = backend.expectOne('/test');
      expect(req.request.headers.get('X-XSRF-TOKEN')).toEqual('test');
      req.flush({});
    });
    it('does not apply XSRF protection when request is a GET', () => {
      interceptor.intercept(new HttpRequest('GET', '/test'), backend).subscribe();
      const req = backend.expectOne('/test');
      expect(req.request.headers.has('X-XSRF-TOKEN')).toEqual(false);
      req.flush({});
    });
    it('does not apply XSRF protection when request is a HEAD', () => {
      interceptor.intercept(new HttpRequest('HEAD', '/test'), backend).subscribe();
      const req = backend.expectOne('/test');
      expect(req.request.headers.has('X-XSRF-TOKEN')).toEqual(false);
      req.flush({});
    });
    it('does not overwrite existing header', () => {
      interceptor
          .intercept(
              new HttpRequest(
                  'POST', '/test', {}, {headers: new HttpHeaders().set('X-XSRF-TOKEN', 'blah')}),
              backend)
          .subscribe();
      const req = backend.expectOne('/test');
      expect(req.request.headers.get('X-XSRF-TOKEN')).toEqual('blah');
      req.flush({});
    });
    it('does not set the header for a null token', () => {
      const interceptor = new HttpXsrfInterceptor(new SampleTokenExtractor(null), 'X-XSRF-TOKEN');
      interceptor.intercept(new HttpRequest('POST', '/test', {}), backend).subscribe();
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
