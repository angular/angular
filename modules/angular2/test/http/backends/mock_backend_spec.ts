import {
  AsyncTestCompleter,
  afterEach,
  beforeEach,
  ddescribe,
  describe,
  expect,
  iit,
  inject,
  it,
  xit,
  SpyObject
} from 'angular2/test_lib';
import {ObservableWrapper} from 'angular2/src/core/facade/async';
import {BrowserXhr} from 'angular2/src/http/backends/browser_xhr';
import {MockConnection, MockBackend} from 'angular2/src/http/backends/mock_backend';
import {bind, Injector} from 'angular2/core';
import {Request} from 'angular2/src/http/static_request';
import {Response} from 'angular2/src/http/static_response';
import {Headers} from 'angular2/src/http/headers';
import {Map} from 'angular2/src/core/facade/collection';
import {RequestOptions, BaseRequestOptions} from 'angular2/src/http/base_request_options';
import {BaseResponseOptions, ResponseOptions} from 'angular2/src/http/base_response_options';
import {ResponseTypes} from 'angular2/src/http/enums';

export function main() {
  describe('MockBackend', () => {

    var backend;
    var sampleRequest1;
    var sampleResponse1;
    var sampleRequest2;
    var sampleResponse2;
    var connection;

    beforeEach(() => {
      var injector = Injector.resolveAndCreate(
          [bind(ResponseOptions).toClass(BaseResponseOptions), MockBackend]);
      backend = injector.get(MockBackend);
      var base = new BaseRequestOptions();
      sampleRequest1 = new Request(base.merge(new RequestOptions({url: 'https://google.com'})));
      sampleResponse1 = new Response(new ResponseOptions({body: 'response1'}));
      sampleRequest2 = new Request(base.merge(new RequestOptions({url: 'https://google.com'})));
      sampleResponse2 = new Response(new ResponseOptions({body: 'response2'}));
    });

    it('should create a new MockBackend', () => {expect(backend).toBeAnInstanceOf(MockBackend)});

    it('should create a new MockConnection',
       () => {expect(backend.createConnection(sampleRequest1)).toBeAnInstanceOf(MockConnection)});

    it('should create a new connection and allow subscription', () => {
      let connection = backend.createConnection(sampleRequest1);
      connection.response.subscribe(() => {});
    });

    it('should allow responding after subscription', inject([AsyncTestCompleter], async => {
         let connection = backend.createConnection(sampleRequest1);
         connection.response.subscribe((res) => { async.done(); });
         connection.mockRespond(sampleResponse1);
       }));

    it('should allow subscribing after responding', inject([AsyncTestCompleter], async => {
         let connection = backend.createConnection(sampleRequest1);
         connection.mockRespond(sampleResponse1);
         connection.response.subscribe((res) => { async.done(); });
       }));

    it('should allow responding after subscription with an error',
       inject([AsyncTestCompleter], async => {
         let connection = backend.createConnection(sampleRequest1);
         connection.response.subscribe(null, () => { async.done(); });
         connection.mockError(new Error('nope'));
       }));

    it('should not throw when there are no unresolved requests',
       inject([AsyncTestCompleter], async => {
         let connection = backend.createConnection(sampleRequest1);
         connection.response.subscribe(() => { async.done(); });
         connection.mockRespond(sampleResponse1);
         backend.verifyNoPendingRequests();
       }));

    xit('should throw when there are unresolved requests', inject([AsyncTestCompleter], async => {
          let connection = backend.createConnection(sampleRequest1);
          connection.response.subscribe(() => { async.done(); });
          backend.verifyNoPendingRequests();
        }));

    it('should work when requests are resolved out of order',
       inject([AsyncTestCompleter], async => {
         let connection1 = backend.createConnection(sampleRequest1);
         let connection2 = backend.createConnection(sampleRequest1);
         connection1.response.subscribe(() => { async.done(); });
         connection2.response.subscribe(() => {});
         connection2.mockRespond(sampleResponse1);
         connection1.mockRespond(sampleResponse1);
         backend.verifyNoPendingRequests();
       }));

    xit('should allow double subscribing', inject([AsyncTestCompleter], async => {
          let responses = [sampleResponse1, sampleResponse2];
          backend.connections.subscribe(c => c.mockRespond(responses.shift()));
          let responseObservable = backend.createConnection(sampleRequest1).response;
          responseObservable.subscribe(res => expect(res.text()).toBe('response1'));
          responseObservable.subscribe(res => expect(res.text()).toBe('response2'), null,
                                       async.done);
        }));

    // TODO(robwormald): readyStates are leaving?
    it('should allow resolution of requests manually', () => {
      let connection1: MockConnection = backend.createConnection(sampleRequest1);
      let connection2: MockConnection = backend.createConnection(sampleRequest1);
      connection1.response.subscribe(() => {});
      connection2.response.subscribe(() => {});
      backend.resolveAllConnections();
      backend.verifyNoPendingRequests();
    });
  });
}