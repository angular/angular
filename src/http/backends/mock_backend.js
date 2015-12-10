'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('angular2/core');
var static_request_1 = require('../static_request');
var enums_1 = require('../enums');
var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var Subject_1 = require('rxjs/Subject');
var ReplaySubject_1 = require('rxjs/subject/ReplaySubject');
var take_1 = require('rxjs/operator/take');
/**
 *
 * Mock Connection to represent a {@link Connection} for tests.
 *
 **/
var MockConnection = (function () {
    function MockConnection(req) {
        this.response = take_1.take.call(new ReplaySubject_1.ReplaySubject(1), 1);
        this.readyState = enums_1.ReadyState.Open;
        this.request = req;
    }
    /**
     * Sends a mock response to the connection. This response is the value that is emitted to the
     * {@link EventEmitter} returned by {@link Http}.
     *
     * ### Example
     *
     * ```
     * var connection;
     * backend.connections.subscribe(c => connection = c);
     * http.request('data.json').subscribe(res => console.log(res.text()));
     * connection.mockRespond(new Response('fake response')); //logs 'fake response'
     * ```
     *
     */
    MockConnection.prototype.mockRespond = function (res) {
        if (this.readyState === enums_1.ReadyState.Done || this.readyState === enums_1.ReadyState.Cancelled) {
            throw new exceptions_1.BaseException('Connection has already been resolved');
        }
        this.readyState = enums_1.ReadyState.Done;
        this.response.next(res);
        this.response.complete();
    };
    /**
     * Not yet implemented!
     *
     * Sends the provided {@link Response} to the `downloadObserver` of the `Request`
     * associated with this connection.
     */
    MockConnection.prototype.mockDownload = function (res) {
        // this.request.downloadObserver.onNext(res);
        // if (res.bytesLoaded === res.totalBytes) {
        //   this.request.downloadObserver.onCompleted();
        // }
    };
    // TODO(jeffbcross): consider using Response type
    /**
     * Emits the provided error object as an error to the {@link Response} {@link EventEmitter}
     * returned
     * from {@link Http}.
     */
    MockConnection.prototype.mockError = function (err) {
        // Matches XHR semantics
        this.readyState = enums_1.ReadyState.Done;
        this.response.error(err);
    };
    return MockConnection;
})();
exports.MockConnection = MockConnection;
/**
 * A mock backend for testing the {@link Http} service.
 *
 * This class can be injected in tests, and should be used to override providers
 * to other backends, such as {@link XHRBackend}.
 *
 * ### Example
 *
 * ```
 * import {DefaultOptions, Http} from 'angular2/http';
 * import {MockBackend} from 'angular2/http/testing';
 * it('should get some data', inject([AsyncTestCompleter], (async) => {
 *   var connection;
 *   var injector = Injector.resolveAndCreate([
 *     MockBackend,
 *     provide(Http, {useFactory: (backend, defaultOptions) => {
 *       return new Http(backend, defaultOptions)
 *     }, deps: [MockBackend, DefaultOptions]})]);
 *   var http = injector.get(Http);
 *   var backend = injector.get(MockBackend);
 *   //Assign any newly-created connection to local variable
 *   backend.connections.subscribe(c => connection = c);
 *   http.request('data.json').subscribe((res) => {
 *     expect(res.text()).toBe('awesome');
 *     async.done();
 *   });
 *   connection.mockRespond(new Response('awesome'));
 * }));
 * ```
 *
 * This method only exists in the mock implementation, not in real Backends.
 **/
var MockBackend = (function () {
    function MockBackend() {
        var _this = this;
        this.connectionsArray = [];
        this.connections = new Subject_1.Subject();
        this.connections.subscribe(function (connection) { return _this.connectionsArray.push(connection); });
        this.pendingConnections = new Subject_1.Subject();
    }
    /**
     * Checks all connections, and raises an exception if any connection has not received a response.
     *
     * This method only exists in the mock implementation, not in real Backends.
     */
    MockBackend.prototype.verifyNoPendingRequests = function () {
        var pending = 0;
        this.pendingConnections.subscribe(function (c) { return pending++; });
        if (pending > 0)
            throw new exceptions_1.BaseException(pending + " pending connections to be resolved");
    };
    /**
     * Can be used in conjunction with `verifyNoPendingRequests` to resolve any not-yet-resolve
     * connections, if it's expected that there are connections that have not yet received a response.
     *
     * This method only exists in the mock implementation, not in real Backends.
     */
    MockBackend.prototype.resolveAllConnections = function () { this.connections.subscribe(function (c) { return c.readyState = 4; }); };
    /**
     * Creates a new {@link MockConnection}. This is equivalent to calling `new
     * MockConnection()`, except that it also will emit the new `Connection` to the `connections`
     * emitter of this `MockBackend` instance. This method will usually only be used by tests
     * against the framework itself, not by end-users.
     */
    MockBackend.prototype.createConnection = function (req) {
        if (!lang_1.isPresent(req) || !(req instanceof static_request_1.Request)) {
            throw new exceptions_1.BaseException("createConnection requires an instance of Request, got " + req);
        }
        var connection = new MockConnection(req);
        this.connections.next(connection);
        return connection;
    };
    MockBackend = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], MockBackend);
    return MockBackend;
})();
exports.MockBackend = MockBackend;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9ja19iYWNrZW5kLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2h0dHAvYmFja2VuZHMvbW9ja19iYWNrZW5kLnRzIl0sIm5hbWVzIjpbIk1vY2tDb25uZWN0aW9uIiwiTW9ja0Nvbm5lY3Rpb24uY29uc3RydWN0b3IiLCJNb2NrQ29ubmVjdGlvbi5tb2NrUmVzcG9uZCIsIk1vY2tDb25uZWN0aW9uLm1vY2tEb3dubG9hZCIsIk1vY2tDb25uZWN0aW9uLm1vY2tFcnJvciIsIk1vY2tCYWNrZW5kIiwiTW9ja0JhY2tlbmQuY29uc3RydWN0b3IiLCJNb2NrQmFja2VuZC52ZXJpZnlOb1BlbmRpbmdSZXF1ZXN0cyIsIk1vY2tCYWNrZW5kLnJlc29sdmVBbGxDb25uZWN0aW9ucyIsIk1vY2tCYWNrZW5kLmNyZWF0ZUNvbm5lY3Rpb24iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLHFCQUF5QixlQUFlLENBQUMsQ0FBQTtBQUN6QywrQkFBc0IsbUJBQW1CLENBQUMsQ0FBQTtBQUUxQyxzQkFBeUIsVUFBVSxDQUFDLENBQUE7QUFFcEMscUJBQXdCLDBCQUEwQixDQUFDLENBQUE7QUFDbkQsMkJBQThDLGdDQUFnQyxDQUFDLENBQUE7QUFDL0Usd0JBQXNCLGNBQWMsQ0FBQyxDQUFBO0FBQ3JDLDhCQUE0Qiw0QkFBNEIsQ0FBQyxDQUFBO0FBQ3pELHFCQUFtQixvQkFBb0IsQ0FBQyxDQUFBO0FBRXhDOzs7O0lBSUk7QUFDSjtJQW9CRUEsd0JBQVlBLEdBQVlBO1FBQ3RCQyxJQUFJQSxDQUFDQSxRQUFRQSxHQUFHQSxXQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSw2QkFBYUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDbkRBLElBQUlBLENBQUNBLFVBQVVBLEdBQUdBLGtCQUFVQSxDQUFDQSxJQUFJQSxDQUFDQTtRQUNsQ0EsSUFBSUEsQ0FBQ0EsT0FBT0EsR0FBR0EsR0FBR0EsQ0FBQ0E7SUFDckJBLENBQUNBO0lBRUREOzs7Ozs7Ozs7Ozs7O09BYUdBO0lBQ0hBLG9DQUFXQSxHQUFYQSxVQUFZQSxHQUFhQTtRQUN2QkUsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsVUFBVUEsS0FBS0Esa0JBQVVBLENBQUNBLElBQUlBLElBQUlBLElBQUlBLENBQUNBLFVBQVVBLEtBQUtBLGtCQUFVQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNwRkEsTUFBTUEsSUFBSUEsMEJBQWFBLENBQUNBLHNDQUFzQ0EsQ0FBQ0EsQ0FBQ0E7UUFDbEVBLENBQUNBO1FBQ0RBLElBQUlBLENBQUNBLFVBQVVBLEdBQUdBLGtCQUFVQSxDQUFDQSxJQUFJQSxDQUFDQTtRQUNsQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7UUFDeEJBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLFFBQVFBLEVBQUVBLENBQUNBO0lBQzNCQSxDQUFDQTtJQUVERjs7Ozs7T0FLR0E7SUFDSEEscUNBQVlBLEdBQVpBLFVBQWFBLEdBQWFBO1FBQ3hCRyw2Q0FBNkNBO1FBQzdDQSw0Q0FBNENBO1FBQzVDQSxpREFBaURBO1FBQ2pEQSxJQUFJQTtJQUNOQSxDQUFDQTtJQUVESCxpREFBaURBO0lBQ2pEQTs7OztPQUlHQTtJQUNIQSxrQ0FBU0EsR0FBVEEsVUFBVUEsR0FBV0E7UUFDbkJJLHdCQUF3QkE7UUFDeEJBLElBQUlBLENBQUNBLFVBQVVBLEdBQUdBLGtCQUFVQSxDQUFDQSxJQUFJQSxDQUFDQTtRQUNsQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7SUFDM0JBLENBQUNBO0lBQ0hKLHFCQUFDQTtBQUFEQSxDQUFDQSxBQXpFRCxJQXlFQztBQXpFWSxzQkFBYyxpQkF5RTFCLENBQUE7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQStCSTtBQUNKO0lBb0RFSztRQXBERkMsaUJBNEZDQTtRQXZDR0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxHQUFHQSxFQUFFQSxDQUFDQTtRQUMzQkEsSUFBSUEsQ0FBQ0EsV0FBV0EsR0FBR0EsSUFBSUEsaUJBQU9BLEVBQUVBLENBQUNBO1FBQ2pDQSxJQUFJQSxDQUFDQSxXQUFXQSxDQUFDQSxTQUFTQSxDQUFDQSxVQUFBQSxVQUFVQSxJQUFJQSxPQUFBQSxLQUFJQSxDQUFDQSxnQkFBZ0JBLENBQUNBLElBQUlBLENBQUNBLFVBQVVBLENBQUNBLEVBQXRDQSxDQUFzQ0EsQ0FBQ0EsQ0FBQ0E7UUFDakZBLElBQUlBLENBQUNBLGtCQUFrQkEsR0FBR0EsSUFBSUEsaUJBQU9BLEVBQUVBLENBQUNBO0lBQzFDQSxDQUFDQTtJQUVERDs7OztPQUlHQTtJQUNIQSw2Q0FBdUJBLEdBQXZCQTtRQUNFRSxJQUFJQSxPQUFPQSxHQUFHQSxDQUFDQSxDQUFDQTtRQUNoQkEsSUFBSUEsQ0FBQ0Esa0JBQWtCQSxDQUFDQSxTQUFTQSxDQUFDQSxVQUFBQSxDQUFDQSxJQUFJQSxPQUFBQSxPQUFPQSxFQUFFQSxFQUFUQSxDQUFTQSxDQUFDQSxDQUFDQTtRQUNsREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsT0FBT0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7WUFBQ0EsTUFBTUEsSUFBSUEsMEJBQWFBLENBQUlBLE9BQU9BLHdDQUFxQ0EsQ0FBQ0EsQ0FBQ0E7SUFDNUZBLENBQUNBO0lBRURGOzs7OztPQUtHQTtJQUNIQSwyQ0FBcUJBLEdBQXJCQSxjQUEwQkcsSUFBSUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsVUFBQUEsQ0FBQ0EsSUFBSUEsT0FBQUEsQ0FBQ0EsQ0FBQ0EsVUFBVUEsR0FBR0EsQ0FBQ0EsRUFBaEJBLENBQWdCQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUU5RUg7Ozs7O09BS0dBO0lBQ0hBLHNDQUFnQkEsR0FBaEJBLFVBQWlCQSxHQUFZQTtRQUMzQkksRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLEdBQUdBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLEdBQUdBLFlBQVlBLHdCQUFPQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNqREEsTUFBTUEsSUFBSUEsMEJBQWFBLENBQUNBLDJEQUF5REEsR0FBS0EsQ0FBQ0EsQ0FBQ0E7UUFDMUZBLENBQUNBO1FBQ0RBLElBQUlBLFVBQVVBLEdBQUdBLElBQUlBLGNBQWNBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBO1FBQ3pDQSxJQUFJQSxDQUFDQSxXQUFXQSxDQUFDQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxDQUFDQTtRQUNsQ0EsTUFBTUEsQ0FBQ0EsVUFBVUEsQ0FBQ0E7SUFDcEJBLENBQUNBO0lBM0ZISjtRQUFDQSxpQkFBVUEsRUFBRUE7O29CQTRGWkE7SUFBREEsa0JBQUNBO0FBQURBLENBQUNBLEFBNUZELElBNEZDO0FBM0ZZLG1CQUFXLGNBMkZ2QixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmltcG9ydCB7UmVxdWVzdH0gZnJvbSAnLi4vc3RhdGljX3JlcXVlc3QnO1xuaW1wb3J0IHtSZXNwb25zZX0gZnJvbSAnLi4vc3RhdGljX3Jlc3BvbnNlJztcbmltcG9ydCB7UmVhZHlTdGF0ZX0gZnJvbSAnLi4vZW51bXMnO1xuaW1wb3J0IHtDb25uZWN0aW9uLCBDb25uZWN0aW9uQmFja2VuZH0gZnJvbSAnLi4vaW50ZXJmYWNlcyc7XG5pbXBvcnQge2lzUHJlc2VudH0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7QmFzZUV4Y2VwdGlvbiwgV3JhcHBlZEV4Y2VwdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCB7U3ViamVjdH0gZnJvbSAncnhqcy9TdWJqZWN0JztcbmltcG9ydCB7UmVwbGF5U3ViamVjdH0gZnJvbSAncnhqcy9zdWJqZWN0L1JlcGxheVN1YmplY3QnO1xuaW1wb3J0IHt0YWtlfSBmcm9tICdyeGpzL29wZXJhdG9yL3Rha2UnO1xuXG4vKipcbiAqXG4gKiBNb2NrIENvbm5lY3Rpb24gdG8gcmVwcmVzZW50IGEge0BsaW5rIENvbm5lY3Rpb259IGZvciB0ZXN0cy5cbiAqXG4gKiovXG5leHBvcnQgY2xhc3MgTW9ja0Nvbm5lY3Rpb24gaW1wbGVtZW50cyBDb25uZWN0aW9uIHtcbiAgLy8gVE9ETyBOYW1lIGByZWFkeVN0YXRlYCBzaG91bGQgY2hhbmdlIHRvIGJlIG1vcmUgZ2VuZXJpYywgYW5kIHN0YXRlcyBjb3VsZCBiZSBtYWRlIHRvIGJlIG1vcmVcbiAgLy8gZGVzY3JpcHRpdmUgdGhhbiBYSFIgc3RhdGVzLlxuICAvKipcbiAgICogRGVzY3JpYmVzIHRoZSBzdGF0ZSBvZiB0aGUgY29ubmVjdGlvbiwgYmFzZWQgb24gYFhNTEh0dHBSZXF1ZXN0LnJlYWR5U3RhdGVgLCBidXQgd2l0aFxuICAgKiBhZGRpdGlvbmFsIHN0YXRlcy4gRm9yIGV4YW1wbGUsIHN0YXRlIDUgaW5kaWNhdGVzIGFuIGFib3J0ZWQgY29ubmVjdGlvbi5cbiAgICovXG4gIHJlYWR5U3RhdGU6IFJlYWR5U3RhdGU7XG5cbiAgLyoqXG4gICAqIHtAbGluayBSZXF1ZXN0fSBpbnN0YW5jZSB1c2VkIHRvIGNyZWF0ZSB0aGUgY29ubmVjdGlvbi5cbiAgICovXG4gIHJlcXVlc3Q6IFJlcXVlc3Q7XG5cbiAgLyoqXG4gICAqIHtAbGluayBFdmVudEVtaXR0ZXJ9IG9mIHtAbGluayBSZXNwb25zZX0uIENhbiBiZSBzdWJzY3JpYmVkIHRvIGluIG9yZGVyIHRvIGJlIG5vdGlmaWVkIHdoZW4gYVxuICAgKiByZXNwb25zZSBpcyBhdmFpbGFibGUuXG4gICAqL1xuICByZXNwb25zZTogYW55OyAgLy8gU3ViamVjdDxSZXNwb25zZT5cblxuICBjb25zdHJ1Y3RvcihyZXE6IFJlcXVlc3QpIHtcbiAgICB0aGlzLnJlc3BvbnNlID0gdGFrZS5jYWxsKG5ldyBSZXBsYXlTdWJqZWN0KDEpLCAxKTtcbiAgICB0aGlzLnJlYWR5U3RhdGUgPSBSZWFkeVN0YXRlLk9wZW47XG4gICAgdGhpcy5yZXF1ZXN0ID0gcmVxO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlbmRzIGEgbW9jayByZXNwb25zZSB0byB0aGUgY29ubmVjdGlvbi4gVGhpcyByZXNwb25zZSBpcyB0aGUgdmFsdWUgdGhhdCBpcyBlbWl0dGVkIHRvIHRoZVxuICAgKiB7QGxpbmsgRXZlbnRFbWl0dGVyfSByZXR1cm5lZCBieSB7QGxpbmsgSHR0cH0uXG4gICAqXG4gICAqICMjIyBFeGFtcGxlXG4gICAqXG4gICAqIGBgYFxuICAgKiB2YXIgY29ubmVjdGlvbjtcbiAgICogYmFja2VuZC5jb25uZWN0aW9ucy5zdWJzY3JpYmUoYyA9PiBjb25uZWN0aW9uID0gYyk7XG4gICAqIGh0dHAucmVxdWVzdCgnZGF0YS5qc29uJykuc3Vic2NyaWJlKHJlcyA9PiBjb25zb2xlLmxvZyhyZXMudGV4dCgpKSk7XG4gICAqIGNvbm5lY3Rpb24ubW9ja1Jlc3BvbmQobmV3IFJlc3BvbnNlKCdmYWtlIHJlc3BvbnNlJykpOyAvL2xvZ3MgJ2Zha2UgcmVzcG9uc2UnXG4gICAqIGBgYFxuICAgKlxuICAgKi9cbiAgbW9ja1Jlc3BvbmQocmVzOiBSZXNwb25zZSkge1xuICAgIGlmICh0aGlzLnJlYWR5U3RhdGUgPT09IFJlYWR5U3RhdGUuRG9uZSB8fCB0aGlzLnJlYWR5U3RhdGUgPT09IFJlYWR5U3RhdGUuQ2FuY2VsbGVkKSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbignQ29ubmVjdGlvbiBoYXMgYWxyZWFkeSBiZWVuIHJlc29sdmVkJyk7XG4gICAgfVxuICAgIHRoaXMucmVhZHlTdGF0ZSA9IFJlYWR5U3RhdGUuRG9uZTtcbiAgICB0aGlzLnJlc3BvbnNlLm5leHQocmVzKTtcbiAgICB0aGlzLnJlc3BvbnNlLmNvbXBsZXRlKCk7XG4gIH1cblxuICAvKipcbiAgICogTm90IHlldCBpbXBsZW1lbnRlZCFcbiAgICpcbiAgICogU2VuZHMgdGhlIHByb3ZpZGVkIHtAbGluayBSZXNwb25zZX0gdG8gdGhlIGBkb3dubG9hZE9ic2VydmVyYCBvZiB0aGUgYFJlcXVlc3RgXG4gICAqIGFzc29jaWF0ZWQgd2l0aCB0aGlzIGNvbm5lY3Rpb24uXG4gICAqL1xuICBtb2NrRG93bmxvYWQocmVzOiBSZXNwb25zZSkge1xuICAgIC8vIHRoaXMucmVxdWVzdC5kb3dubG9hZE9ic2VydmVyLm9uTmV4dChyZXMpO1xuICAgIC8vIGlmIChyZXMuYnl0ZXNMb2FkZWQgPT09IHJlcy50b3RhbEJ5dGVzKSB7XG4gICAgLy8gICB0aGlzLnJlcXVlc3QuZG93bmxvYWRPYnNlcnZlci5vbkNvbXBsZXRlZCgpO1xuICAgIC8vIH1cbiAgfVxuXG4gIC8vIFRPRE8oamVmZmJjcm9zcyk6IGNvbnNpZGVyIHVzaW5nIFJlc3BvbnNlIHR5cGVcbiAgLyoqXG4gICAqIEVtaXRzIHRoZSBwcm92aWRlZCBlcnJvciBvYmplY3QgYXMgYW4gZXJyb3IgdG8gdGhlIHtAbGluayBSZXNwb25zZX0ge0BsaW5rIEV2ZW50RW1pdHRlcn1cbiAgICogcmV0dXJuZWRcbiAgICogZnJvbSB7QGxpbmsgSHR0cH0uXG4gICAqL1xuICBtb2NrRXJyb3IoZXJyPzogRXJyb3IpIHtcbiAgICAvLyBNYXRjaGVzIFhIUiBzZW1hbnRpY3NcbiAgICB0aGlzLnJlYWR5U3RhdGUgPSBSZWFkeVN0YXRlLkRvbmU7XG4gICAgdGhpcy5yZXNwb25zZS5lcnJvcihlcnIpO1xuICB9XG59XG5cbi8qKlxuICogQSBtb2NrIGJhY2tlbmQgZm9yIHRlc3RpbmcgdGhlIHtAbGluayBIdHRwfSBzZXJ2aWNlLlxuICpcbiAqIFRoaXMgY2xhc3MgY2FuIGJlIGluamVjdGVkIGluIHRlc3RzLCBhbmQgc2hvdWxkIGJlIHVzZWQgdG8gb3ZlcnJpZGUgcHJvdmlkZXJzXG4gKiB0byBvdGhlciBiYWNrZW5kcywgc3VjaCBhcyB7QGxpbmsgWEhSQmFja2VuZH0uXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBgYGBcbiAqIGltcG9ydCB7RGVmYXVsdE9wdGlvbnMsIEh0dHB9IGZyb20gJ2FuZ3VsYXIyL2h0dHAnO1xuICogaW1wb3J0IHtNb2NrQmFja2VuZH0gZnJvbSAnYW5ndWxhcjIvaHR0cC90ZXN0aW5nJztcbiAqIGl0KCdzaG91bGQgZ2V0IHNvbWUgZGF0YScsIGluamVjdChbQXN5bmNUZXN0Q29tcGxldGVyXSwgKGFzeW5jKSA9PiB7XG4gKiAgIHZhciBjb25uZWN0aW9uO1xuICogICB2YXIgaW5qZWN0b3IgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtcbiAqICAgICBNb2NrQmFja2VuZCxcbiAqICAgICBwcm92aWRlKEh0dHAsIHt1c2VGYWN0b3J5OiAoYmFja2VuZCwgZGVmYXVsdE9wdGlvbnMpID0+IHtcbiAqICAgICAgIHJldHVybiBuZXcgSHR0cChiYWNrZW5kLCBkZWZhdWx0T3B0aW9ucylcbiAqICAgICB9LCBkZXBzOiBbTW9ja0JhY2tlbmQsIERlZmF1bHRPcHRpb25zXX0pXSk7XG4gKiAgIHZhciBodHRwID0gaW5qZWN0b3IuZ2V0KEh0dHApO1xuICogICB2YXIgYmFja2VuZCA9IGluamVjdG9yLmdldChNb2NrQmFja2VuZCk7XG4gKiAgIC8vQXNzaWduIGFueSBuZXdseS1jcmVhdGVkIGNvbm5lY3Rpb24gdG8gbG9jYWwgdmFyaWFibGVcbiAqICAgYmFja2VuZC5jb25uZWN0aW9ucy5zdWJzY3JpYmUoYyA9PiBjb25uZWN0aW9uID0gYyk7XG4gKiAgIGh0dHAucmVxdWVzdCgnZGF0YS5qc29uJykuc3Vic2NyaWJlKChyZXMpID0+IHtcbiAqICAgICBleHBlY3QocmVzLnRleHQoKSkudG9CZSgnYXdlc29tZScpO1xuICogICAgIGFzeW5jLmRvbmUoKTtcbiAqICAgfSk7XG4gKiAgIGNvbm5lY3Rpb24ubW9ja1Jlc3BvbmQobmV3IFJlc3BvbnNlKCdhd2Vzb21lJykpO1xuICogfSkpO1xuICogYGBgXG4gKlxuICogVGhpcyBtZXRob2Qgb25seSBleGlzdHMgaW4gdGhlIG1vY2sgaW1wbGVtZW50YXRpb24sIG5vdCBpbiByZWFsIEJhY2tlbmRzLlxuICoqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIE1vY2tCYWNrZW5kIGltcGxlbWVudHMgQ29ubmVjdGlvbkJhY2tlbmQge1xuICAvKipcbiAgICoge0BsaW5rIEV2ZW50RW1pdHRlcn1cbiAgICogb2Yge0BsaW5rIE1vY2tDb25uZWN0aW9ufSBpbnN0YW5jZXMgdGhhdCBoYXZlIGJlZW4gY3JlYXRlZCBieSB0aGlzIGJhY2tlbmQuIENhbiBiZSBzdWJzY3JpYmVkXG4gICAqIHRvIGluIG9yZGVyIHRvIHJlc3BvbmQgdG8gY29ubmVjdGlvbnMuXG4gICAqXG4gICAqICMjIyBFeGFtcGxlXG4gICAqXG4gICAqIGBgYFxuICAgKiBpbXBvcnQge01vY2tCYWNrZW5kLCBIdHRwLCBCYXNlUmVxdWVzdE9wdGlvbnN9IGZyb20gJ2FuZ3VsYXIyL2h0dHAnO1xuICAgKiBpbXBvcnQge0luamVjdG9yfSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbiAgICpcbiAgICogaXQoJ3Nob3VsZCBnZXQgYSByZXNwb25zZScsICgpID0+IHtcbiAgICogICB2YXIgY29ubmVjdGlvbjsgLy90aGlzIHdpbGwgYmUgc2V0IHdoZW4gYSBuZXcgY29ubmVjdGlvbiBpcyBlbWl0dGVkIGZyb20gdGhlIGJhY2tlbmQuXG4gICAqICAgdmFyIHRleHQ7IC8vdGhpcyB3aWxsIGJlIHNldCBmcm9tIG1vY2sgcmVzcG9uc2VcbiAgICogICB2YXIgaW5qZWN0b3IgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtcbiAgICogICAgIE1vY2tCYWNrZW5kLFxuICAgKiAgICAgcHJvdmlkZShIdHRwLCB7dXNlRmFjdG9yeTogKGJhY2tlbmQsIG9wdGlvbnMpIHtcbiAgICogICAgICAgcmV0dXJuIG5ldyBIdHRwKGJhY2tlbmQsIG9wdGlvbnMpO1xuICAgKiAgICAgfSwgZGVwczogW01vY2tCYWNrZW5kLCBCYXNlUmVxdWVzdE9wdGlvbnNdfV0pO1xuICAgKiAgIHZhciBiYWNrZW5kID0gaW5qZWN0b3IuZ2V0KE1vY2tCYWNrZW5kKTtcbiAgICogICB2YXIgaHR0cCA9IGluamVjdG9yLmdldChIdHRwKTtcbiAgICogICBiYWNrZW5kLmNvbm5lY3Rpb25zLnN1YnNjcmliZShjID0+IGNvbm5lY3Rpb24gPSBjKTtcbiAgICogICBodHRwLnJlcXVlc3QoJ3NvbWV0aGluZy5qc29uJykuc3Vic2NyaWJlKHJlcyA9PiB7XG4gICAqICAgICB0ZXh0ID0gcmVzLnRleHQoKTtcbiAgICogICB9KTtcbiAgICogICBjb25uZWN0aW9uLm1vY2tSZXNwb25kKG5ldyBSZXNwb25zZSh7Ym9keTogJ1NvbWV0aGluZyd9KSk7XG4gICAqICAgZXhwZWN0KHRleHQpLnRvQmUoJ1NvbWV0aGluZycpO1xuICAgKiB9KTtcbiAgICogYGBgXG4gICAqXG4gICAqIFRoaXMgcHJvcGVydHkgb25seSBleGlzdHMgaW4gdGhlIG1vY2sgaW1wbGVtZW50YXRpb24sIG5vdCBpbiByZWFsIEJhY2tlbmRzLlxuICAgKi9cbiAgY29ubmVjdGlvbnM6IGFueTsgIC8vPE1vY2tDb25uZWN0aW9uPlxuXG4gIC8qKlxuICAgKiBBbiBhcnJheSByZXByZXNlbnRhdGlvbiBvZiBgY29ubmVjdGlvbnNgLiBUaGlzIGFycmF5IHdpbGwgYmUgdXBkYXRlZCB3aXRoIGVhY2ggY29ubmVjdGlvbiB0aGF0XG4gICAqIGlzIGNyZWF0ZWQgYnkgdGhpcyBiYWNrZW5kLlxuICAgKlxuICAgKiBUaGlzIHByb3BlcnR5IG9ubHkgZXhpc3RzIGluIHRoZSBtb2NrIGltcGxlbWVudGF0aW9uLCBub3QgaW4gcmVhbCBCYWNrZW5kcy5cbiAgICovXG4gIGNvbm5lY3Rpb25zQXJyYXk6IE1vY2tDb25uZWN0aW9uW107XG4gIC8qKlxuICAgKiB7QGxpbmsgRXZlbnRFbWl0dGVyfSBvZiB7QGxpbmsgTW9ja0Nvbm5lY3Rpb259IGluc3RhbmNlcyB0aGF0IGhhdmVuJ3QgeWV0IGJlZW4gcmVzb2x2ZWQgKGkuZS5cbiAgICogd2l0aCBhIGByZWFkeVN0YXRlYFxuICAgKiBsZXNzIHRoYW4gNCkuIFVzZWQgaW50ZXJuYWxseSB0byB2ZXJpZnkgdGhhdCBubyBjb25uZWN0aW9ucyBhcmUgcGVuZGluZyB2aWEgdGhlXG4gICAqIGB2ZXJpZnlOb1BlbmRpbmdSZXF1ZXN0c2AgbWV0aG9kLlxuICAgKlxuICAgKiBUaGlzIHByb3BlcnR5IG9ubHkgZXhpc3RzIGluIHRoZSBtb2NrIGltcGxlbWVudGF0aW9uLCBub3QgaW4gcmVhbCBCYWNrZW5kcy5cbiAgICovXG4gIHBlbmRpbmdDb25uZWN0aW9uczogYW55OyAgLy8gU3ViamVjdDxNb2NrQ29ubmVjdGlvbj5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5jb25uZWN0aW9uc0FycmF5ID0gW107XG4gICAgdGhpcy5jb25uZWN0aW9ucyA9IG5ldyBTdWJqZWN0KCk7XG4gICAgdGhpcy5jb25uZWN0aW9ucy5zdWJzY3JpYmUoY29ubmVjdGlvbiA9PiB0aGlzLmNvbm5lY3Rpb25zQXJyYXkucHVzaChjb25uZWN0aW9uKSk7XG4gICAgdGhpcy5wZW5kaW5nQ29ubmVjdGlvbnMgPSBuZXcgU3ViamVjdCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyBhbGwgY29ubmVjdGlvbnMsIGFuZCByYWlzZXMgYW4gZXhjZXB0aW9uIGlmIGFueSBjb25uZWN0aW9uIGhhcyBub3QgcmVjZWl2ZWQgYSByZXNwb25zZS5cbiAgICpcbiAgICogVGhpcyBtZXRob2Qgb25seSBleGlzdHMgaW4gdGhlIG1vY2sgaW1wbGVtZW50YXRpb24sIG5vdCBpbiByZWFsIEJhY2tlbmRzLlxuICAgKi9cbiAgdmVyaWZ5Tm9QZW5kaW5nUmVxdWVzdHMoKSB7XG4gICAgbGV0IHBlbmRpbmcgPSAwO1xuICAgIHRoaXMucGVuZGluZ0Nvbm5lY3Rpb25zLnN1YnNjcmliZShjID0+IHBlbmRpbmcrKyk7XG4gICAgaWYgKHBlbmRpbmcgPiAwKSB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihgJHtwZW5kaW5nfSBwZW5kaW5nIGNvbm5lY3Rpb25zIHRvIGJlIHJlc29sdmVkYCk7XG4gIH1cblxuICAvKipcbiAgICogQ2FuIGJlIHVzZWQgaW4gY29uanVuY3Rpb24gd2l0aCBgdmVyaWZ5Tm9QZW5kaW5nUmVxdWVzdHNgIHRvIHJlc29sdmUgYW55IG5vdC15ZXQtcmVzb2x2ZVxuICAgKiBjb25uZWN0aW9ucywgaWYgaXQncyBleHBlY3RlZCB0aGF0IHRoZXJlIGFyZSBjb25uZWN0aW9ucyB0aGF0IGhhdmUgbm90IHlldCByZWNlaXZlZCBhIHJlc3BvbnNlLlxuICAgKlxuICAgKiBUaGlzIG1ldGhvZCBvbmx5IGV4aXN0cyBpbiB0aGUgbW9jayBpbXBsZW1lbnRhdGlvbiwgbm90IGluIHJlYWwgQmFja2VuZHMuXG4gICAqL1xuICByZXNvbHZlQWxsQ29ubmVjdGlvbnMoKSB7IHRoaXMuY29ubmVjdGlvbnMuc3Vic2NyaWJlKGMgPT4gYy5yZWFkeVN0YXRlID0gNCk7IH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyB7QGxpbmsgTW9ja0Nvbm5lY3Rpb259LiBUaGlzIGlzIGVxdWl2YWxlbnQgdG8gY2FsbGluZyBgbmV3XG4gICAqIE1vY2tDb25uZWN0aW9uKClgLCBleGNlcHQgdGhhdCBpdCBhbHNvIHdpbGwgZW1pdCB0aGUgbmV3IGBDb25uZWN0aW9uYCB0byB0aGUgYGNvbm5lY3Rpb25zYFxuICAgKiBlbWl0dGVyIG9mIHRoaXMgYE1vY2tCYWNrZW5kYCBpbnN0YW5jZS4gVGhpcyBtZXRob2Qgd2lsbCB1c3VhbGx5IG9ubHkgYmUgdXNlZCBieSB0ZXN0c1xuICAgKiBhZ2FpbnN0IHRoZSBmcmFtZXdvcmsgaXRzZWxmLCBub3QgYnkgZW5kLXVzZXJzLlxuICAgKi9cbiAgY3JlYXRlQ29ubmVjdGlvbihyZXE6IFJlcXVlc3QpOiBDb25uZWN0aW9uIHtcbiAgICBpZiAoIWlzUHJlc2VudChyZXEpIHx8ICEocmVxIGluc3RhbmNlb2YgUmVxdWVzdCkpIHtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKGBjcmVhdGVDb25uZWN0aW9uIHJlcXVpcmVzIGFuIGluc3RhbmNlIG9mIFJlcXVlc3QsIGdvdCAke3JlcX1gKTtcbiAgICB9XG4gICAgbGV0IGNvbm5lY3Rpb24gPSBuZXcgTW9ja0Nvbm5lY3Rpb24ocmVxKTtcbiAgICB0aGlzLmNvbm5lY3Rpb25zLm5leHQoY29ubmVjdGlvbik7XG4gICAgcmV0dXJuIGNvbm5lY3Rpb247XG4gIH1cbn1cbiJdfQ==