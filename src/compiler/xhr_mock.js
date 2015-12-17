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
 * A mock implementation of {@link XHR} that allows outgoing requests to be mocked
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieGhyX21vY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29tcGlsZXIveGhyX21vY2sudHMiXSwibmFtZXMiOlsiTW9ja1hIUiIsIk1vY2tYSFIuY29uc3RydWN0b3IiLCJNb2NrWEhSLmdldCIsIk1vY2tYSFIuZXhwZWN0IiwiTW9ja1hIUi53aGVuIiwiTW9ja1hIUi5mbHVzaCIsIk1vY2tYSFIudmVyaWZ5Tm9PdXRzdGFuZGluZ0V4cGVjdGF0aW9ucyIsIk1vY2tYSFIuX3Byb2Nlc3NSZXF1ZXN0IiwiX1BlbmRpbmdSZXF1ZXN0IiwiX1BlbmRpbmdSZXF1ZXN0LmNvbnN0cnVjdG9yIiwiX1BlbmRpbmdSZXF1ZXN0LmNvbXBsZXRlIiwiX1BlbmRpbmdSZXF1ZXN0LmdldFByb21pc2UiLCJfRXhwZWN0YXRpb24iLCJfRXhwZWN0YXRpb24uY29uc3RydWN0b3IiXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsb0JBQWtCLDJCQUEyQixDQUFDLENBQUE7QUFDOUMsMkJBQTJDLGdDQUFnQyxDQUFDLENBQUE7QUFDNUUscUJBQWlELDBCQUEwQixDQUFDLENBQUE7QUFDNUUsMkJBQThDLGdDQUFnQyxDQUFDLENBQUE7QUFDL0Usc0JBQXdELDJCQUEyQixDQUFDLENBQUE7QUFFcEY7OztHQUdHO0FBQ0g7SUFBNkJBLDJCQUFHQTtJQUFoQ0E7UUFBNkJDLDhCQUFHQTtRQUN0QkEsa0JBQWFBLEdBQW1CQSxFQUFFQSxDQUFDQTtRQUNuQ0EsaUJBQVlBLEdBQUdBLElBQUlBLGdCQUFHQSxFQUFrQkEsQ0FBQ0E7UUFDekNBLGNBQVNBLEdBQXNCQSxFQUFFQSxDQUFDQTtJQStFNUNBLENBQUNBO0lBN0VDRCxxQkFBR0EsR0FBSEEsVUFBSUEsR0FBV0E7UUFDYkUsSUFBSUEsT0FBT0EsR0FBR0EsSUFBSUEsZUFBZUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7UUFDdkNBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLENBQUNBLE9BQU9B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QUNIQSxDQUFDQTtJQUVERixvQ0FBVUEsR0FBVkEsY0FBZ0NHLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBO0lBQ2xFSCxzQkFBQ0E7QUFBREEsQ0FBQ0EsQUFsQkQsSUFrQkM7QUFFRDtJQUdFSSxzQkFBWUEsR0FBV0EsRUFBRUEsUUFBZ0JBO1FBQ3ZDQyxJQUFJQSxDQUFDQSxHQUFHQSxHQUFHQSxHQUFHQSxDQUFDQTtRQUNmQSxJQUFJQSxDQUFDQSxRQUFRQSxHQUFHQSxRQUFRQSxDQUFDQTtJQUMzQkEsQ0FBQ0E7SUFDSEQsbUJBQUNBO0FBQURBLENBQUNBLEFBUEQsSUFPQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7WEhSfSBmcm9tICdhbmd1bGFyMi9zcmMvY29tcGlsZXIveGhyJztcbmltcG9ydCB7TGlzdFdyYXBwZXIsIE1hcCwgTWFwV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7aXNCbGFuaywgaXNQcmVzZW50LCBub3JtYWxpemVCbGFua30gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7QmFzZUV4Y2VwdGlvbiwgV3JhcHBlZEV4Y2VwdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCB7UHJvbWlzZUNvbXBsZXRlciwgUHJvbWlzZVdyYXBwZXIsIFByb21pc2V9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvYXN5bmMnO1xuXG4vKipcbiAqIEEgbW9jayBpbXBsZW1lbnRhdGlvbiBvZiB7QGxpbmsgWEhSfSB0aGF0IGFsbG93cyBvdXRnb2luZyByZXF1ZXN0cyB0byBiZSBtb2NrZWRcbiAqIGFuZCByZXNwb25kZWQgdG8gd2l0aGluIGEgc2luZ2xlIHRlc3QsIHdpdGhvdXQgZ29pbmcgdG8gdGhlIG5ldHdvcmsuXG4gKi9cbmV4cG9ydCBjbGFzcyBNb2NrWEhSIGV4dGVuZHMgWEhSIHtcbiAgcHJpdmF0ZSBfZXhwZWN0YXRpb25zOiBfRXhwZWN0YXRpb25bXSA9IFtdO1xuICBwcml2YXRlIF9kZWZpbml0aW9ucyA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmc+KCk7XG4gIHByaXZhdGUgX3JlcXVlc3RzOiBfUGVuZGluZ1JlcXVlc3RbXSA9IFtdO1xuXG4gIGdldCh1cmw6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgdmFyIHJlcXVlc3QgPSBuZXcgX1BlbmRpbmdSZXF1ZXN0KHVybCk7XG4gICAgdGhpcy5fcmVxdWVzdHMucHVzaChyZXF1ZXN0KTtcbiAgICByZXR1cm4gcmVxdWVzdC5nZXRQcm9taXNlKCk7XG4gIH1cblxuICAvKipcbiAgICogQWRkIGFuIGV4cGVjdGF0aW9uIGZvciB0aGUgZ2l2ZW4gVVJMLiBJbmNvbWluZyByZXF1ZXN0cyB3aWxsIGJlIGNoZWNrZWQgYWdhaW5zdFxuICAgKiB0aGUgbmV4dCBleHBlY3RhdGlvbiAoaW4gRklGTyBvcmRlcikuIFRoZSBgdmVyaWZ5Tm9PdXRzdGFuZGluZ0V4cGVjdGF0aW9uc2AgbWV0aG9kXG4gICAqIGNhbiBiZSB1c2VkIHRvIGNoZWNrIGlmIGFueSBleHBlY3RhdGlvbnMgaGF2ZSBub3QgeWV0IGJlZW4gbWV0LlxuICAgKlxuICAgKiBUaGUgcmVzcG9uc2UgZ2l2ZW4gd2lsbCBiZSByZXR1cm5lZCBpZiB0aGUgZXhwZWN0YXRpb24gbWF0Y2hlcy5cbiAgICovXG4gIGV4cGVjdCh1cmw6IHN0cmluZywgcmVzcG9uc2U6IHN0cmluZykge1xuICAgIHZhciBleHBlY3RhdGlvbiA9IG5ldyBfRXhwZWN0YXRpb24odXJsLCByZXNwb25zZSk7XG4gICAgdGhpcy5fZXhwZWN0YXRpb25zLnB1c2goZXhwZWN0YXRpb24pO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhIGRlZmluaXRpb24gZm9yIHRoZSBnaXZlbiBVUkwgdG8gcmV0dXJuIHRoZSBnaXZlbiByZXNwb25zZS4gVW5saWtlIGV4cGVjdGF0aW9ucyxcbiAgICogZGVmaW5pdGlvbnMgaGF2ZSBubyBvcmRlciBhbmQgd2lsbCBzYXRpc2Z5IGFueSBtYXRjaGluZyByZXF1ZXN0IGF0IGFueSB0aW1lLiBBbHNvXG4gICAqIHVubGlrZSBleHBlY3RhdGlvbnMsIHVudXNlZCBkZWZpbml0aW9ucyBkbyBub3QgY2F1c2UgYHZlcmlmeU5vT3V0c3RhbmRpbmdFeHBlY3RhdGlvbnNgXG4gICAqIHRvIHJldHVybiBhbiBlcnJvci5cbiAgICovXG4gIHdoZW4odXJsOiBzdHJpbmcsIHJlc3BvbnNlOiBzdHJpbmcpIHsgdGhpcy5fZGVmaW5pdGlvbnMuc2V0KHVybCwgcmVzcG9uc2UpOyB9XG5cbiAgLyoqXG4gICAqIFByb2Nlc3MgcGVuZGluZyByZXF1ZXN0cyBhbmQgdmVyaWZ5IHRoZXJlIGFyZSBubyBvdXRzdGFuZGluZyBleHBlY3RhdGlvbnMuIEFsc28gZmFpbHNcbiAgICogaWYgbm8gcmVxdWVzdHMgYXJlIHBlbmRpbmcuXG4gICAqL1xuICBmbHVzaCgpIHtcbiAgICBpZiAodGhpcy5fcmVxdWVzdHMubGVuZ3RoID09PSAwKSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbignTm8gcGVuZGluZyByZXF1ZXN0cyB0byBmbHVzaCcpO1xuICAgIH1cblxuICAgIGRvIHtcbiAgICAgIHRoaXMuX3Byb2Nlc3NSZXF1ZXN0KHRoaXMuX3JlcXVlc3RzLnNoaWZ0KCkpO1xuICAgIH0gd2hpbGUgKHRoaXMuX3JlcXVlc3RzLmxlbmd0aCA+IDApO1xuXG4gICAgdGhpcy52ZXJpZnlOb091dHN0YW5kaW5nRXhwZWN0YXRpb25zKCk7XG4gIH1cblxuICAvKipcbiAgICogVGhyb3cgYW4gZXhjZXB0aW9uIGlmIGFueSBleHBlY3RhdGlvbnMgaGF2ZSBub3QgYmVlbiBzYXRpc2ZpZWQuXG4gICAqL1xuICB2ZXJpZnlOb091dHN0YW5kaW5nRXhwZWN0YXRpb25zKCkge1xuICAgIGlmICh0aGlzLl9leHBlY3RhdGlvbnMubGVuZ3RoID09PSAwKSByZXR1cm47XG5cbiAgICB2YXIgdXJscyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5fZXhwZWN0YXRpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgZXhwZWN0YXRpb24gPSB0aGlzLl9leHBlY3RhdGlvbnNbaV07XG4gICAgICB1cmxzLnB1c2goZXhwZWN0YXRpb24udXJsKTtcbiAgICB9XG5cbiAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihgVW5zYXRpc2ZpZWQgcmVxdWVzdHM6ICR7dXJscy5qb2luKCcsICcpfWApO1xuICB9XG5cbiAgcHJpdmF0ZSBfcHJvY2Vzc1JlcXVlc3QocmVxdWVzdDogX1BlbmRpbmdSZXF1ZXN0KSB7XG4gICAgdmFyIHVybCA9IHJlcXVlc3QudXJsO1xuXG4gICAgaWYgKHRoaXMuX2V4cGVjdGF0aW9ucy5sZW5ndGggPiAwKSB7XG4gICAgICB2YXIgZXhwZWN0YXRpb24gPSB0aGlzLl9leHBlY3RhdGlvbnNbMF07XG4gICAgICBpZiAoZXhwZWN0YXRpb24udXJsID09IHVybCkge1xuICAgICAgICBMaXN0V3JhcHBlci5yZW1vdmUodGhpcy5fZXhwZWN0YXRpb25zLCBleHBlY3RhdGlvbik7XG4gICAgICAgIHJlcXVlc3QuY29tcGxldGUoZXhwZWN0YXRpb24ucmVzcG9uc2UpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2RlZmluaXRpb25zLmhhcyh1cmwpKSB7XG4gICAgICB2YXIgcmVzcG9uc2UgPSB0aGlzLl9kZWZpbml0aW9ucy5nZXQodXJsKTtcbiAgICAgIHJlcXVlc3QuY29tcGxldGUobm9ybWFsaXplQmxhbmsocmVzcG9uc2UpKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihgVW5leHBlY3RlZCByZXF1ZXN0ICR7dXJsfWApO1xuICB9XG59XG5cbmNsYXNzIF9QZW5kaW5nUmVxdWVzdCB7XG4gIHVybDogc3RyaW5nO1xuICBjb21wbGV0ZXI6IFByb21pc2VDb21wbGV0ZXI8c3RyaW5nPjtcblxuICBjb25zdHJ1Y3Rvcih1cmwpIHtcbiAgICB0aGlzLnVybCA9IHVybDtcbiAgICB0aGlzLmNvbXBsZXRlciA9IFByb21pc2VXcmFwcGVyLmNvbXBsZXRlcigpO1xuICB9XG5cbiAgY29tcGxldGUocmVzcG9uc2U6IHN0cmluZykge1xuICAgIGlmIChpc0JsYW5rKHJlc3BvbnNlKSkge1xuICAgICAgdGhpcy5jb21wbGV0ZXIucmVqZWN0KGBGYWlsZWQgdG8gbG9hZCAke3RoaXMudXJsfWAsIG51bGwpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmNvbXBsZXRlci5yZXNvbHZlKHJlc3BvbnNlKTtcbiAgICB9XG4gIH1cblxuICBnZXRQcm9taXNlKCk6IFByb21pc2U8c3RyaW5nPiB7IHJldHVybiB0aGlzLmNvbXBsZXRlci5wcm9taXNlOyB9XG59XG5cbmNsYXNzIF9FeHBlY3RhdGlvbiB7XG4gIHVybDogc3RyaW5nO1xuICByZXNwb25zZTogc3RyaW5nO1xuICBjb25zdHJ1Y3Rvcih1cmw6IHN0cmluZywgcmVzcG9uc2U6IHN0cmluZykge1xuICAgIHRoaXMudXJsID0gdXJsO1xuICAgIHRoaXMucmVzcG9uc2UgPSByZXNwb25zZTtcbiAgfVxufVxuIl19