'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
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
var ReplaySubject_1 = require('rxjs/subjects/ReplaySubject');
require('rxjs/operators/take');
/**
 *
 * Mock Connection to represent a {@link Connection} for tests.
 *
 **/
var MockConnection = (function () {
    function MockConnection(req) {
        this.response = new ReplaySubject_1.ReplaySubject(1).take(1);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9ja19iYWNrZW5kLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2h0dHAvYmFja2VuZHMvbW9ja19iYWNrZW5kLnRzIl0sIm5hbWVzIjpbIk1vY2tDb25uZWN0aW9uIiwiTW9ja0Nvbm5lY3Rpb24uY29uc3RydWN0b3IiLCJNb2NrQ29ubmVjdGlvbi5tb2NrUmVzcG9uZCIsIk1vY2tDb25uZWN0aW9uLm1vY2tEb3dubG9hZCIsIk1vY2tDb25uZWN0aW9uLm1vY2tFcnJvciIsIk1vY2tCYWNrZW5kIiwiTW9ja0JhY2tlbmQuY29uc3RydWN0b3IiLCJNb2NrQmFja2VuZC52ZXJpZnlOb1BlbmRpbmdSZXF1ZXN0cyIsIk1vY2tCYWNrZW5kLnJlc29sdmVBbGxDb25uZWN0aW9ucyIsIk1vY2tCYWNrZW5kLmNyZWF0ZUNvbm5lY3Rpb24iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEscUJBQXlCLGVBQWUsQ0FBQyxDQUFBO0FBQ3pDLCtCQUFzQixtQkFBbUIsQ0FBQyxDQUFBO0FBRTFDLHNCQUF5QixVQUFVLENBQUMsQ0FBQTtBQUVwQyxxQkFBd0IsMEJBQTBCLENBQUMsQ0FBQTtBQUNuRCwyQkFBOEMsZ0NBQWdDLENBQUMsQ0FBQTtBQUMvRSx3QkFBc0IsY0FBYyxDQUFDLENBQUE7QUFDckMsOEJBQTRCLDZCQUE2QixDQUFDLENBQUE7QUFDMUQsUUFBTyxxQkFBcUIsQ0FBQyxDQUFBO0FBRTdCOzs7O0lBSUk7QUFDSjtJQW9CRUEsd0JBQVlBLEdBQVlBO1FBQ3RCQyxJQUFJQSxDQUFDQSxRQUFRQSxHQUFHQSxJQUFJQSw2QkFBYUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDN0NBLElBQUlBLENBQUNBLFVBQVVBLEdBQUdBLGtCQUFVQSxDQUFDQSxJQUFJQSxDQUFDQTtRQUNsQ0EsSUFBSUEsQ0FBQ0EsT0FBT0EsR0FBR0EsR0FBR0EsQ0FBQ0E7SUFDckJBLENBQUNB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LFlBQVlBLHdCQUFPQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNqREEsTUFBTUEsSUFBSUEsMEJBQWFBLENBQUNBLDJEQUF5REEsR0FBS0EsQ0FBQ0EsQ0FBQ0E7UUFDMUZBLENBQUNBO1FBQ0RBLElBQUlBLFVBQVVBLEdBQUdBLElBQUlBLGNBQWNBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBO1FBQ3pDQSxJQUFJQSxDQUFDQSxXQUFXQSxDQUFDQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxDQUFDQTtRQUNsQ0EsTUFBTUEsQ0FBQ0EsVUFBVUEsQ0FBQ0E7SUFDcEJBLENBQUNBO0lBM0ZISjtRQUFDQSxpQkFBVUEsRUFBRUE7O29CQTRGWkE7SUFBREEsa0JBQUNBO0FBQURBLENBQUNBLEFBNUZELElBNEZDO0FBM0ZZLG1CQUFXLGNBMkZ2QixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmltcG9ydCB7UmVxdWVzdH0gZnJvbSAnLi4vc3RhdGljX3JlcXVlc3QnO1xuaW1wb3J0IHtSZXNwb25zZX0gZnJvbSAnLi4vc3RhdGljX3Jlc3BvbnNlJztcbmltcG9ydCB7UmVhZHlTdGF0ZX0gZnJvbSAnLi4vZW51bXMnO1xuaW1wb3J0IHtDb25uZWN0aW9uLCBDb25uZWN0aW9uQmFja2VuZH0gZnJvbSAnLi4vaW50ZXJmYWNlcyc7XG5pbXBvcnQge2lzUHJlc2VudH0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7QmFzZUV4Y2VwdGlvbiwgV3JhcHBlZEV4Y2VwdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCB7U3ViamVjdH0gZnJvbSAncnhqcy9TdWJqZWN0JztcbmltcG9ydCB7UmVwbGF5U3ViamVjdH0gZnJvbSAncnhqcy9zdWJqZWN0cy9SZXBsYXlTdWJqZWN0JztcbmltcG9ydCAncnhqcy9vcGVyYXRvcnMvdGFrZSc7XG5cbi8qKlxuICpcbiAqIE1vY2sgQ29ubmVjdGlvbiB0byByZXByZXNlbnQgYSB7QGxpbmsgQ29ubmVjdGlvbn0gZm9yIHRlc3RzLlxuICpcbiAqKi9cbmV4cG9ydCBjbGFzcyBNb2NrQ29ubmVjdGlvbiBpbXBsZW1lbnRzIENvbm5lY3Rpb24ge1xuICAvLyBUT0RPIE5hbWUgYHJlYWR5U3RhdGVgIHNob3VsZCBjaGFuZ2UgdG8gYmUgbW9yZSBnZW5lcmljLCBhbmQgc3RhdGVzIGNvdWxkIGJlIG1hZGUgdG8gYmUgbW9yZVxuICAvLyBkZXNjcmlwdGl2ZSB0aGFuIFhIUiBzdGF0ZXMuXG4gIC8qKlxuICAgKiBEZXNjcmliZXMgdGhlIHN0YXRlIG9mIHRoZSBjb25uZWN0aW9uLCBiYXNlZCBvbiBgWE1MSHR0cFJlcXVlc3QucmVhZHlTdGF0ZWAsIGJ1dCB3aXRoXG4gICAqIGFkZGl0aW9uYWwgc3RhdGVzLiBGb3IgZXhhbXBsZSwgc3RhdGUgNSBpbmRpY2F0ZXMgYW4gYWJvcnRlZCBjb25uZWN0aW9uLlxuICAgKi9cbiAgcmVhZHlTdGF0ZTogUmVhZHlTdGF0ZTtcblxuICAvKipcbiAgICoge0BsaW5rIFJlcXVlc3R9IGluc3RhbmNlIHVzZWQgdG8gY3JlYXRlIHRoZSBjb25uZWN0aW9uLlxuICAgKi9cbiAgcmVxdWVzdDogUmVxdWVzdDtcblxuICAvKipcbiAgICoge0BsaW5rIEV2ZW50RW1pdHRlcn0gb2Yge0BsaW5rIFJlc3BvbnNlfS4gQ2FuIGJlIHN1YnNjcmliZWQgdG8gaW4gb3JkZXIgdG8gYmUgbm90aWZpZWQgd2hlbiBhXG4gICAqIHJlc3BvbnNlIGlzIGF2YWlsYWJsZS5cbiAgICovXG4gIHJlc3BvbnNlOiBhbnk7ICAvLyBTdWJqZWN0PFJlc3BvbnNlPlxuXG4gIGNvbnN0cnVjdG9yKHJlcTogUmVxdWVzdCkge1xuICAgIHRoaXMucmVzcG9uc2UgPSBuZXcgUmVwbGF5U3ViamVjdCgxKS50YWtlKDEpO1xuICAgIHRoaXMucmVhZHlTdGF0ZSA9IFJlYWR5U3RhdGUuT3BlbjtcbiAgICB0aGlzLnJlcXVlc3QgPSByZXE7XG4gIH1cblxuICAvKipcbiAgICogU2VuZHMgYSBtb2NrIHJlc3BvbnNlIHRvIHRoZSBjb25uZWN0aW9uLiBUaGlzIHJlc3BvbnNlIGlzIHRoZSB2YWx1ZSB0aGF0IGlzIGVtaXR0ZWQgdG8gdGhlXG4gICAqIHtAbGluayBFdmVudEVtaXR0ZXJ9IHJldHVybmVkIGJ5IHtAbGluayBIdHRwfS5cbiAgICpcbiAgICogIyMjIEV4YW1wbGVcbiAgICpcbiAgICogYGBgXG4gICAqIHZhciBjb25uZWN0aW9uO1xuICAgKiBiYWNrZW5kLmNvbm5lY3Rpb25zLnN1YnNjcmliZShjID0+IGNvbm5lY3Rpb24gPSBjKTtcbiAgICogaHR0cC5yZXF1ZXN0KCdkYXRhLmpzb24nKS5zdWJzY3JpYmUocmVzID0+IGNvbnNvbGUubG9nKHJlcy50ZXh0KCkpKTtcbiAgICogY29ubmVjdGlvbi5tb2NrUmVzcG9uZChuZXcgUmVzcG9uc2UoJ2Zha2UgcmVzcG9uc2UnKSk7IC8vbG9ncyAnZmFrZSByZXNwb25zZSdcbiAgICogYGBgXG4gICAqXG4gICAqL1xuICBtb2NrUmVzcG9uZChyZXM6IFJlc3BvbnNlKSB7XG4gICAgaWYgKHRoaXMucmVhZHlTdGF0ZSA9PT0gUmVhZHlTdGF0ZS5Eb25lIHx8IHRoaXMucmVhZHlTdGF0ZSA9PT0gUmVhZHlTdGF0ZS5DYW5jZWxsZWQpIHtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKCdDb25uZWN0aW9uIGhhcyBhbHJlYWR5IGJlZW4gcmVzb2x2ZWQnKTtcbiAgICB9XG4gICAgdGhpcy5yZWFkeVN0YXRlID0gUmVhZHlTdGF0ZS5Eb25lO1xuICAgIHRoaXMucmVzcG9uc2UubmV4dChyZXMpO1xuICAgIHRoaXMucmVzcG9uc2UuY29tcGxldGUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBOb3QgeWV0IGltcGxlbWVudGVkIVxuICAgKlxuICAgKiBTZW5kcyB0aGUgcHJvdmlkZWQge0BsaW5rIFJlc3BvbnNlfSB0byB0aGUgYGRvd25sb2FkT2JzZXJ2ZXJgIG9mIHRoZSBgUmVxdWVzdGBcbiAgICogYXNzb2NpYXRlZCB3aXRoIHRoaXMgY29ubmVjdGlvbi5cbiAgICovXG4gIG1vY2tEb3dubG9hZChyZXM6IFJlc3BvbnNlKSB7XG4gICAgLy8gdGhpcy5yZXF1ZXN0LmRvd25sb2FkT2JzZXJ2ZXIub25OZXh0KHJlcyk7XG4gICAgLy8gaWYgKHJlcy5ieXRlc0xvYWRlZCA9PT0gcmVzLnRvdGFsQnl0ZXMpIHtcbiAgICAvLyAgIHRoaXMucmVxdWVzdC5kb3dubG9hZE9ic2VydmVyLm9uQ29tcGxldGVkKCk7XG4gICAgLy8gfVxuICB9XG5cbiAgLy8gVE9ETyhqZWZmYmNyb3NzKTogY29uc2lkZXIgdXNpbmcgUmVzcG9uc2UgdHlwZVxuICAvKipcbiAgICogRW1pdHMgdGhlIHByb3ZpZGVkIGVycm9yIG9iamVjdCBhcyBhbiBlcnJvciB0byB0aGUge0BsaW5rIFJlc3BvbnNlfSB7QGxpbmsgRXZlbnRFbWl0dGVyfVxuICAgKiByZXR1cm5lZFxuICAgKiBmcm9tIHtAbGluayBIdHRwfS5cbiAgICovXG4gIG1vY2tFcnJvcihlcnI/OiBFcnJvcikge1xuICAgIC8vIE1hdGNoZXMgWEhSIHNlbWFudGljc1xuICAgIHRoaXMucmVhZHlTdGF0ZSA9IFJlYWR5U3RhdGUuRG9uZTtcbiAgICB0aGlzLnJlc3BvbnNlLmVycm9yKGVycik7XG4gIH1cbn1cblxuLyoqXG4gKiBBIG1vY2sgYmFja2VuZCBmb3IgdGVzdGluZyB0aGUge0BsaW5rIEh0dHB9IHNlcnZpY2UuXG4gKlxuICogVGhpcyBjbGFzcyBjYW4gYmUgaW5qZWN0ZWQgaW4gdGVzdHMsIGFuZCBzaG91bGQgYmUgdXNlZCB0byBvdmVycmlkZSBwcm92aWRlcnNcbiAqIHRvIG90aGVyIGJhY2tlbmRzLCBzdWNoIGFzIHtAbGluayBYSFJCYWNrZW5kfS5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIGBgYFxuICogaW1wb3J0IHtEZWZhdWx0T3B0aW9ucywgSHR0cH0gZnJvbSAnYW5ndWxhcjIvaHR0cCc7XG4gKiBpbXBvcnQge01vY2tCYWNrZW5kfSBmcm9tICdhbmd1bGFyMi9odHRwL3Rlc3RpbmcnO1xuICogaXQoJ3Nob3VsZCBnZXQgc29tZSBkYXRhJywgaW5qZWN0KFtBc3luY1Rlc3RDb21wbGV0ZXJdLCAoYXN5bmMpID0+IHtcbiAqICAgdmFyIGNvbm5lY3Rpb247XG4gKiAgIHZhciBpbmplY3RvciA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW1xuICogICAgIE1vY2tCYWNrZW5kLFxuICogICAgIHByb3ZpZGUoSHR0cCwge3VzZUZhY3Rvcnk6IChiYWNrZW5kLCBkZWZhdWx0T3B0aW9ucykgPT4ge1xuICogICAgICAgcmV0dXJuIG5ldyBIdHRwKGJhY2tlbmQsIGRlZmF1bHRPcHRpb25zKVxuICogICAgIH0sIGRlcHM6IFtNb2NrQmFja2VuZCwgRGVmYXVsdE9wdGlvbnNdfSldKTtcbiAqICAgdmFyIGh0dHAgPSBpbmplY3Rvci5nZXQoSHR0cCk7XG4gKiAgIHZhciBiYWNrZW5kID0gaW5qZWN0b3IuZ2V0KE1vY2tCYWNrZW5kKTtcbiAqICAgLy9Bc3NpZ24gYW55IG5ld2x5LWNyZWF0ZWQgY29ubmVjdGlvbiB0byBsb2NhbCB2YXJpYWJsZVxuICogICBiYWNrZW5kLmNvbm5lY3Rpb25zLnN1YnNjcmliZShjID0+IGNvbm5lY3Rpb24gPSBjKTtcbiAqICAgaHR0cC5yZXF1ZXN0KCdkYXRhLmpzb24nKS5zdWJzY3JpYmUoKHJlcykgPT4ge1xuICogICAgIGV4cGVjdChyZXMudGV4dCgpKS50b0JlKCdhd2Vzb21lJyk7XG4gKiAgICAgYXN5bmMuZG9uZSgpO1xuICogICB9KTtcbiAqICAgY29ubmVjdGlvbi5tb2NrUmVzcG9uZChuZXcgUmVzcG9uc2UoJ2F3ZXNvbWUnKSk7XG4gKiB9KSk7XG4gKiBgYGBcbiAqXG4gKiBUaGlzIG1ldGhvZCBvbmx5IGV4aXN0cyBpbiB0aGUgbW9jayBpbXBsZW1lbnRhdGlvbiwgbm90IGluIHJlYWwgQmFja2VuZHMuXG4gKiovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgTW9ja0JhY2tlbmQgaW1wbGVtZW50cyBDb25uZWN0aW9uQmFja2VuZCB7XG4gIC8qKlxuICAgKiB7QGxpbmsgRXZlbnRFbWl0dGVyfVxuICAgKiBvZiB7QGxpbmsgTW9ja0Nvbm5lY3Rpb259IGluc3RhbmNlcyB0aGF0IGhhdmUgYmVlbiBjcmVhdGVkIGJ5IHRoaXMgYmFja2VuZC4gQ2FuIGJlIHN1YnNjcmliZWRcbiAgICogdG8gaW4gb3JkZXIgdG8gcmVzcG9uZCB0byBjb25uZWN0aW9ucy5cbiAgICpcbiAgICogIyMjIEV4YW1wbGVcbiAgICpcbiAgICogYGBgXG4gICAqIGltcG9ydCB7TW9ja0JhY2tlbmQsIEh0dHAsIEJhc2VSZXF1ZXN0T3B0aW9uc30gZnJvbSAnYW5ndWxhcjIvaHR0cCc7XG4gICAqIGltcG9ydCB7SW5qZWN0b3J9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuICAgKlxuICAgKiBpdCgnc2hvdWxkIGdldCBhIHJlc3BvbnNlJywgKCkgPT4ge1xuICAgKiAgIHZhciBjb25uZWN0aW9uOyAvL3RoaXMgd2lsbCBiZSBzZXQgd2hlbiBhIG5ldyBjb25uZWN0aW9uIGlzIGVtaXR0ZWQgZnJvbSB0aGUgYmFja2VuZC5cbiAgICogICB2YXIgdGV4dDsgLy90aGlzIHdpbGwgYmUgc2V0IGZyb20gbW9jayByZXNwb25zZVxuICAgKiAgIHZhciBpbmplY3RvciA9IEluamVjdG9yLnJlc29sdmVBbmRDcmVhdGUoW1xuICAgKiAgICAgTW9ja0JhY2tlbmQsXG4gICAqICAgICBwcm92aWRlKEh0dHAsIHt1c2VGYWN0b3J5OiAoYmFja2VuZCwgb3B0aW9ucykge1xuICAgKiAgICAgICByZXR1cm4gbmV3IEh0dHAoYmFja2VuZCwgb3B0aW9ucyk7XG4gICAqICAgICB9LCBkZXBzOiBbTW9ja0JhY2tlbmQsIEJhc2VSZXF1ZXN0T3B0aW9uc119XSk7XG4gICAqICAgdmFyIGJhY2tlbmQgPSBpbmplY3Rvci5nZXQoTW9ja0JhY2tlbmQpO1xuICAgKiAgIHZhciBodHRwID0gaW5qZWN0b3IuZ2V0KEh0dHApO1xuICAgKiAgIGJhY2tlbmQuY29ubmVjdGlvbnMuc3Vic2NyaWJlKGMgPT4gY29ubmVjdGlvbiA9IGMpO1xuICAgKiAgIGh0dHAucmVxdWVzdCgnc29tZXRoaW5nLmpzb24nKS5zdWJzY3JpYmUocmVzID0+IHtcbiAgICogICAgIHRleHQgPSByZXMudGV4dCgpO1xuICAgKiAgIH0pO1xuICAgKiAgIGNvbm5lY3Rpb24ubW9ja1Jlc3BvbmQobmV3IFJlc3BvbnNlKHtib2R5OiAnU29tZXRoaW5nJ30pKTtcbiAgICogICBleHBlY3QodGV4dCkudG9CZSgnU29tZXRoaW5nJyk7XG4gICAqIH0pO1xuICAgKiBgYGBcbiAgICpcbiAgICogVGhpcyBwcm9wZXJ0eSBvbmx5IGV4aXN0cyBpbiB0aGUgbW9jayBpbXBsZW1lbnRhdGlvbiwgbm90IGluIHJlYWwgQmFja2VuZHMuXG4gICAqL1xuICBjb25uZWN0aW9uczogYW55OyAgLy88TW9ja0Nvbm5lY3Rpb24+XG5cbiAgLyoqXG4gICAqIEFuIGFycmF5IHJlcHJlc2VudGF0aW9uIG9mIGBjb25uZWN0aW9uc2AuIFRoaXMgYXJyYXkgd2lsbCBiZSB1cGRhdGVkIHdpdGggZWFjaCBjb25uZWN0aW9uIHRoYXRcbiAgICogaXMgY3JlYXRlZCBieSB0aGlzIGJhY2tlbmQuXG4gICAqXG4gICAqIFRoaXMgcHJvcGVydHkgb25seSBleGlzdHMgaW4gdGhlIG1vY2sgaW1wbGVtZW50YXRpb24sIG5vdCBpbiByZWFsIEJhY2tlbmRzLlxuICAgKi9cbiAgY29ubmVjdGlvbnNBcnJheTogTW9ja0Nvbm5lY3Rpb25bXTtcbiAgLyoqXG4gICAqIHtAbGluayBFdmVudEVtaXR0ZXJ9IG9mIHtAbGluayBNb2NrQ29ubmVjdGlvbn0gaW5zdGFuY2VzIHRoYXQgaGF2ZW4ndCB5ZXQgYmVlbiByZXNvbHZlZCAoaS5lLlxuICAgKiB3aXRoIGEgYHJlYWR5U3RhdGVgXG4gICAqIGxlc3MgdGhhbiA0KS4gVXNlZCBpbnRlcm5hbGx5IHRvIHZlcmlmeSB0aGF0IG5vIGNvbm5lY3Rpb25zIGFyZSBwZW5kaW5nIHZpYSB0aGVcbiAgICogYHZlcmlmeU5vUGVuZGluZ1JlcXVlc3RzYCBtZXRob2QuXG4gICAqXG4gICAqIFRoaXMgcHJvcGVydHkgb25seSBleGlzdHMgaW4gdGhlIG1vY2sgaW1wbGVtZW50YXRpb24sIG5vdCBpbiByZWFsIEJhY2tlbmRzLlxuICAgKi9cbiAgcGVuZGluZ0Nvbm5lY3Rpb25zOiBhbnk7ICAvLyBTdWJqZWN0PE1vY2tDb25uZWN0aW9uPlxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmNvbm5lY3Rpb25zQXJyYXkgPSBbXTtcbiAgICB0aGlzLmNvbm5lY3Rpb25zID0gbmV3IFN1YmplY3QoKTtcbiAgICB0aGlzLmNvbm5lY3Rpb25zLnN1YnNjcmliZShjb25uZWN0aW9uID0+IHRoaXMuY29ubmVjdGlvbnNBcnJheS5wdXNoKGNvbm5lY3Rpb24pKTtcbiAgICB0aGlzLnBlbmRpbmdDb25uZWN0aW9ucyA9IG5ldyBTdWJqZWN0KCk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIGFsbCBjb25uZWN0aW9ucywgYW5kIHJhaXNlcyBhbiBleGNlcHRpb24gaWYgYW55IGNvbm5lY3Rpb24gaGFzIG5vdCByZWNlaXZlZCBhIHJlc3BvbnNlLlxuICAgKlxuICAgKiBUaGlzIG1ldGhvZCBvbmx5IGV4aXN0cyBpbiB0aGUgbW9jayBpbXBsZW1lbnRhdGlvbiwgbm90IGluIHJlYWwgQmFja2VuZHMuXG4gICAqL1xuICB2ZXJpZnlOb1BlbmRpbmdSZXF1ZXN0cygpIHtcbiAgICBsZXQgcGVuZGluZyA9IDA7XG4gICAgdGhpcy5wZW5kaW5nQ29ubmVjdGlvbnMuc3Vic2NyaWJlKGMgPT4gcGVuZGluZysrKTtcbiAgICBpZiAocGVuZGluZyA+IDApIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKGAke3BlbmRpbmd9IHBlbmRpbmcgY29ubmVjdGlvbnMgdG8gYmUgcmVzb2x2ZWRgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYW4gYmUgdXNlZCBpbiBjb25qdW5jdGlvbiB3aXRoIGB2ZXJpZnlOb1BlbmRpbmdSZXF1ZXN0c2AgdG8gcmVzb2x2ZSBhbnkgbm90LXlldC1yZXNvbHZlXG4gICAqIGNvbm5lY3Rpb25zLCBpZiBpdCdzIGV4cGVjdGVkIHRoYXQgdGhlcmUgYXJlIGNvbm5lY3Rpb25zIHRoYXQgaGF2ZSBub3QgeWV0IHJlY2VpdmVkIGEgcmVzcG9uc2UuXG4gICAqXG4gICAqIFRoaXMgbWV0aG9kIG9ubHkgZXhpc3RzIGluIHRoZSBtb2NrIGltcGxlbWVudGF0aW9uLCBub3QgaW4gcmVhbCBCYWNrZW5kcy5cbiAgICovXG4gIHJlc29sdmVBbGxDb25uZWN0aW9ucygpIHsgdGhpcy5jb25uZWN0aW9ucy5zdWJzY3JpYmUoYyA9PiBjLnJlYWR5U3RhdGUgPSA0KTsgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IHtAbGluayBNb2NrQ29ubmVjdGlvbn0uIFRoaXMgaXMgZXF1aXZhbGVudCB0byBjYWxsaW5nIGBuZXdcbiAgICogTW9ja0Nvbm5lY3Rpb24oKWAsIGV4Y2VwdCB0aGF0IGl0IGFsc28gd2lsbCBlbWl0IHRoZSBuZXcgYENvbm5lY3Rpb25gIHRvIHRoZSBgY29ubmVjdGlvbnNgXG4gICAqIGVtaXR0ZXIgb2YgdGhpcyBgTW9ja0JhY2tlbmRgIGluc3RhbmNlLiBUaGlzIG1ldGhvZCB3aWxsIHVzdWFsbHkgb25seSBiZSB1c2VkIGJ5IHRlc3RzXG4gICAqIGFnYWluc3QgdGhlIGZyYW1ld29yayBpdHNlbGYsIG5vdCBieSBlbmQtdXNlcnMuXG4gICAqL1xuICBjcmVhdGVDb25uZWN0aW9uKHJlcTogUmVxdWVzdCk6IENvbm5lY3Rpb24ge1xuICAgIGlmICghaXNQcmVzZW50KHJlcSkgfHwgIShyZXEgaW5zdGFuY2VvZiBSZXF1ZXN0KSkge1xuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oYGNyZWF0ZUNvbm5lY3Rpb24gcmVxdWlyZXMgYW4gaW5zdGFuY2Ugb2YgUmVxdWVzdCwgZ290ICR7cmVxfWApO1xuICAgIH1cbiAgICBsZXQgY29ubmVjdGlvbiA9IG5ldyBNb2NrQ29ubmVjdGlvbihyZXEpO1xuICAgIHRoaXMuY29ubmVjdGlvbnMubmV4dChjb25uZWN0aW9uKTtcbiAgICByZXR1cm4gY29ubmVjdGlvbjtcbiAgfVxufVxuIl19