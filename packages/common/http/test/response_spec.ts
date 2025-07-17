/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {HttpHeaders} from '../src/headers';
import {HttpResponse, HttpStatusCode} from '../src/response';

describe('HttpResponse', () => {
  describe('constructor()', () => {
    it('fully constructs responses', () => {
      const resp = new HttpResponse({
        body: 'test body',
        headers: new HttpHeaders({
          'Test': 'Test header',
        }),
        status: HttpStatusCode.Created,
        statusText: 'Created',
        url: '/test',
        redirected: true,
      });
      expect(resp.body).toBe('test body');
      expect(resp.headers instanceof HttpHeaders).toBeTruthy();
      expect(resp.headers.get('Test')).toBe('Test header');
      expect(resp.status).toBe(HttpStatusCode.Created);
      expect(resp.statusText).toBe('Created');
      expect(resp.url).toBe('/test');
      expect(resp.redirected).toBe(true);
    });
    it('uses defaults if no args passed', () => {
      const resp = new HttpResponse({});
      expect(resp.headers).not.toBeNull();
      expect(resp.status).toBe(HttpStatusCode.Ok);
      expect(resp.statusText).toBe('OK');
      expect(resp.body).toBeNull();
      expect(resp.ok).toBeTruthy();
      expect(resp.url).toBeNull();
      expect(resp.redirected).toBeUndefined();
    });
    it('accepts a falsy body', () => {
      expect(new HttpResponse({body: false}).body).toEqual(false);
      expect(new HttpResponse({body: 0}).body).toEqual(0);
    });
  });
  it('.ok is determined by status', () => {
    const good = new HttpResponse({status: 200});
    const alsoGood = new HttpResponse({status: 299});
    const badHigh = new HttpResponse({status: 300});
    const badLow = new HttpResponse({status: 199});
    expect(good.ok).toBe(true);
    expect(alsoGood.ok).toBe(true);
    expect(badHigh.ok).toBe(false);
    expect(badLow.ok).toBe(false);
  });
  describe('.clone()', () => {
    it('copies the original when given no arguments', () => {
      const clone = new HttpResponse({
        body: 'test',
        status: HttpStatusCode.Created,
        statusText: 'created',
        url: '/test',
        redirected: false,
      }).clone();
      expect(clone.body).toBe('test');
      expect(clone.status).toBe(HttpStatusCode.Created);
      expect(clone.statusText).toBe('created');
      expect(clone.url).toBe('/test');
      expect(clone.headers).not.toBeNull();
      expect(clone.redirected).toBe(false);
    });
    it('overrides the original', () => {
      const orig = new HttpResponse({
        body: 'test',
        status: HttpStatusCode.Created,
        statusText: 'created',
        url: '/test',
        redirected: true,
      });
      const clone = orig.clone({
        body: {data: 'test'},
        status: HttpStatusCode.Ok,
        statusText: 'Okay',
        url: '/bar',
        redirected: false,
      });
      expect(clone.body).toEqual({data: 'test'});
      expect(clone.status).toBe(HttpStatusCode.Ok);
      expect(clone.statusText).toBe('Okay');
      expect(clone.url).toBe('/bar');
      expect(clone.headers).toBe(orig.headers);
      expect(clone.redirected).toBe(false);
    });
  });
});
