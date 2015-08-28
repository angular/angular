import {XHR} from 'angular2/src/core/render/xhr';
import {ListWrapper, Map, MapWrapper} from 'angular2/src/core/facade/collection';
import {isBlank, isPresent, normalizeBlank, BaseException} from 'angular2/src/core/facade/lang';
import {PromiseCompleter, PromiseWrapper, Promise} from 'angular2/src/core/facade/async';

export class MockXHR extends XHR {
  private _expectations: _Expectation[];
  private _definitions: Map<string, string>;
  private _requests: _PendingRequest[];

  constructor() {
    super();
    this._expectations = [];
    this._definitions = new Map();
    this._requests = [];
  }

  get(url: string): Promise<string> {
    var request = new _PendingRequest(url);
    this._requests.push(request);
    return request.getPromise();
  }

  expect(url: string, response: string) {
    var expectation = new _Expectation(url, response);
    this._expectations.push(expectation);
  }

  when(url: string, response: string) { this._definitions.set(url, response); }

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
      urls.push(expectation.url);
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

    if (this._definitions.has(url)) {
      var response = this._definitions.get(url);
      request.complete(normalizeBlank(response));
      return;
    }

    throw new BaseException(`Unexpected request ${url}`);
  }
}

class _PendingRequest {
  url: string;
  completer: PromiseCompleter<string>;

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
