'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var xhr_1 = require('angular2/src/compiler/xhr');
var collection_1 = require('angular2/src/facade/collection');
var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var async_1 = require('angular2/src/facade/async');
/**
 * A mock implemenation of {@link XHR} that allows outgoing requests to be mocked
 * and responded to within a single test, without going to the network.
 */
var MockXHR = (function (_super) {
    __extends(MockXHR, _super);
    function MockXHR() {
        _super.apply(this, arguments);
        this._expectations = [];
        this._definitions = new collection_1.Map();
        this._requests = [];
    }
    MockXHR.prototype.get = function (url) {
        var request = new _PendingRequest(url);
        this._requests.push(request);
        return request.getPromise();
    };
    /**
     * Add an expectation for the given URL. Incoming requests will be checked against
     * the next expectation (in FIFO order). The `verifyNoOutstandingExpectations` method
     * can be used to check if any expectations have not yet been met.
     *
     * The response given will be returned if the expectation matches.
     */
    MockXHR.prototype.expect = function (url, response) {
        var expectation = new _Expectation(url, response);
        this._expectations.push(expectation);
    };
    /**
     * Add a definition for the given URL to return the given response. Unlike expectations,
     * definitions have no order and will satisfy any matching request at any time. Also
     * unlike expectations, unused definitions do not cause `verifyNoOutstandingExpectations`
     * to return an error.
     */
    MockXHR.prototype.when = function (url, response) { this._definitions.set(url, response); };
    /**
     * Process pending requests and verify there are no outstanding expectations. Also fails
     * if no requests are pending.
     */
    MockXHR.prototype.flush = function () {
        if (this._requests.length === 0) {
            throw new exceptions_1.BaseException('No pending requests to flush');
        }
        do {
            this._processRequest(this._requests.shift());
        } while (this._requests.length > 0);
        this.verifyNoOutstandingExpectations();
    };
    /**
     * Throw an exception if any expectations have not been satisfied.
     */
    MockXHR.prototype.verifyNoOutstandingExpectations = function () {
        if (this._expectations.length === 0)
            return;
        var urls = [];
        for (var i = 0; i < this._expectations.length; i++) {
            var expectation = this._expectations[i];
            urls.push(expectation.url);
        }
        throw new exceptions_1.BaseException("Unsatisfied requests: " + urls.join(', '));
    };
    MockXHR.prototype._processRequest = function (request) {
        var url = request.url;
        if (this._expectations.length > 0) {
            var expectation = this._expectations[0];
            if (expectation.url == url) {
                collection_1.ListWrapper.remove(this._expectations, expectation);
                request.complete(expectation.response);
                return;
            }
        }
        if (this._definitions.has(url)) {
            var response = this._definitions.get(url);
            request.complete(lang_1.normalizeBlank(response));
            return;
        }
        throw new exceptions_1.BaseException("Unexpected request " + url);
    };
    return MockXHR;
})(xhr_1.XHR);
exports.MockXHR = MockXHR;
var _PendingRequest = (function () {
    function _PendingRequest(url) {
        this.url = url;
        this.completer = async_1.PromiseWrapper.completer();
    }
    _PendingRequest.prototype.complete = function (response) {
        if (lang_1.isBlank(response)) {
            this.completer.reject("Failed to load " + this.url, null);
        }
        else {
            this.completer.resolve(response);
        }
    };
    _PendingRequest.prototype.getPromise = function () { return this.completer.promise; };
    return _PendingRequest;
})();
var _Expectation = (function () {
    function _Expectation(url, response) {
        this.url = url;
        this.response = response;
    }
    return _Expectation;
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieGhyX21vY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29tcGlsZXIveGhyX21vY2sudHMiXSwibmFtZXMiOlsiTW9ja1hIUiIsIk1vY2tYSFIuY29uc3RydWN0b3IiLCJNb2NrWEhSLmdldCIsIk1vY2tYSFIuZXhwZWN0IiwiTW9ja1hIUi53aGVuIiwiTW9ja1hIUi5mbHVzaCIsIk1vY2tYSFIudmVyaWZ5Tm9PdXRzdGFuZGluZ0V4cGVjdGF0aW9ucyIsIk1vY2tYSFIuX3Byb2Nlc3NSZXF1ZXN0IiwiX1BlbmRpbmdSZXF1ZXN0IiwiX1BlbmRpbmdSZXF1ZXN0LmNvbnN0cnVjdG9yIiwiX1BlbmRpbmdSZXF1ZXN0LmNvbXBsZXRlIiwiX1BlbmRpbmdSZXF1ZXN0LmdldFByb21pc2UiLCJfRXhwZWN0YXRpb24iLCJfRXhwZWN0YXRpb24uY29uc3RydWN0b3IiXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsb0JBQWtCLDJCQUEyQixDQUFDLENBQUE7QUFDOUMsMkJBQTJDLGdDQUFnQyxDQUFDLENBQUE7QUFDNUUscUJBQWlELDBCQUEwQixDQUFDLENBQUE7QUFDNUUsMkJBQThDLGdDQUFnQyxDQUFDLENBQUE7QUFDL0Usc0JBQXdELDJCQUEyQixDQUFDLENBQUE7QUFFcEY7OztHQUdHO0FBQ0g7SUFBNkJBLDJCQUFHQTtJQUFoQ0E7UUFBNkJDLDhCQUFHQTtRQUN0QkEsa0JBQWFBLEdBQW1CQSxFQUFFQSxDQUFDQTtRQUNuQ0EsaUJBQVlBLEdBQUdBLElBQUlBLGdCQUFHQSxFQUFrQkEsQ0FBQ0E7UUFDekNBLGNBQVNBLEdBQXNCQSxFQUFFQSxDQUFDQTtJQStFNUNBLENBQUNBO0lBN0VDRCxxQkFBR0EsR0FBSEEsVUFBSUEsR0FBV0E7UUFDYkUsSUFBSUEsT0FBT0EsR0FBR0EsSUFBSUEsZUFBZUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7UUFDdkNBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLENBQUNBLE9BQU9B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QUNIQSxDQUFDQTtJQUVERixvQ0FBVUEsR0FBVkEsY0FBZ0NHLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBO0lBQ2xFSCxzQkFBQ0E7QUFBREEsQ0FBQ0EsQUFsQkQsSUFrQkM7QUFFRDtJQUdFSSxzQkFBWUEsR0FBV0EsRUFBRUEsUUFBZ0JBO1FBQ3ZDQyxJQUFJQSxDQUFDQSxHQUFHQSxHQUFHQSxHQUFHQSxDQUFDQTtRQUNmQSxJQUFJQSxDQUFDQSxRQUFRQSxHQUFHQSxRQUFRQSxDQUFDQTtJQUMzQkEsQ0FBQ0E7SUFDSEQsbUJBQUNBO0FBQURBLENBQUNBLEFBUEQsSUFPQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7WEhSfSBmcm9tICdhbmd1bGFyMi9zcmMvY29tcGlsZXIveGhyJztcbmltcG9ydCB7TGlzdFdyYXBwZXIsIE1hcCwgTWFwV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7aXNCbGFuaywgaXNQcmVzZW50LCBub3JtYWxpemVCbGFua30gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7QmFzZUV4Y2VwdGlvbiwgV3JhcHBlZEV4Y2VwdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCB7UHJvbWlzZUNvbXBsZXRlciwgUHJvbWlzZVdyYXBwZXIsIFByb21pc2V9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvYXN5bmMnO1xuXG4vKipcbiAqIEEgbW9jayBpbXBsZW1lbmF0aW9uIG9mIHtAbGluayBYSFJ9IHRoYXQgYWxsb3dzIG91dGdvaW5nIHJlcXVlc3RzIHRvIGJlIG1vY2tlZFxuICogYW5kIHJlc3BvbmRlZCB0byB3aXRoaW4gYSBzaW5nbGUgdGVzdCwgd2l0aG91dCBnb2luZyB0byB0aGUgbmV0d29yay5cbiAqL1xuZXhwb3J0IGNsYXNzIE1vY2tYSFIgZXh0ZW5kcyBYSFIge1xuICBwcml2YXRlIF9leHBlY3RhdGlvbnM6IF9FeHBlY3RhdGlvbltdID0gW107XG4gIHByaXZhdGUgX2RlZmluaXRpb25zID0gbmV3IE1hcDxzdHJpbmcsIHN0cmluZz4oKTtcbiAgcHJpdmF0ZSBfcmVxdWVzdHM6IF9QZW5kaW5nUmVxdWVzdFtdID0gW107XG5cbiAgZ2V0KHVybDogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICB2YXIgcmVxdWVzdCA9IG5ldyBfUGVuZGluZ1JlcXVlc3QodXJsKTtcbiAgICB0aGlzLl9yZXF1ZXN0cy5wdXNoKHJlcXVlc3QpO1xuICAgIHJldHVybiByZXF1ZXN0LmdldFByb21pc2UoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgYW4gZXhwZWN0YXRpb24gZm9yIHRoZSBnaXZlbiBVUkwuIEluY29taW5nIHJlcXVlc3RzIHdpbGwgYmUgY2hlY2tlZCBhZ2FpbnN0XG4gICAqIHRoZSBuZXh0IGV4cGVjdGF0aW9uIChpbiBGSUZPIG9yZGVyKS4gVGhlIGB2ZXJpZnlOb091dHN0YW5kaW5nRXhwZWN0YXRpb25zYCBtZXRob2RcbiAgICogY2FuIGJlIHVzZWQgdG8gY2hlY2sgaWYgYW55IGV4cGVjdGF0aW9ucyBoYXZlIG5vdCB5ZXQgYmVlbiBtZXQuXG4gICAqXG4gICAqIFRoZSByZXNwb25zZSBnaXZlbiB3aWxsIGJlIHJldHVybmVkIGlmIHRoZSBleHBlY3RhdGlvbiBtYXRjaGVzLlxuICAgKi9cbiAgZXhwZWN0KHVybDogc3RyaW5nLCByZXNwb25zZTogc3RyaW5nKSB7XG4gICAgdmFyIGV4cGVjdGF0aW9uID0gbmV3IF9FeHBlY3RhdGlvbih1cmwsIHJlc3BvbnNlKTtcbiAgICB0aGlzLl9leHBlY3RhdGlvbnMucHVzaChleHBlY3RhdGlvbik7XG4gIH1cblxuICAvKipcbiAgICogQWRkIGEgZGVmaW5pdGlvbiBmb3IgdGhlIGdpdmVuIFVSTCB0byByZXR1cm4gdGhlIGdpdmVuIHJlc3BvbnNlLiBVbmxpa2UgZXhwZWN0YXRpb25zLFxuICAgKiBkZWZpbml0aW9ucyBoYXZlIG5vIG9yZGVyIGFuZCB3aWxsIHNhdGlzZnkgYW55IG1hdGNoaW5nIHJlcXVlc3QgYXQgYW55IHRpbWUuIEFsc29cbiAgICogdW5saWtlIGV4cGVjdGF0aW9ucywgdW51c2VkIGRlZmluaXRpb25zIGRvIG5vdCBjYXVzZSBgdmVyaWZ5Tm9PdXRzdGFuZGluZ0V4cGVjdGF0aW9uc2BcbiAgICogdG8gcmV0dXJuIGFuIGVycm9yLlxuICAgKi9cbiAgd2hlbih1cmw6IHN0cmluZywgcmVzcG9uc2U6IHN0cmluZykgeyB0aGlzLl9kZWZpbml0aW9ucy5zZXQodXJsLCByZXNwb25zZSk7IH1cblxuICAvKipcbiAgICogUHJvY2VzcyBwZW5kaW5nIHJlcXVlc3RzIGFuZCB2ZXJpZnkgdGhlcmUgYXJlIG5vIG91dHN0YW5kaW5nIGV4cGVjdGF0aW9ucy4gQWxzbyBmYWlsc1xuICAgKiBpZiBubyByZXF1ZXN0cyBhcmUgcGVuZGluZy5cbiAgICovXG4gIGZsdXNoKCkge1xuICAgIGlmICh0aGlzLl9yZXF1ZXN0cy5sZW5ndGggPT09IDApIHtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKCdObyBwZW5kaW5nIHJlcXVlc3RzIHRvIGZsdXNoJyk7XG4gICAgfVxuXG4gICAgZG8ge1xuICAgICAgdGhpcy5fcHJvY2Vzc1JlcXVlc3QodGhpcy5fcmVxdWVzdHMuc2hpZnQoKSk7XG4gICAgfSB3aGlsZSAodGhpcy5fcmVxdWVzdHMubGVuZ3RoID4gMCk7XG5cbiAgICB0aGlzLnZlcmlmeU5vT3V0c3RhbmRpbmdFeHBlY3RhdGlvbnMoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaHJvdyBhbiBleGNlcHRpb24gaWYgYW55IGV4cGVjdGF0aW9ucyBoYXZlIG5vdCBiZWVuIHNhdGlzZmllZC5cbiAgICovXG4gIHZlcmlmeU5vT3V0c3RhbmRpbmdFeHBlY3RhdGlvbnMoKSB7XG4gICAgaWYgKHRoaXMuX2V4cGVjdGF0aW9ucy5sZW5ndGggPT09IDApIHJldHVybjtcblxuICAgIHZhciB1cmxzID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl9leHBlY3RhdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBleHBlY3RhdGlvbiA9IHRoaXMuX2V4cGVjdGF0aW9uc1tpXTtcbiAgICAgIHVybHMucHVzaChleHBlY3RhdGlvbi51cmwpO1xuICAgIH1cblxuICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKGBVbnNhdGlzZmllZCByZXF1ZXN0czogJHt1cmxzLmpvaW4oJywgJyl9YCk7XG4gIH1cblxuICBwcml2YXRlIF9wcm9jZXNzUmVxdWVzdChyZXF1ZXN0OiBfUGVuZGluZ1JlcXVlc3QpIHtcbiAgICB2YXIgdXJsID0gcmVxdWVzdC51cmw7XG5cbiAgICBpZiAodGhpcy5fZXhwZWN0YXRpb25zLmxlbmd0aCA+IDApIHtcbiAgICAgIHZhciBleHBlY3RhdGlvbiA9IHRoaXMuX2V4cGVjdGF0aW9uc1swXTtcbiAgICAgIGlmIChleHBlY3RhdGlvbi51cmwgPT0gdXJsKSB7XG4gICAgICAgIExpc3RXcmFwcGVyLnJlbW92ZSh0aGlzLl9leHBlY3RhdGlvbnMsIGV4cGVjdGF0aW9uKTtcbiAgICAgICAgcmVxdWVzdC5jb21wbGV0ZShleHBlY3RhdGlvbi5yZXNwb25zZSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhpcy5fZGVmaW5pdGlvbnMuaGFzKHVybCkpIHtcbiAgICAgIHZhciByZXNwb25zZSA9IHRoaXMuX2RlZmluaXRpb25zLmdldCh1cmwpO1xuICAgICAgcmVxdWVzdC5jb21wbGV0ZShub3JtYWxpemVCbGFuayhyZXNwb25zZSkpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKGBVbmV4cGVjdGVkIHJlcXVlc3QgJHt1cmx9YCk7XG4gIH1cbn1cblxuY2xhc3MgX1BlbmRpbmdSZXF1ZXN0IHtcbiAgdXJsOiBzdHJpbmc7XG4gIGNvbXBsZXRlcjogUHJvbWlzZUNvbXBsZXRlcjxzdHJpbmc+O1xuXG4gIGNvbnN0cnVjdG9yKHVybCkge1xuICAgIHRoaXMudXJsID0gdXJsO1xuICAgIHRoaXMuY29tcGxldGVyID0gUHJvbWlzZVdyYXBwZXIuY29tcGxldGVyKCk7XG4gIH1cblxuICBjb21wbGV0ZShyZXNwb25zZTogc3RyaW5nKSB7XG4gICAgaWYgKGlzQmxhbmsocmVzcG9uc2UpKSB7XG4gICAgICB0aGlzLmNvbXBsZXRlci5yZWplY3QoYEZhaWxlZCB0byBsb2FkICR7dGhpcy51cmx9YCwgbnVsbCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuY29tcGxldGVyLnJlc29sdmUocmVzcG9uc2UpO1xuICAgIH1cbiAgfVxuXG4gIGdldFByb21pc2UoKTogUHJvbWlzZTxzdHJpbmc+IHsgcmV0dXJuIHRoaXMuY29tcGxldGVyLnByb21pc2U7IH1cbn1cblxuY2xhc3MgX0V4cGVjdGF0aW9uIHtcbiAgdXJsOiBzdHJpbmc7XG4gIHJlc3BvbnNlOiBzdHJpbmc7XG4gIGNvbnN0cnVjdG9yKHVybDogc3RyaW5nLCByZXNwb25zZTogc3RyaW5nKSB7XG4gICAgdGhpcy51cmwgPSB1cmw7XG4gICAgdGhpcy5yZXNwb25zZSA9IHJlc3BvbnNlO1xuICB9XG59XG4iXX0=