/**
 * @license
 * Copyright Google Inc. All Rights Reserved.JsonpCallbackContext
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ddescribe, describe, it} from '@angular/core/testing/src/testing_internal';

import {JSONP_ERR_NO_CALLBACK, JSONP_ERR_WRONG_METHOD, JSONP_ERR_WRONG_RESPONSE_TYPE, JsonpClientBackend} from '../src/jsonp';
import {HttpRequest} from '../src/request';
import {HttpErrorResponse, HttpEventType} from '../src/response';

import {MockDocument} from './jsonp_mock';

function runOnlyCallback(home: any, data: Object) {
  const keys = Object.keys(home);
  expect(keys.length).toBe(1);
  const callback = home[keys[0]];
  delete home[keys[0]];
  callback(data);
}

const SAMPLE_REQ = new HttpRequest<never>('JSONP', '/test');

export function main() {
  describe('JsonpClientBackend', () => {
    let home = {};
    let document: MockDocument;
    let backend: JsonpClientBackend;
    beforeEach(() => {
      home = {};
      document = new MockDocument();
      backend = new JsonpClientBackend(home, document);
    });
    it('handles a basic request', (done: DoneFn) => {
      backend.handle(SAMPLE_REQ).toArray().subscribe(events => {
        expect(events.map(event => event.type)).toEqual([
          HttpEventType.Sent,
          HttpEventType.Response,
        ]);
        done();
      });
      runOnlyCallback(home, {data: 'This is a test'});
      document.mockLoad();
    });
    it('handles an error response properly', (done: DoneFn) => {
      const error = new Error('This is a test error');
      backend.handle(SAMPLE_REQ).toArray().subscribe(undefined, (err: HttpErrorResponse) => {
        expect(err.status).toBe(0);
        expect(err.error).toBe(error);
        done();
      });
      document.mockError(error);
    });
    describe('throws an error', () => {
      it('when request method is not JSONP',
         () => {expect(() => backend.handle(SAMPLE_REQ.clone<never>({method: 'GET'})))
                    .toThrowError(JSONP_ERR_WRONG_METHOD)});
      it('when response type is not json',
         () => {expect(() => backend.handle(SAMPLE_REQ.clone<never>({responseType: 'text'})))
                    .toThrowError(JSONP_ERR_WRONG_RESPONSE_TYPE)});
      it('when callback is never called', (done: DoneFn) => {
        backend.handle(SAMPLE_REQ).subscribe(undefined, (err: HttpErrorResponse) => {
          expect(err.status).toBe(0);
          expect(err.error instanceof Error).toEqual(true);
          expect(err.error.message).toEqual(JSONP_ERR_NO_CALLBACK);
          done();
        });
        document.mockLoad();
      })
    });
  });
}
