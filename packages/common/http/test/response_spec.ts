/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {HttpHeaders} from '@angular/common/http/src/headers';
import {HttpResponse} from '@angular/common/http/src/response';
import {ddescribe, describe, it} from '@angular/core/testing/src/testing_internal';

{
  describe('HttpResponse', () => {
    describe('constructor()', () => {
      it('fully constructs responses', () => {
        const resp = new HttpResponse({
          body: 'test body',
          headers: new HttpHeaders({
            'Test': 'Test header',
          }),
          status: 201,
          statusText: 'Created',
          url: '/test',
        });
        expect(resp.body).toBe('test body');
        expect(resp.headers instanceof HttpHeaders).toBeTruthy();
        expect(resp.headers.get('Test')).toBe('Test header');
        expect(resp.status).toBe(201);
        expect(resp.statusText).toBe('Created');
        expect(resp.url).toBe('/test');
      });
      it('uses defaults if no args passed', () => {
        const resp = new HttpResponse({});
        expect(resp.headers).not.toBeNull();
        expect(resp.status).toBe(200);
        expect(resp.statusText).toBe('OK');
        expect(resp.body).toBeNull();
        expect(resp.ok).toBeTruthy();
        expect(resp.url).toBeNull();
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
        const clone =
            new HttpResponse({body: 'test', status: 201, statusText: 'created', url: '/test'})
                .clone();
        expect(clone.body).toBe('test');
        expect(clone.status).toBe(201);
        expect(clone.statusText).toBe('created');
        expect(clone.url).toBe('/test');
        expect(clone.headers).not.toBeNull();
      });
      it('overrides the original', () => {
        const orig =
            new HttpResponse({body: 'test', status: 201, statusText: 'created', url: '/test'});
        const clone =
            orig.clone({body: {data: 'test'}, status: 200, statusText: 'Okay', url: '/bar'});
        expect(clone.body).toEqual({data: 'test'});
        expect(clone.status).toBe(200);
        expect(clone.statusText).toBe('Okay');
        expect(clone.url).toBe('/bar');
        expect(clone.headers).toBe(orig.headers);
      });
    });
  });
}
