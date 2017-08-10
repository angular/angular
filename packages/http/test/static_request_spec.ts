/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {describe, expect, it} from '@angular/core/testing/src/testing_internal';
import {ɵgetDOM as getDOM} from '@angular/platform-browser';

import {RequestOptions} from '../src/base_request_options';
import {ContentType} from '../src/enums';
import {Headers} from '../src/headers';
import {stringToArrayBuffer, stringToArrayBuffer8} from '../src/http_utils';
import {ArrayBuffer, Request} from '../src/static_request';

export function main() {
  describe('Request', () => {
    describe('detectContentType', () => {
      it('should return ContentType.NONE', () => {
        const req =
            new Request(new RequestOptions({url: 'test', method: 'GET', body: null}) as any);

        expect(req.detectContentType()).toEqual(ContentType.NONE);
      });

      it('should return ContentType.JSON', () => {
        const req = new Request(new RequestOptions({
          url: 'test',
          method: 'GET',
          body: null,
          headers: new Headers({'content-type': 'application/json'})
        }) as any);

        expect(req.detectContentType()).toEqual(ContentType.JSON);
      });

      it('should return ContentType.FORM', () => {
        const req = new Request(new RequestOptions({
          url: 'test',
          method: 'GET',
          body: null,
          headers: new Headers({'content-type': 'application/x-www-form-urlencoded'})
        }) as any);

        expect(req.detectContentType()).toEqual(ContentType.FORM);
      });

      it('should return ContentType.FORM_DATA', () => {
        const req = new Request(new RequestOptions({
          url: 'test',
          method: 'GET',
          body: null,
          headers: new Headers({'content-type': 'multipart/form-data'})
        }) as any);

        expect(req.detectContentType()).toEqual(ContentType.FORM_DATA);
      });

      it('should return ContentType.TEXT', () => {
        const req = new Request(new RequestOptions({
          url: 'test',
          method: 'GET',
          body: null,
          headers: new Headers({'content-type': 'text/plain'})
        }) as any);

        expect(req.detectContentType()).toEqual(ContentType.TEXT);
      });

      it('should return ContentType.BLOB', () => {
        const req = new Request(new RequestOptions({
          url: 'test',
          method: 'GET',
          body: null,
          headers: new Headers({'content-type': 'application/octet-stream'})
        }) as any);

        expect(req.detectContentType()).toEqual(ContentType.BLOB);
      });

      it('should not create a blob out of ArrayBuffer', () => {
        const req = new Request(new RequestOptions({
          url: 'test',
          method: 'GET',
          body: new ArrayBuffer(1),
          headers: new Headers({'content-type': 'application/octet-stream'})
        }) as any);

        expect(req.detectContentType()).toEqual(ContentType.ARRAY_BUFFER);
      });
    });

    it('should return empty string if no body is present', () => {
      const req = new Request(new RequestOptions({
        url: 'test',
        method: 'GET',
        body: null,
        headers: new Headers({'content-type': 'application/json'})
      }) as any);

      expect(req.text()).toEqual('');
    });

    it('should return empty string if body is undefined', () => {
      const reqOptions = new RequestOptions(
          {url: 'test', method: 'GET', headers: new Headers({'content-type': 'application/json'})});
      delete reqOptions.body;
      const req = new Request(reqOptions as any);

      expect(req.text()).toEqual('');
    });

    it('should use object params', () => {
      const req = new Request({url: 'http://test.com', params: {'a': 3, 'b': ['x', 'y']}});
      expect(req.url).toBe('http://test.com?a=3&b=x&b=y');
    });

    it('should use search if present', () => {
      const req = new Request({url: 'http://test.com', search: 'a=1&b=2'});
      expect(req.url).toBe('http://test.com?a=1&b=2');
    });

    if (getDOM().supportsWebAnimation()) {
      it('should serialize an ArrayBuffer to string via legacy encoding', () => {
        const str = '\u89d2\u5ea6';
        expect(new Request({body: stringToArrayBuffer(str), url: '/'}).text()).toEqual(str);
      });

      it('should serialize an ArrayBuffer to string via iso-8859 encoding', () => {
        const str = 'abcd';
        expect(new Request({body: stringToArrayBuffer8(str), url: '/'}).text('iso-8859'))
            .toEqual(str);
      });
    }
  });
}
