import { XHR } from 'angular2/src/compiler/xhr';
import { ListWrapper, Map } from 'angular2/src/facade/collection';
import { isBlank, normalizeBlank } from 'angular2/src/facade/lang';
import { BaseException } from 'angular2/src/facade/exceptions';
import { PromiseWrapper } from 'angular2/src/facade/async';
/**
 * A mock implemenation of {@link XHR} that allows outgoing requests to be mocked
 * and responded to within a single test, without going to the network.
 */
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
    /**
     * Add an expectation for the given URL. Incoming requests will be checked against
     * the next expectation (in FIFO order). The `verifyNoOutstandingExpectations` method
     * can be used to check if any expectations have not yet been met.
     *
     * The response given will be returned if the expectation matches.
     */
    expect(url, response) {
        var expectation = new _Expectation(url, response);
        this._expectations.push(expectation);
    }
    /**
     * Add a definition for the given URL to return the given response. Unlike expectations,
     * definitions have no order and will satisfy any matching request at any time. Also
     * unlike expectations, unused definitions do not cause `verifyNoOutstandingExpectations`
     * to return an error.
     */
    when(url, response) { this._definitions.set(url, response); }
    /**
     * Process pending requests and verify there are no outstanding expectations. Also fails
     * if no requests are pending.
     */
    flush() {
        if (this._requests.length === 0) {
            throw new BaseException('No pending requests to flush');
        }
        do {
            this._processRequest(this._requests.shift());
        } while (this._requests.length > 0);
        this.verifyNoOutstandingExpectations();
    }
    /**
     * Throw an exception if any expectations have not been satisfied.
     */
    verifyNoOutstandingExpectations() {
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
