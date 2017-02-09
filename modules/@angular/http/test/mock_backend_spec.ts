/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ReflectiveInjector} from '@angular/core';
import {AsyncTestCompleter, beforeEach, ddescribe, describe, inject, it, xit} from '@angular/core/testing/testing_internal';
import {expect} from '@angular/platform-browser/testing/matchers';
import {Observable} from 'rxjs/Observable';
import {Observer} from 'rxjs/Observer';

import {HttpRequest, HttpResponse} from '../src/request_response';
import {MockBackend, MockRequest} from '../testing/mock_backend';


export function main() {
  describe('MockBackend', () => {
    let backend: MockBackend;
    let sampleRequest: HttpRequest;
    let sampleResponse: HttpResponse;
    let errResponse: HttpResponse;

    beforeEach(() => {
      backend = new MockBackend();
      sampleRequest = new HttpRequest('http://google.com');
      sampleResponse = new HttpResponse({body: 'response1'});
      errResponse = new HttpResponse({body: 'error', status: 500});
    });

    it('should create a new MockRequest', () => {
      backend.handle(sampleRequest);
      expect(backend.mockRequestsArray[0]).toBeAnInstanceOf(MockRequest);
    });

    it('should allow responding after subscription',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         const obs = backend.handle(sampleRequest);
         obs.subscribe(() => async.done());
         backend.mockRequestsArray[0].respond(sampleResponse);
       }));

    it('should allow subscribing after responding',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         const obs = backend.handle(sampleRequest);
         backend.mockRequestsArray[0].respond(sampleResponse);
         obs.subscribe(() => async.done());
       }));

    it('should allow responding after subscription with an error',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         const obs = backend.handle(sampleRequest);
         obs.subscribe(null, () => async.done());
         backend.mockRequestsArray[0].respond(errResponse);
       }));

    it('should not throw when there are no unresolved requests',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         backend.handle(sampleRequest).subscribe(() => async.done());
         backend.mockRequestsArray[0].respond(sampleResponse);
         backend.verifyNoPendingRequests();
       }));

    it('should throw when there are unresolved requests', () => {
      backend.handle(sampleRequest).subscribe();
      expect(() => backend.verifyNoPendingRequests()).toThrow();
    });

    it('should work when requests are resolved out of order',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         backend.handle(sampleRequest).subscribe(() => async.done());
         backend.handle(sampleRequest).subscribe();
         backend.mockRequestsArray[1].respond(sampleResponse);
         backend.mockRequestsArray[0].respond(sampleResponse);
         backend.verifyNoPendingRequests();
       }));

    it('should allow resolution of requests manually', () => {
      backend.handle(sampleRequest).subscribe();
      backend.handle(sampleRequest).subscribe();
      backend.resolveAllConnections();
      backend.verifyNoPendingRequests();
    });

    it('gets notified when the request is cancelled',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         const sub = backend.handle(sampleRequest).subscribe();
         backend.mockRequestsArray[0].cancelled.then(() => async.done());
         sub.unsubscribe();
         backend.verifyNoPendingRequests();
       }));
  });
}
