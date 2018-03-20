/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector} from '@angular/core';
import {AsyncTestCompleter, beforeEach, describe, inject, it, xit} from '@angular/core/testing/src/testing_internal';
import {BaseRequestOptions, RequestOptions} from '@angular/http/src/base_request_options';
import {BaseResponseOptions, ResponseOptions} from '@angular/http/src/base_response_options';
import {Request} from '@angular/http/src/static_request';
import {Response} from '@angular/http/src/static_response';
import {MockBackend, MockConnection} from '@angular/http/testing/src/mock_backend';
import {expect} from '@angular/platform-browser/testing/src/matchers';
import {ReplaySubject} from 'rxjs';

{
  describe('MockBackend', () => {

    let backend: MockBackend;
    let sampleRequest1: Request;
    let sampleResponse1: Response;
    let sampleRequest2: Request;
    let sampleResponse2: Response;

    beforeEach(() => {
      const injector = Injector.create([
        {provide: ResponseOptions, useClass: BaseResponseOptions, deps: []},
        {provide: MockBackend, deps: []}
      ]);
      backend = injector.get(MockBackend);
      const base = new BaseRequestOptions();
      sampleRequest1 =
          new Request(base.merge(new RequestOptions({url: 'https://google.com'})) as any);
      sampleResponse1 = new Response(new ResponseOptions({body: 'response1'}));
      sampleRequest2 =
          new Request(base.merge(new RequestOptions({url: 'https://google.com'})) as any);
      sampleResponse2 = new Response(new ResponseOptions({body: 'response2'}));
    });

    it('should create a new MockBackend', () => { expect(backend).toBeAnInstanceOf(MockBackend); });

    it('should create a new MockConnection', () => {
      expect(backend.createConnection(sampleRequest1)).toBeAnInstanceOf(MockConnection);
    });

    it('should create a new connection and allow subscription', () => {
      const connection: MockConnection = backend.createConnection(sampleRequest1);
      connection.response.subscribe(() => {});
    });

    it('should allow responding after subscription',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         const connection: MockConnection = backend.createConnection(sampleRequest1);
         connection.response.subscribe(() => { async.done(); });
         connection.mockRespond(sampleResponse1);
       }));

    it('should allow subscribing after responding',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         const connection: MockConnection = backend.createConnection(sampleRequest1);
         connection.mockRespond(sampleResponse1);
         connection.response.subscribe(() => { async.done(); });
       }));

    it('should allow responding after subscription with an error',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         const connection: MockConnection = backend.createConnection(sampleRequest1);
         connection.response.subscribe(null !, () => { async.done(); });
         connection.mockError(new Error('nope'));
       }));

    it('should not throw when there are no unresolved requests',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         const connection: MockConnection = backend.createConnection(sampleRequest1);
         connection.response.subscribe(() => { async.done(); });
         connection.mockRespond(sampleResponse1);
         backend.verifyNoPendingRequests();
       }));

    xit('should throw when there are unresolved requests',
        inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
          const connection: MockConnection = backend.createConnection(sampleRequest1);
          connection.response.subscribe(() => { async.done(); });
          backend.verifyNoPendingRequests();
        }));

    it('should work when requests are resolved out of order',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         const connection1: MockConnection = backend.createConnection(sampleRequest1);
         const connection2: MockConnection = backend.createConnection(sampleRequest1);
         connection1.response.subscribe(() => { async.done(); });
         connection2.response.subscribe(() => {});
         connection2.mockRespond(sampleResponse1);
         connection1.mockRespond(sampleResponse1);
         backend.verifyNoPendingRequests();
       }));

    xit('should allow double subscribing',
        inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
          const responses: Response[] = [sampleResponse1, sampleResponse2];
          backend.connections.subscribe((c: MockConnection) => c.mockRespond(responses.shift() !));
          const responseObservable: ReplaySubject<Response> =
              backend.createConnection(sampleRequest1).response;
          responseObservable.subscribe(res => expect(res.text()).toBe('response1'));
          responseObservable.subscribe(
              res => expect(res.text()).toBe('response2'), null !, async.done);
        }));

    // TODO(robwormald): readyStates are leaving?
    it('should allow resolution of requests manually', () => {
      const connection1: MockConnection = backend.createConnection(sampleRequest1);
      const connection2: MockConnection = backend.createConnection(sampleRequest1);
      connection1.response.subscribe(() => {});
      connection2.response.subscribe(() => {});
      backend.resolveAllConnections();
      backend.verifyNoPendingRequests();
    });
  });
}
