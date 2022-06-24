/**
 * @license
 * Copyright Google LLC All Rights Reserved.sonpCallbackContext
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {HttpHeaders} from '@angular/common/http/src/headers';
import {JSONP_ERR_HEADERS_NOT_SUPPORTED, JSONP_ERR_NO_CALLBACK, JSONP_ERR_WRONG_METHOD, JSONP_ERR_WRONG_RESPONSE_TYPE, JsonpClientBackend} from '@angular/common/http/src/jsonp';
import {HttpRequest} from '@angular/common/http/src/request';
import {HttpErrorResponse, HttpEventType} from '@angular/common/http/src/response';
import {toArray} from 'rxjs/operators';

import {MockDocument} from './jsonp_mock';

function runOnlyCallback(home: any, data: Object) {
  const keys = Object.keys(home);
  expect(keys.length).toBe(1);
  const callback = home[keys[0]];
  callback(data);
}

const SAMPLE_REQ = new HttpRequest<never>('JSONP', '/test');

{
  describe('JsonpClientBackend', () => {
    let home: any;
    let document: MockDocument;
    let backend: JsonpClientBackend;
    beforeEach(() => {
      home = {};
      document = new MockDocument();
      backend = new JsonpClientBackend(home, document);
    });
    it('handles a basic request', done => {
      backend.handle(SAMPLE_REQ).pipe(toArray()).subscribe(events => {
        expect(events.map(event => event.type)).toEqual([
          HttpEventType.Sent,
          HttpEventType.Response,
        ]);
        done();
      });
      runOnlyCallback(home, {data: 'This is a test'});
      document.mockLoad();
    });
    // Issue #39496
    it('handles a request with callback call wrapped in promise', done => {
      backend.handle(SAMPLE_REQ).subscribe({complete: done});
      Promise.resolve().then(() => {
        runOnlyCallback(home, {data: 'This is a test'});
      });
      document.mockLoad();
    });
    it('handles an error response properly', done => {
      const error = new Error('This is a test error');
      backend.handle(SAMPLE_REQ).pipe(toArray()).subscribe(undefined, (err: HttpErrorResponse) => {
        expect(err.status).toBe(0);
        expect(err.error).toBe(error);
        done();
      });
      document.mockError(error);
    });
    it('prevents the script from executing when the request is cancelled', () => {
      const sub = backend.handle(SAMPLE_REQ).subscribe();
      expect(Object.keys(home).length).toBe(1);
      const keys = Object.keys(home);
      const spy = jasmine.createSpy('spy', home[keys[0]]);

      sub.unsubscribe();
      document.mockLoad();
      expect(Object.keys(home).length).toBe(0);
      expect(spy).not.toHaveBeenCalled();
      // The script element should have been transferred to a different document to prevent it from
      // executing.
      expect(document.mock!.ownerDocument).not.toEqual(document);
    });
    describe('throws an error', () => {
      it('when request method is not JSONP',
         () => expect(() => backend.handle(SAMPLE_REQ.clone<never>({method: 'GET'})))
                   .toThrowError(JSONP_ERR_WRONG_METHOD));
      it('when response type is not json',
         () => expect(() => backend.handle(SAMPLE_REQ.clone<never>({responseType: 'text'})))
                   .toThrowError(JSONP_ERR_WRONG_RESPONSE_TYPE));
      it('when headers are set in request',
         () => expect(() => backend.handle(SAMPLE_REQ.clone<never>({
                 headers: new HttpHeaders({'Content-Type': 'application/json'})
               }))).toThrowError(JSONP_ERR_HEADERS_NOT_SUPPORTED));
      it('when callback is never called', done => {
        backend.handle(SAMPLE_REQ).subscribe(undefined, (err: HttpErrorResponse) => {
          expect(err.status).toBe(0);
          expect(err.error instanceof Error).toEqual(true);
          expect(err.error.message).toEqual(JSONP_ERR_NO_CALLBACK);
          done();
        });
        document.mockLoad();
      });
    });
  });
}
