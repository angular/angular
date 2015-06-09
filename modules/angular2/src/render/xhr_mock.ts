import {XHR} from 'angular2/src/render/xhr';
import {List, ListWrapper, Map, MapWrapper} from 'angular2/src/facade/collection';
import {isBlank, isPresent, normalizeBlank, BaseException} from 'angular2/src/facade/lang';
import {PromiseWrapper, Promise} from 'angular2/src/facade/async';

export class MockXHR extends XHR {
  private _expectations: List<_Expectation>;
  private _definitions: Map<string, string>;
  private _requests: List<Promise<string>>;

  constructor() {
    super();
    this._expectations = [];
    this._definitions = MapWrapper.create();
    this._requests = [];
  }

  get(url: string): Promise<string> {
    var request = new _PendingRequest(url);
    ListWrapper.push(this._requests, request);
    return request.getPromise();
  }

  expect(url: string, response: string) {
    var expectation = new _Expectation(url, response);
    ListWrapper.push(this._expectations, expectation);
  }

  when(url: string, response: string) { MapWrapper.set(this._definitions, url, response); }

  flush() {
    if (this._requests.length === 0) {
      throw new BaseException('No pending requests to flush');
    }

    do {
      var request = ListWrapper.removeAt(this._requests, 0);
      this._processRequest(request);
    } while (this._requests.length > 0);

    this.verifyNoOustandingExpectations();
  }

  verifyNoOustandingExpectations() {
    if (this._expectations.length === 0) return;

    var urls = [];
    for (var i = 0; i < this._expectations.length; i++) {
      var expectation = this._expectations[i];
      ListWrapper.push(urls, expectation.url);
    }

    throw new BaseException(`Unsatisfied requests: ${ListWrapper.join(urls, ', ')}`);
  }

  private _processRequest(request: _PendingRequest) {
    var url = request.url;

    if (this._expectations.length > 0) {
      var expectation = this._expectations[0];
      if (expectation.url == url) {
        ListWrapper.remove(this._expectations, expectation);
        request.complete(expectation.response);
        return;
      }
    }

    if (MapWrapper.contains(this._definitions, url)) {
      var response = MapWrapper.get(this._definitions, url);
      request.complete(normalizeBlank(response));
      return;
    }

    throw new BaseException(`Unexpected request ${url}`);
  }
}

class _PendingRequest {
  url: string;
  completer;

  constructor(url) {
    this.url = url;
    this.completer = PromiseWrapper.completer();
  }

  complete(response: string) {
    if (isBlank(response)) {
      this.completer.reject(`Failed to load ${this.url}`, null);
    } else {
      this.completer.resolve(response);
    }
  }

  getPromise(): Promise<string> { return this.completer.promise; }
}

class _Expectation {
  url: string;
  response: string;
  constructor(url: string, response: string) {
    this.url = url;
    this.response = response;
  }
}
