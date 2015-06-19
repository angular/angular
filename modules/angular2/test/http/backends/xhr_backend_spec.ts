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
import {BrowserXHR} from 'angular2/src/http/backends/browser_xhr';
import {XHRConnection, XHRBackend} from 'angular2/src/http/backends/xhr_backend';
import {bind, Injector} from 'angular2/di';
import {Request} from 'angular2/src/http/static_request';
import {StringMapWrapper} from 'angular2/src/facade/collection';
import {RequestOptions} from 'angular2/src/http/base_request_options';

var abortSpy;
var sendSpy;
var openSpy;
var addEventListenerSpy;

class MockBrowserXHR extends BrowserXHR {
  abort: any;
  send: any;
  open: any;
  addEventListener: any;
  response: any;
  responseText: string;
  constructor() {
    super();
    var spy = new SpyObject();
    this.abort = abortSpy = spy.spy('abort');
    this.send = sendSpy = spy.spy('send');
    this.open = openSpy = spy.spy('open');
    this.addEventListener = addEventListenerSpy = spy.spy('addEventListener');
  }

  build() { return new MockBrowserXHR(); }
}

export function main() {
  describe('XHRBackend', () => {
    var backend;
    var sampleRequest;

    beforeEach(() => {
      var injector =
          Injector.resolveAndCreate([bind(BrowserXHR).toClass(MockBrowserXHR), XHRBackend]);
      backend = injector.get(XHRBackend);
      sampleRequest = new Request(new RequestOptions({url: 'https://google.com'}));
    });

    it('should create a connection',
       () => { expect(() => backend.createConnection(sampleRequest)).not.toThrow(); });


    describe('XHRConnection', () => {
      it('should call abort when disposed', () => {
        var connection = new XHRConnection(sampleRequest, new MockBrowserXHR());
        connection.dispose();
        expect(abortSpy).toHaveBeenCalled();
      });


      it('should automatically call open with method and url', () => {
        new XHRConnection(sampleRequest, new MockBrowserXHR());
        expect(openSpy).toHaveBeenCalledWith('GET', sampleRequest.url);
      });


      it('should automatically call send on the backend with request body', () => {
        var body = 'Some body to love';
        new XHRConnection(new Request(new RequestOptions({body: body})), new MockBrowserXHR());
        expect(sendSpy).toHaveBeenCalledWith(body);
      });
    });
  });
}
