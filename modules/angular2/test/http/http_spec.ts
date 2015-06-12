import {
  AsyncTestCompleter,
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
import {Http, HttpFactory} from 'angular2/src/http/http';
import {XHRBackend} from 'angular2/src/http/backends/xhr_backend';
import {httpInjectables} from 'angular2/http';
import {Injector, bind} from 'angular2/di';
import {MockBackend} from 'angular2/src/http/backends/mock_backend';
import {Response} from 'angular2/src/http/static_response';
import {ReadyStates} from 'angular2/src/http/enums';

class SpyObserver extends SpyObject {
  onNext: Function;
  onError: Function;
  onCompleted: Function;
  constructor() {
    super();
    this.onNext = this.spy('onNext');
    this.onError = this.spy('onError');
    this.onCompleted = this.spy('onCompleted');
  }
}

export function main() {
  describe('http', () => {
    var url = 'http://foo.bar';
    var http;
    var injector;
    var backend: MockBackend;
    var baseResponse;
    var sampleObserver;
    beforeEach(() => {
      injector = Injector.resolveAndCreate(
          [MockBackend, bind(Http).toFactory(HttpFactory, [MockBackend])]);
      http = injector.get(Http);
      backend = injector.get(MockBackend);
      baseResponse = new Response('base response');
      sampleObserver = new SpyObserver();
    });

    afterEach(() => {/*backend.verifyNoPendingRequests();*/});


    it('should return an Observable', () => {
      expect(typeof http(url).subscribe).toBe('function');
      backend.resolveAllConnections();
    });


    it('should perform a get request for given url if only passed a string',
       inject([AsyncTestCompleter], (async) => {
         var connection;
         backend.connections.subscribe((c) => connection = c);
         var subscription = http('http://basic.connection')
                                .subscribe(res => {
                                  expect(res.text()).toBe('base response');
                                  async.done();
                                });
         connection.mockRespond(baseResponse)
       }));


    it('should perform a get request for given url if passed a ConnectionConfig instance',
       inject([AsyncTestCompleter], async => {
         var connection;
         backend.connections.subscribe((c) => connection = c);
         http('http://basic.connection', {method: ReadyStates.UNSENT})
             .subscribe(res => {
               expect(res.text()).toBe('base response');
               async.done();
             });
         connection.mockRespond(baseResponse)
       }));


    it('should perform a get request for given url if passed a dictionary',
       inject([AsyncTestCompleter], async => {
         var connection;
         backend.connections.subscribe((c) => connection = c);
         http(url, {method: ReadyStates.UNSENT})
             .subscribe(res => {
               expect(res.text()).toBe('base response');
               async.done();
             });
         connection.mockRespond(baseResponse)
       }));
  });
}
