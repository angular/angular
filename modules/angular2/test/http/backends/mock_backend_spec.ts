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

export function main(){
  
  describe('MockBackend', () => {
    
    var backend:MockBackend;
    var sampleRequest:Request;
    var sampleResponse:Response;
    var connection:MockConnection;

    beforeEach(() => {
      var injector = Injector.resolveAndCreate([
        bind(ResponseOptions)
            .toClass(BaseResponseOptions),
        MockBackend
      ]);
      backend = injector.get(MockBackend);
      var base = new BaseRequestOptions();
      sampleRequest = new Request(base.merge(new RequestOptions({url: 'https://google.com'})));
      sampleResponse = new Response(new ResponseOptions({body: 'hello google'}));
    });
    
    it('should create a new MockBackend', () => {
      expect(backend).toBeAnInstanceOf(MockBackend)
    });
    
    it('should create a new MockConnection', () => {
      expect(backend.createConnection(sampleRequest)).toBeAnInstanceOf(MockConnection)
    });
    
    it('should create a new connection and allow subscription', () => {
      let connection = backend.createConnection(sampleRequest);
      connection.response.subscribe(() => {});
    });
    
    it('should allow responding after subscription', inject([AsyncTestCompleter], async => {
      let connection:MockConnection = backend.createConnection(sampleRequest);
      connection.response.subscribe((res) => {
        async.done();
      });
      connection.mockRespond(sampleResponse);
    }));
    
    it('should allow responding after subscription with an error', inject([AsyncTestCompleter], async => {
      let connection:MockConnection = backend.createConnection(sampleRequest);
      connection.response.subscribe(null, () => {
        async.done();
      });
      connection.mockError(new Error('nope'));
    }));
    
    it('should not throw when there are no unresolved requests', inject([AsyncTestCompleter], async => {
      let connection:MockConnection = backend.createConnection(sampleRequest);
      connection.response.subscribe(() => {
        async.done();
      });
      connection.mockRespond(sampleResponse);
      backend.verifyNoPendingRequests();
    }));
    
    xit('should throw when there are unresolved requests', inject([AsyncTestCompleter], async => {
      let connection:MockConnection = backend.createConnection(sampleRequest);
      connection.response.subscribe(() => {
        async.done();
      });
      backend.verifyNoPendingRequests();
    }));
    
    it('should work when requests are resolved out of order', inject([AsyncTestCompleter], async => {
      let connection1:MockConnection = backend.createConnection(sampleRequest);
      let connection2:MockConnection = backend.createConnection(sampleRequest);
      connection1.response.subscribe(() => {
        async.done();
      });
      connection2.response.subscribe(() => {
      });
      connection2.mockRespond(sampleResponse);
      connection1.mockRespond(sampleResponse);
      backend.verifyNoPendingRequests();
    }));
    
    //TODO(robwormald): readyStates are leaving?
    it('should allow resolution of requests manually', () => {
      let connection1:MockConnection = backend.createConnection(sampleRequest);
      let connection2:MockConnection = backend.createConnection(sampleRequest);
      connection1.response.subscribe(() => {});
      connection2.response.subscribe(() => {});
      backend.resolveAllConnections();
      backend.verifyNoPendingRequests();
    });
  });
}