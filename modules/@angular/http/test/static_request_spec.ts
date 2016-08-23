/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {describe, expect, it} from '@angular/core/testing/testing_internal';

import {RequestOptions} from '../src/base_request_options';
import {ContentType} from '../src/enums';
import {Headers} from '../src/headers';
import {Request} from '../src/static_request';

export function main() {
  describe('Request', () => {
    describe('detectContentType', () => {
      it('should return ContentType.NONE', () => {
        const req = new Request(new RequestOptions({url: 'test', method: 'GET', body: null}));

        expect(req.detectContentType()).toEqual(ContentType.NONE);
      });

      it('should return ContentType.JSON', () => {
        const req = new Request(new RequestOptions({
          url: 'test',
          method: 'GET',
          body: null,
          headers: new Headers({'content-type': 'application/json'})
        }));

        expect(req.detectContentType()).toEqual(ContentType.JSON);
      });

      it('should return ContentType.FORM', () => {
        const req = new Request(new RequestOptions({
          url: 'test',
          method: 'GET',
          body: null,
          headers: new Headers({'content-type': 'application/x-www-form-urlencoded'})
        }));

        expect(req.detectContentType()).toEqual(ContentType.FORM);
      });

      it('should return ContentType.FORM_DATA', () => {
        const req = new Request(new RequestOptions({
          url: 'test',
          method: 'GET',
          body: null,
          headers: new Headers({'content-type': 'multipart/form-data'})
        }));

        expect(req.detectContentType()).toEqual(ContentType.FORM_DATA);
      });

      it('should return ContentType.TEXT', () => {
        const req = new Request(new RequestOptions({
          url: 'test',
          method: 'GET',
          body: null,
          headers: new Headers({'content-type': 'text/plain'})
        }));

        expect(req.detectContentType()).toEqual(ContentType.TEXT);
      });

      it('should return ContentType.BLOB', () => {
        const req = new Request(new RequestOptions({
          url: 'test',
          method: 'GET',
          body: null,
          headers: new Headers({'content-type': 'application/octet-stream'})
        }));

        expect(req.detectContentType()).toEqual(ContentType.BLOB);
      });
    });

    it('should return empty string if no body is present', () => {
      const req = new Request(new RequestOptions({
        url: 'test',
        method: 'GET',
        body: null,
        headers: new Headers({'content-type': 'application/json'})
      }));

      expect(req.text()).toEqual('');
    });
  });
}
