'use strict';"use strict";
var __extends = (this && this.__extends) || function (d, b) {
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
}(xhr_1.XHR));
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
}());
var _Expectation = (function () {
    function _Expectation(url, response) {
        this.url = url;
        this.response = response;
    }
    return _Expectation;
}());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieGhyX21vY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLXI1UHJKSzloLnRtcC9hbmd1bGFyMi9zcmMvY29tcGlsZXIveGhyX21vY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsb0JBQWtCLDJCQUEyQixDQUFDLENBQUE7QUFDOUMsMkJBQTJDLGdDQUFnQyxDQUFDLENBQUE7QUFDNUUscUJBQWlELDBCQUEwQixDQUFDLENBQUE7QUFDNUUsMkJBQThDLGdDQUFnQyxDQUFDLENBQUE7QUFDL0Usc0JBQStDLDJCQUEyQixDQUFDLENBQUE7QUFFM0U7OztHQUdHO0FBQ0g7SUFBNkIsMkJBQUc7SUFBaEM7UUFBNkIsOEJBQUc7UUFDdEIsa0JBQWEsR0FBbUIsRUFBRSxDQUFDO1FBQ25DLGlCQUFZLEdBQUcsSUFBSSxnQkFBRyxFQUFrQixDQUFDO1FBQ3pDLGNBQVMsR0FBc0IsRUFBRSxDQUFDO0lBK0U1QyxDQUFDO0lBN0VDLHFCQUFHLEdBQUgsVUFBSSxHQUFXO1FBQ2IsSUFBSSxPQUFPLEdBQUcsSUFBSSxlQUFlLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDdkMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDN0IsTUFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsQ0FBQztJQUM5QixDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ0gsd0JBQU0sR0FBTixVQUFPLEdBQVcsRUFBRSxRQUFnQjtRQUNsQyxJQUFJLFdBQVcsR0FBRyxJQUFJLFlBQVksQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDbEQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDdkMsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gsc0JBQUksR0FBSixVQUFLLEdBQVcsRUFBRSxRQUFnQixJQUFJLElBQUksQ0FBQyxZ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SSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsb0JBQWtCLElBQUksQ0FBQyxHQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDNUQsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ04sSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDbkMsQ0FBQztJQUNILENBQUM7SUFFRCxvQ0FBVSxHQUFWLGNBQWdDLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7SUFDbEUsc0JBQUM7QUFBRCxDQUFDLEFBbEJELElBa0JDO0FBRUQ7SUFHRSxzQkFBWSxHQUFXLEVBQUUsUUFBZ0I7UUFDdkMsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7UUFDZixJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztJQUMzQixDQUFDO0lBQ0gsbUJBQUM7QUFBRCxDQUFDLEFBUEQsSUFPQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7WEhSfSBmcm9tICdhbmd1bGFyMi9zcmMvY29tcGlsZXIveGhyJztcbmltcG9ydCB7TGlzdFdyYXBwZXIsIE1hcCwgTWFwV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7aXNCbGFuaywgaXNQcmVzZW50LCBub3JtYWxpemVCbGFua30gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7QmFzZUV4Y2VwdGlvbiwgV3JhcHBlZEV4Y2VwdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCB7UHJvbWlzZUNvbXBsZXRlciwgUHJvbWlzZVdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvYXN5bmMnO1xuXG4vKipcbiAqIEEgbW9jayBpbXBsZW1lbnRhdGlvbiBvZiB7QGxpbmsgWEhSfSB0aGF0IGFsbG93cyBvdXRnb2luZyByZXF1ZXN0cyB0byBiZSBtb2NrZWRcbiAqIGFuZCByZXNwb25kZWQgdG8gd2l0aGluIGEgc2luZ2xlIHRlc3QsIHdpdGhvdXQgZ29pbmcgdG8gdGhlIG5ldHdvcmsuXG4gKi9cbmV4cG9ydCBjbGFzcyBNb2NrWEhSIGV4dGVuZHMgWEhSIHtcbiAgcHJpdmF0ZSBfZXhwZWN0YXRpb25zOiBfRXhwZWN0YXRpb25bXSA9IFtdO1xuICBwcml2YXRlIF9kZWZpbml0aW9ucyA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmc+KCk7XG4gIHByaXZhdGUgX3JlcXVlc3RzOiBfUGVuZGluZ1JlcXVlc3RbXSA9IFtdO1xuXG4gIGdldCh1cmw6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgdmFyIHJlcXVlc3QgPSBuZXcgX1BlbmRpbmdSZXF1ZXN0KHVybCk7XG4gICAgdGhpcy5fcmVxdWVzdHMucHVzaChyZXF1ZXN0KTtcbiAgICByZXR1cm4gcmVxdWVzdC5nZXRQcm9taXNlKCk7XG4gIH1cblxuICAvKipcbiAgICogQWRkIGFuIGV4cGVjdGF0aW9uIGZvciB0aGUgZ2l2ZW4gVVJMLiBJbmNvbWluZyByZXF1ZXN0cyB3aWxsIGJlIGNoZWNrZWQgYWdhaW5zdFxuICAgKiB0aGUgbmV4dCBleHBlY3RhdGlvbiAoaW4gRklGTyBvcmRlcikuIFRoZSBgdmVyaWZ5Tm9PdXRzdGFuZGluZ0V4cGVjdGF0aW9uc2AgbWV0aG9kXG4gICAqIGNhbiBiZSB1c2VkIHRvIGNoZWNrIGlmIGFueSBleHBlY3RhdGlvbnMgaGF2ZSBub3QgeWV0IGJlZW4gbWV0LlxuICAgKlxuICAgKiBUaGUgcmVzcG9uc2UgZ2l2ZW4gd2lsbCBiZSByZXR1cm5lZCBpZiB0aGUgZXhwZWN0YXRpb24gbWF0Y2hlcy5cbiAgICovXG4gIGV4cGVjdCh1cmw6IHN0cmluZywgcmVzcG9uc2U6IHN0cmluZykge1xuICAgIHZhciBleHBlY3RhdGlvbiA9IG5ldyBfRXhwZWN0YXRpb24odXJsLCByZXNwb25zZSk7XG4gICAgdGhpcy5fZXhwZWN0YXRpb25zLnB1c2goZXhwZWN0YXRpb24pO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhIGRlZmluaXRpb24gZm9yIHRoZSBnaXZlbiBVUkwgdG8gcmV0dXJuIHRoZSBnaXZlbiByZXNwb25zZS4gVW5saWtlIGV4cGVjdGF0aW9ucyxcbiAgICogZGVmaW5pdGlvbnMgaGF2ZSBubyBvcmRlciBhbmQgd2lsbCBzYXRpc2Z5IGFueSBtYXRjaGluZyByZXF1ZXN0IGF0IGFueSB0aW1lLiBBbHNvXG4gICAqIHVubGlrZSBleHBlY3RhdGlvbnMsIHVudXNlZCBkZWZpbml0aW9ucyBkbyBub3QgY2F1c2UgYHZlcmlmeU5vT3V0c3RhbmRpbmdFeHBlY3RhdGlvbnNgXG4gICAqIHRvIHJldHVybiBhbiBlcnJvci5cbiAgICovXG4gIHdoZW4odXJsOiBzdHJpbmcsIHJlc3BvbnNlOiBzdHJpbmcpIHsgdGhpcy5fZGVmaW5pdGlvbnMuc2V0KHVybCwgcmVzcG9uc2UpOyB9XG5cbiAgLyoqXG4gICAqIFByb2Nlc3MgcGVuZGluZyByZXF1ZXN0cyBhbmQgdmVyaWZ5IHRoZXJlIGFyZSBubyBvdXRzdGFuZGluZyBleHBlY3RhdGlvbnMuIEFsc28gZmFpbHNcbiAgICogaWYgbm8gcmVxdWVzdHMgYXJlIHBlbmRpbmcuXG4gICAqL1xuICBmbHVzaCgpIHtcbiAgICBpZiAodGhpcy5fcmVxdWVzdHMubGVuZ3RoID09PSAwKSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbignTm8gcGVuZGluZyByZXF1ZXN0cyB0byBmbHVzaCcpO1xuICAgIH1cblxuICAgIGRvIHtcbiAgICAgIHRoaXMuX3Byb2Nlc3NSZXF1ZXN0KHRoaXMuX3JlcXVlc3RzLnNoaWZ0KCkpO1xuICAgIH0gd2hpbGUgKHRoaXMuX3JlcXVlc3RzLmxlbmd0aCA+IDApO1xuXG4gICAgdGhpcy52ZXJpZnlOb091dHN0YW5kaW5nRXhwZWN0YXRpb25zKCk7XG4gIH1cblxuICAvKipcbiAgICogVGhyb3cgYW4gZXhjZXB0aW9uIGlmIGFueSBleHBlY3RhdGlvbnMgaGF2ZSBub3QgYmVlbiBzYXRpc2ZpZWQuXG4gICAqL1xuICB2ZXJpZnlOb091dHN0YW5kaW5nRXhwZWN0YXRpb25zKCkge1xuICAgIGlmICh0aGlzLl9leHBlY3RhdGlvbnMubGVuZ3RoID09PSAwKSByZXR1cm47XG5cbiAgICB2YXIgdXJscyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5fZXhwZWN0YXRpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgZXhwZWN0YXRpb24gPSB0aGlzLl9leHBlY3RhdGlvbnNbaV07XG4gICAgICB1cmxzLnB1c2goZXhwZWN0YXRpb24udXJsKTtcbiAgICB9XG5cbiAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihgVW5zYXRpc2ZpZWQgcmVxdWVzdHM6ICR7dXJscy5qb2luKCcsICcpfWApO1xuICB9XG5cbiAgcHJpdmF0ZSBfcHJvY2Vzc1JlcXVlc3QocmVxdWVzdDogX1BlbmRpbmdSZXF1ZXN0KSB7XG4gICAgdmFyIHVybCA9IHJlcXVlc3QudXJsO1xuXG4gICAgaWYgKHRoaXMuX2V4cGVjdGF0aW9ucy5sZW5ndGggPiAwKSB7XG4gICAgICB2YXIgZXhwZWN0YXRpb24gPSB0aGlzLl9leHBlY3RhdGlvbnNbMF07XG4gICAgICBpZiAoZXhwZWN0YXRpb24udXJsID09IHVybCkge1xuICAgICAgICBMaXN0V3JhcHBlci5yZW1vdmUodGhpcy5fZXhwZWN0YXRpb25zLCBleHBlY3RhdGlvbik7XG4gICAgICAgIHJlcXVlc3QuY29tcGxldGUoZXhwZWN0YXRpb24ucmVzcG9uc2UpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2RlZmluaXRpb25zLmhhcyh1cmwpKSB7XG4gICAgICB2YXIgcmVzcG9uc2UgPSB0aGlzLl9kZWZpbml0aW9ucy5nZXQodXJsKTtcbiAgICAgIHJlcXVlc3QuY29tcGxldGUobm9ybWFsaXplQmxhbmsocmVzcG9uc2UpKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihgVW5leHBlY3RlZCByZXF1ZXN0ICR7dXJsfWApO1xuICB9XG59XG5cbmNsYXNzIF9QZW5kaW5nUmVxdWVzdCB7XG4gIHVybDogc3RyaW5nO1xuICBjb21wbGV0ZXI6IFByb21pc2VDb21wbGV0ZXI8c3RyaW5nPjtcblxuICBjb25zdHJ1Y3Rvcih1cmwpIHtcbiAgICB0aGlzLnVybCA9IHVybDtcbiAgICB0aGlzLmNvbXBsZXRlciA9IFByb21pc2VXcmFwcGVyLmNvbXBsZXRlcigpO1xuICB9XG5cbiAgY29tcGxldGUocmVzcG9uc2U6IHN0cmluZykge1xuICAgIGlmIChpc0JsYW5rKHJlc3BvbnNlKSkge1xuICAgICAgdGhpcy5jb21wbGV0ZXIucmVqZWN0KGBGYWlsZWQgdG8gbG9hZCAke3RoaXMudXJsfWAsIG51bGwpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmNvbXBsZXRlci5yZXNvbHZlKHJlc3BvbnNlKTtcbiAgICB9XG4gIH1cblxuICBnZXRQcm9taXNlKCk6IFByb21pc2U8c3RyaW5nPiB7IHJldHVybiB0aGlzLmNvbXBsZXRlci5wcm9taXNlOyB9XG59XG5cbmNsYXNzIF9FeHBlY3RhdGlvbiB7XG4gIHVybDogc3RyaW5nO1xuICByZXNwb25zZTogc3RyaW5nO1xuICBjb25zdHJ1Y3Rvcih1cmw6IHN0cmluZywgcmVzcG9uc2U6IHN0cmluZykge1xuICAgIHRoaXMudXJsID0gdXJsO1xuICAgIHRoaXMucmVzcG9uc2UgPSByZXNwb25zZTtcbiAgfVxufVxuIl19