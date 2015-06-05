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

var abortSpy;
var sendSpy;
var openSpy;
var addEventListenerSpy;

class MockBrowserXHR extends SpyObject {
  abort: any;
  send: any;
  open: any;
  addEventListener: any;
  response: any;
  responseText: string;
  constructor() {
    super();
    this.abort = abortSpy = this.spy('abort');
    this.send = sendSpy = this.spy('send');
    this.open = openSpy = this.spy('open');
    this.addEventListener = addEventListenerSpy = this.spy('addEventListener');
  }
}

export function main() {
  describe('XHRBackend', () => {
    var backend;
    var sampleRequest;
    var constructSpy = new SpyObject();

    beforeEach(() => {
      var injector =
          Injector.resolveAndCreate([bind(BrowserXHR).toValue(MockBrowserXHR), XHRBackend]);
      backend = injector.get(XHRBackend);
      sampleRequest = new Request('https://google.com');
    });

    it('should create a connection',
       () => { expect(() => backend.createConnection(sampleRequest)).not.toThrow(); });


    describe('XHRConnection', () => {
      it('should call abort when disposed', () => {
        var connection = new XHRConnection(sampleRequest, MockBrowserXHR);
        connection.dispose();
        expect(abortSpy).toHaveBeenCalled();
      });


      it('should automatically call open with method and url', () => {
        new XHRConnection(sampleRequest, MockBrowserXHR);
        expect(openSpy).toHaveBeenCalledWith('GET', sampleRequest.url);
      });


      it('should automatically call send on the backend with request body', () => {
        var body = 'Some body to love';
        var request = new Request('https://google.com', {body: body});
        var connection = new XHRConnection(request, MockBrowserXHR);
        expect(sendSpy).toHaveBeenCalledWith(body);
      });
    });
  });
}
