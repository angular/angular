import { XHR } from 'angular2/src/compiler/xhr';
import { ListWrapper, Map } from 'angular2/src/facade/collection';
import { isBlank, normalizeBlank } from 'angular2/src/facade/lang';
import { BaseException } from 'angular2/src/facade/exceptions';
import { PromiseWrapper } from 'angular2/src/facade/async';
export class MockXHR extends XHR {
    constructor(...args) {
        super(...args);
        this._expectations = [];
        this._definitions = new Map();
        this._requests = [];
    }
    get(url) {
        var request = new _PendingRequest(url);
        this._requests.push(request);
        return request.getPromise();
    }
    expect(url, response) {
        var expectation = new _Expectation(url, response);
        this._expectations.push(expectation);
    }
    when(url, response) { this._definitions.set(url, response); }
    flush() {
        if (this._requests.length === 0) {
            throw new BaseException('No pending requests to flush');
        }
        do {
            this._processRequest(this._requests.shift());
        } while (this._requests.length > 0);
        this.verifyNoOustandingExpectations();
    }
    verifyNoOustandingExpectations() {
        if (this._expectations.length === 0)
            return;
        var urls = [];
        for (var i = 0; i < this._expectations.length; i++) {
            var expectation = this._expectations[i];
            urls.push(expectation.url);
        }
        throw new BaseException(`Unsatisfied requests: ${urls.join(', ')}`);
    }
    _processRequest(request) {
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
    constructor(url) {
        this.url = url;
        this.completer = PromiseWrapper.completer();
    }
    complete(response) {
        if (isBlank(response)) {
            this.completer.reject(`Failed to load ${this.url}`, null);
        }
        else {
            this.completer.resolve(response);
        }
    }
    getPromise() { return this.completer.promise; }
}
class _Expectation {
    constructor(url, response) {
        this.url = url;
        this.response = response;
    }
}
//# sourceMappingURL=xhr_mock.js.map