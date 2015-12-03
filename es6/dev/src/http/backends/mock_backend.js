var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
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
import { Injectable } from 'angular2/core';
import { Request } from '../static_request';
import { ReadyStates } from '../enums';
import { isPresent } from 'angular2/src/facade/lang';
import { BaseException } from 'angular2/src/facade/exceptions';
import { Subject } from 'rxjs/Subject';
import { ReplaySubject } from 'rxjs/subjects/ReplaySubject';
import 'rxjs/operators/take';
/**
 *
 * Mock Connection to represent a {@link Connection} for tests.
 *
 **/
export class MockConnection {
    constructor(req) {
        this.response = new ReplaySubject(1).take(1);
        this.readyState = ReadyStates.Open;
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
    mockRespond(res) {
        if (this.readyState === ReadyStates.Done || this.readyState === ReadyStates.Cancelled) {
            throw new BaseException('Connection has already been resolved');
        }
        this.readyState = ReadyStates.Done;
        this.response.next(res);
        this.response.complete();
    }
    /**
     * Not yet implemented!
     *
     * Sends the provided {@link Response} to the `downloadObserver` of the `Request`
     * associated with this connection.
     */
    mockDownload(res) {
        // this.request.downloadObserver.onNext(res);
        // if (res.bytesLoaded === res.totalBytes) {
        //   this.request.downloadObserver.onCompleted();
        // }
    }
    // TODO(jeffbcross): consider using Response type
    /**
     * Emits the provided error object as an error to the {@link Response} {@link EventEmitter}
     * returned
     * from {@link Http}.
     */
    mockError(err) {
        // Matches XHR semantics
        this.readyState = ReadyStates.Done;
        this.response.error(err);
    }
}
/**
 * A mock backend for testing the {@link Http} service.
 *
 * This class can be injected in tests, and should be used to override providers
 * to other backends, such as {@link XHRBackend}.
 *
 * ### Example
 *
 * ```
 * import {MockBackend, DefaultOptions, Http} from 'angular2/http';
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
export let MockBackend = class {
    constructor() {
        this.connectionsArray = [];
        this.connections = new Subject();
        this.connections.subscribe(connection => this.connectionsArray.push(connection));
        this.pendingConnections = new Subject();
    }
    /**
     * Checks all connections, and raises an exception if any connection has not received a response.
     *
     * This method only exists in the mock implementation, not in real Backends.
     */
    verifyNoPendingRequests() {
        let pending = 0;
        this.pendingConnections.subscribe(c => pending++);
        if (pending > 0)
            throw new BaseException(`${pending} pending connections to be resolved`);
    }
    /**
     * Can be used in conjunction with `verifyNoPendingRequests` to resolve any not-yet-resolve
     * connections, if it's expected that there are connections that have not yet received a response.
     *
     * This method only exists in the mock implementation, not in real Backends.
     */
    resolveAllConnections() { this.connections.subscribe(c => c.readyState = 4); }
    /**
     * Creates a new {@link MockConnection}. This is equivalent to calling `new
     * MockConnection()`, except that it also will emit the new `Connection` to the `connections`
     * emitter of this `MockBackend` instance. This method will usually only be used by tests
     * against the framework itself, not by end-users.
     */
    createConnection(req) {
        if (!isPresent(req) || !(req instanceof Request)) {
            throw new BaseException(`createConnection requires an instance of Request, got ${req}`);
        }
        let connection = new MockConnection(req);
        this.connections.next(connection);
        return connection;
    }
};
MockBackend = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [])
], MockBackend);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9ja19iYWNrZW5kLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2h0dHAvYmFja2VuZHMvbW9ja19iYWNrZW5kLnRzIl0sIm5hbWVzIjpbIk1vY2tDb25uZWN0aW9uIiwiTW9ja0Nvbm5lY3Rpb24uY29uc3RydWN0b3IiLCJNb2NrQ29ubmVjdGlvbi5tb2NrUmVzcG9uZCIsIk1vY2tDb25uZWN0aW9uLm1vY2tEb3dubG9hZCIsIk1vY2tDb25uZWN0aW9uLm1vY2tFcnJvciIsIk1vY2tCYWNrZW5kIiwiTW9ja0JhY2tlbmQuY29uc3RydWN0b3IiLCJNb2NrQmFja2VuZC52ZXJpZnlOb1BlbmRpbmdSZXF1ZXN0cyIsIk1vY2tCYWNrZW5kLnJlc29sdmVBbGxDb25uZWN0aW9ucyIsIk1vY2tCYWNrZW5kLmNyZWF0ZUNvbm5lY3Rpb24iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O09BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxlQUFlO09BQ2pDLEVBQUMsT0FBTyxFQUFDLE1BQU0sbUJBQW1CO09BRWxDLEVBQUMsV0FBVyxFQUFDLE1BQU0sVUFBVTtPQUU3QixFQUFDLFNBQVMsRUFBQyxNQUFNLDBCQUEwQjtPQUMzQyxFQUFDLGFBQWEsRUFBbUIsTUFBTSxnQ0FBZ0M7T0FDdkUsRUFBQyxPQUFPLEVBQUMsTUFBTSxjQUFjO09BQzdCLEVBQUMsYUFBYSxFQUFDLE1BQU0sNkJBQTZCO09BQ2xELHFCQUFxQjtBQUU1Qjs7OztJQUlJO0FBQ0o7SUFvQkVBLFlBQVlBLEdBQVlBO1FBQ3RCQyxJQUFJQSxDQUFDQSxRQUFRQSxHQUFHQSxJQUFJQSxhQUFhQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUM3Q0EsSUFBSUEsQ0FBQ0EsVUFBVUEsR0FBR0EsV0FBV0EsQ0FBQ0EsSUFBSUEsQ0FBQ0E7UUFDbkNBLElBQUlBLENBQUNBLE9BQU9BLEdBQUdBLEdBQUdBLENBQUNBO0lBQ3JCQSxD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LENBQUNBLFdBQVdBLENBQUNBLElBQUlBLENBQUNBLFVBQVVBLENBQUNBLENBQUNBO1FBQ2xDQSxNQUFNQSxDQUFDQSxVQUFVQSxDQUFDQTtJQUNwQkEsQ0FBQ0E7QUFDSEosQ0FBQ0E7QUE1RkQ7SUFBQyxVQUFVLEVBQUU7O2dCQTRGWjtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmltcG9ydCB7UmVxdWVzdH0gZnJvbSAnLi4vc3RhdGljX3JlcXVlc3QnO1xuaW1wb3J0IHtSZXNwb25zZX0gZnJvbSAnLi4vc3RhdGljX3Jlc3BvbnNlJztcbmltcG9ydCB7UmVhZHlTdGF0ZXN9IGZyb20gJy4uL2VudW1zJztcbmltcG9ydCB7Q29ubmVjdGlvbiwgQ29ubmVjdGlvbkJhY2tlbmR9IGZyb20gJy4uL2ludGVyZmFjZXMnO1xuaW1wb3J0IHtpc1ByZXNlbnR9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0Jhc2VFeGNlcHRpb24sIFdyYXBwZWRFeGNlcHRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge1N1YmplY3R9IGZyb20gJ3J4anMvU3ViamVjdCc7XG5pbXBvcnQge1JlcGxheVN1YmplY3R9IGZyb20gJ3J4anMvc3ViamVjdHMvUmVwbGF5U3ViamVjdCc7XG5pbXBvcnQgJ3J4anMvb3BlcmF0b3JzL3Rha2UnO1xuXG4vKipcbiAqXG4gKiBNb2NrIENvbm5lY3Rpb24gdG8gcmVwcmVzZW50IGEge0BsaW5rIENvbm5lY3Rpb259IGZvciB0ZXN0cy5cbiAqXG4gKiovXG5leHBvcnQgY2xhc3MgTW9ja0Nvbm5lY3Rpb24gaW1wbGVtZW50cyBDb25uZWN0aW9uIHtcbiAgLy8gVE9ETyBOYW1lIGByZWFkeVN0YXRlYCBzaG91bGQgY2hhbmdlIHRvIGJlIG1vcmUgZ2VuZXJpYywgYW5kIHN0YXRlcyBjb3VsZCBiZSBtYWRlIHRvIGJlIG1vcmVcbiAgLy8gZGVzY3JpcHRpdmUgdGhhbiBYSFIgc3RhdGVzLlxuICAvKipcbiAgICogRGVzY3JpYmVzIHRoZSBzdGF0ZSBvZiB0aGUgY29ubmVjdGlvbiwgYmFzZWQgb24gYFhNTEh0dHBSZXF1ZXN0LnJlYWR5U3RhdGVgLCBidXQgd2l0aFxuICAgKiBhZGRpdGlvbmFsIHN0YXRlcy4gRm9yIGV4YW1wbGUsIHN0YXRlIDUgaW5kaWNhdGVzIGFuIGFib3J0ZWQgY29ubmVjdGlvbi5cbiAgICovXG4gIHJlYWR5U3RhdGU6IFJlYWR5U3RhdGVzO1xuXG4gIC8qKlxuICAgKiB7QGxpbmsgUmVxdWVzdH0gaW5zdGFuY2UgdXNlZCB0byBjcmVhdGUgdGhlIGNvbm5lY3Rpb24uXG4gICAqL1xuICByZXF1ZXN0OiBSZXF1ZXN0O1xuXG4gIC8qKlxuICAgKiB7QGxpbmsgRXZlbnRFbWl0dGVyfSBvZiB7QGxpbmsgUmVzcG9uc2V9LiBDYW4gYmUgc3Vic2NyaWJlZCB0byBpbiBvcmRlciB0byBiZSBub3RpZmllZCB3aGVuIGFcbiAgICogcmVzcG9uc2UgaXMgYXZhaWxhYmxlLlxuICAgKi9cbiAgcmVzcG9uc2U6IGFueTsgIC8vIFN1YmplY3Q8UmVzcG9uc2U+XG5cbiAgY29uc3RydWN0b3IocmVxOiBSZXF1ZXN0KSB7XG4gICAgdGhpcy5yZXNwb25zZSA9IG5ldyBSZXBsYXlTdWJqZWN0KDEpLnRha2UoMSk7XG4gICAgdGhpcy5yZWFkeVN0YXRlID0gUmVhZHlTdGF0ZXMuT3BlbjtcbiAgICB0aGlzLnJlcXVlc3QgPSByZXE7XG4gIH1cblxuICAvKipcbiAgICogU2VuZHMgYSBtb2NrIHJlc3BvbnNlIHRvIHRoZSBjb25uZWN0aW9uLiBUaGlzIHJlc3BvbnNlIGlzIHRoZSB2YWx1ZSB0aGF0IGlzIGVtaXR0ZWQgdG8gdGhlXG4gICAqIHtAbGluayBFdmVudEVtaXR0ZXJ9IHJldHVybmVkIGJ5IHtAbGluayBIdHRwfS5cbiAgICpcbiAgICogIyMjIEV4YW1wbGVcbiAgICpcbiAgICogYGBgXG4gICAqIHZhciBjb25uZWN0aW9uO1xuICAgKiBiYWNrZW5kLmNvbm5lY3Rpb25zLnN1YnNjcmliZShjID0+IGNvbm5lY3Rpb24gPSBjKTtcbiAgICogaHR0cC5yZXF1ZXN0KCdkYXRhLmpzb24nKS5zdWJzY3JpYmUocmVzID0+IGNvbnNvbGUubG9nKHJlcy50ZXh0KCkpKTtcbiAgICogY29ubmVjdGlvbi5tb2NrUmVzcG9uZChuZXcgUmVzcG9uc2UoJ2Zha2UgcmVzcG9uc2UnKSk7IC8vbG9ncyAnZmFrZSByZXNwb25zZSdcbiAgICogYGBgXG4gICAqXG4gICAqL1xuICBtb2NrUmVzcG9uZChyZXM6IFJlc3BvbnNlKSB7XG4gICAgaWYgKHRoaXMucmVhZHlTdGF0ZSA9PT0gUmVhZHlTdGF0ZXMuRG9uZSB8fCB0aGlzLnJlYWR5U3RhdGUgPT09IFJlYWR5U3RhdGVzLkNhbmNlbGxlZCkge1xuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oJ0Nvbm5lY3Rpb24gaGFzIGFscmVhZHkgYmVlbiByZXNvbHZlZCcpO1xuICAgIH1cbiAgICB0aGlzLnJlYWR5U3RhdGUgPSBSZWFkeVN0YXRlcy5Eb25lO1xuICAgIHRoaXMucmVzcG9uc2UubmV4dChyZXMpO1xuICAgIHRoaXMucmVzcG9uc2UuY29tcGxldGUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBOb3QgeWV0IGltcGxlbWVudGVkIVxuICAgKlxuICAgKiBTZW5kcyB0aGUgcHJvdmlkZWQge0BsaW5rIFJlc3BvbnNlfSB0byB0aGUgYGRvd25sb2FkT2JzZXJ2ZXJgIG9mIHRoZSBgUmVxdWVzdGBcbiAgICogYXNzb2NpYXRlZCB3aXRoIHRoaXMgY29ubmVjdGlvbi5cbiAgICovXG4gIG1vY2tEb3dubG9hZChyZXM6IFJlc3BvbnNlKSB7XG4gICAgLy8gdGhpcy5yZXF1ZXN0LmRvd25sb2FkT2JzZXJ2ZXIub25OZXh0KHJlcyk7XG4gICAgLy8gaWYgKHJlcy5ieXRlc0xvYWRlZCA9PT0gcmVzLnRvdGFsQnl0ZXMpIHtcbiAgICAvLyAgIHRoaXMucmVxdWVzdC5kb3dubG9hZE9ic2VydmVyLm9uQ29tcGxldGVkKCk7XG4gICAgLy8gfVxuICB9XG5cbiAgLy8gVE9ETyhqZWZmYmNyb3NzKTogY29uc2lkZXIgdXNpbmcgUmVzcG9uc2UgdHlwZVxuICAvKipcbiAgICogRW1pdHMgdGhlIHByb3ZpZGVkIGVycm9yIG9iamVjdCBhcyBhbiBlcnJvciB0byB0aGUge0BsaW5rIFJlc3BvbnNlfSB7QGxpbmsgRXZlbnRFbWl0dGVyfVxuICAgKiByZXR1cm5lZFxuICAgKiBmcm9tIHtAbGluayBIdHRwfS5cbiAgICovXG4gIG1vY2tFcnJvcihlcnI/OiBFcnJvcikge1xuICAgIC8vIE1hdGNoZXMgWEhSIHNlbWFudGljc1xuICAgIHRoaXMucmVhZHlTdGF0ZSA9IFJlYWR5U3RhdGVzLkRvbmU7XG4gICAgdGhpcy5yZXNwb25zZS5lcnJvcihlcnIpO1xuICB9XG59XG5cbi8qKlxuICogQSBtb2NrIGJhY2tlbmQgZm9yIHRlc3RpbmcgdGhlIHtAbGluayBIdHRwfSBzZXJ2aWNlLlxuICpcbiAqIFRoaXMgY2xhc3MgY2FuIGJlIGluamVjdGVkIGluIHRlc3RzLCBhbmQgc2hvdWxkIGJlIHVzZWQgdG8gb3ZlcnJpZGUgcHJvdmlkZXJzXG4gKiB0byBvdGhlciBiYWNrZW5kcywgc3VjaCBhcyB7QGxpbmsgWEhSQmFja2VuZH0uXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBgYGBcbiAqIGltcG9ydCB7TW9ja0JhY2tlbmQsIERlZmF1bHRPcHRpb25zLCBIdHRwfSBmcm9tICdhbmd1bGFyMi9odHRwJztcbiAqIGl0KCdzaG91bGQgZ2V0IHNvbWUgZGF0YScsIGluamVjdChbQXN5bmNUZXN0Q29tcGxldGVyXSwgKGFzeW5jKSA9PiB7XG4gKiAgIHZhciBjb25uZWN0aW9uO1xuICogICB2YXIgaW5qZWN0b3IgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtcbiAqICAgICBNb2NrQmFja2VuZCxcbiAqICAgICBwcm92aWRlKEh0dHAsIHt1c2VGYWN0b3J5OiAoYmFja2VuZCwgZGVmYXVsdE9wdGlvbnMpID0+IHtcbiAqICAgICAgIHJldHVybiBuZXcgSHR0cChiYWNrZW5kLCBkZWZhdWx0T3B0aW9ucylcbiAqICAgICB9LCBkZXBzOiBbTW9ja0JhY2tlbmQsIERlZmF1bHRPcHRpb25zXX0pXSk7XG4gKiAgIHZhciBodHRwID0gaW5qZWN0b3IuZ2V0KEh0dHApO1xuICogICB2YXIgYmFja2VuZCA9IGluamVjdG9yLmdldChNb2NrQmFja2VuZCk7XG4gKiAgIC8vQXNzaWduIGFueSBuZXdseS1jcmVhdGVkIGNvbm5lY3Rpb24gdG8gbG9jYWwgdmFyaWFibGVcbiAqICAgYmFja2VuZC5jb25uZWN0aW9ucy5zdWJzY3JpYmUoYyA9PiBjb25uZWN0aW9uID0gYyk7XG4gKiAgIGh0dHAucmVxdWVzdCgnZGF0YS5qc29uJykuc3Vic2NyaWJlKChyZXMpID0+IHtcbiAqICAgICBleHBlY3QocmVzLnRleHQoKSkudG9CZSgnYXdlc29tZScpO1xuICogICAgIGFzeW5jLmRvbmUoKTtcbiAqICAgfSk7XG4gKiAgIGNvbm5lY3Rpb24ubW9ja1Jlc3BvbmQobmV3IFJlc3BvbnNlKCdhd2Vzb21lJykpO1xuICogfSkpO1xuICogYGBgXG4gKlxuICogVGhpcyBtZXRob2Qgb25seSBleGlzdHMgaW4gdGhlIG1vY2sgaW1wbGVtZW50YXRpb24sIG5vdCBpbiByZWFsIEJhY2tlbmRzLlxuICoqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIE1vY2tCYWNrZW5kIGltcGxlbWVudHMgQ29ubmVjdGlvbkJhY2tlbmQge1xuICAvKipcbiAgICoge0BsaW5rIEV2ZW50RW1pdHRlcn1cbiAgICogb2Yge0BsaW5rIE1vY2tDb25uZWN0aW9ufSBpbnN0YW5jZXMgdGhhdCBoYXZlIGJlZW4gY3JlYXRlZCBieSB0aGlzIGJhY2tlbmQuIENhbiBiZSBzdWJzY3JpYmVkXG4gICAqIHRvIGluIG9yZGVyIHRvIHJlc3BvbmQgdG8gY29ubmVjdGlvbnMuXG4gICAqXG4gICAqICMjIyBFeGFtcGxlXG4gICAqXG4gICAqIGBgYFxuICAgKiBpbXBvcnQge01vY2tCYWNrZW5kLCBIdHRwLCBCYXNlUmVxdWVzdE9wdGlvbnN9IGZyb20gJ2FuZ3VsYXIyL2h0dHAnO1xuICAgKiBpbXBvcnQge0luamVjdG9yfSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbiAgICpcbiAgICogaXQoJ3Nob3VsZCBnZXQgYSByZXNwb25zZScsICgpID0+IHtcbiAgICogICB2YXIgY29ubmVjdGlvbjsgLy90aGlzIHdpbGwgYmUgc2V0IHdoZW4gYSBuZXcgY29ubmVjdGlvbiBpcyBlbWl0dGVkIGZyb20gdGhlIGJhY2tlbmQuXG4gICAqICAgdmFyIHRleHQ7IC8vdGhpcyB3aWxsIGJlIHNldCBmcm9tIG1vY2sgcmVzcG9uc2VcbiAgICogICB2YXIgaW5qZWN0b3IgPSBJbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlKFtcbiAgICogICAgIE1vY2tCYWNrZW5kLFxuICAgKiAgICAgcHJvdmlkZShIdHRwLCB7dXNlRmFjdG9yeTogKGJhY2tlbmQsIG9wdGlvbnMpIHtcbiAgICogICAgICAgcmV0dXJuIG5ldyBIdHRwKGJhY2tlbmQsIG9wdGlvbnMpO1xuICAgKiAgICAgfSwgZGVwczogW01vY2tCYWNrZW5kLCBCYXNlUmVxdWVzdE9wdGlvbnNdfV0pO1xuICAgKiAgIHZhciBiYWNrZW5kID0gaW5qZWN0b3IuZ2V0KE1vY2tCYWNrZW5kKTtcbiAgICogICB2YXIgaHR0cCA9IGluamVjdG9yLmdldChIdHRwKTtcbiAgICogICBiYWNrZW5kLmNvbm5lY3Rpb25zLnN1YnNjcmliZShjID0+IGNvbm5lY3Rpb24gPSBjKTtcbiAgICogICBodHRwLnJlcXVlc3QoJ3NvbWV0aGluZy5qc29uJykuc3Vic2NyaWJlKHJlcyA9PiB7XG4gICAqICAgICB0ZXh0ID0gcmVzLnRleHQoKTtcbiAgICogICB9KTtcbiAgICogICBjb25uZWN0aW9uLm1vY2tSZXNwb25kKG5ldyBSZXNwb25zZSh7Ym9keTogJ1NvbWV0aGluZyd9KSk7XG4gICAqICAgZXhwZWN0KHRleHQpLnRvQmUoJ1NvbWV0aGluZycpO1xuICAgKiB9KTtcbiAgICogYGBgXG4gICAqXG4gICAqIFRoaXMgcHJvcGVydHkgb25seSBleGlzdHMgaW4gdGhlIG1vY2sgaW1wbGVtZW50YXRpb24sIG5vdCBpbiByZWFsIEJhY2tlbmRzLlxuICAgKi9cbiAgY29ubmVjdGlvbnM6IGFueTsgIC8vPE1vY2tDb25uZWN0aW9uPlxuXG4gIC8qKlxuICAgKiBBbiBhcnJheSByZXByZXNlbnRhdGlvbiBvZiBgY29ubmVjdGlvbnNgLiBUaGlzIGFycmF5IHdpbGwgYmUgdXBkYXRlZCB3aXRoIGVhY2ggY29ubmVjdGlvbiB0aGF0XG4gICAqIGlzIGNyZWF0ZWQgYnkgdGhpcyBiYWNrZW5kLlxuICAgKlxuICAgKiBUaGlzIHByb3BlcnR5IG9ubHkgZXhpc3RzIGluIHRoZSBtb2NrIGltcGxlbWVudGF0aW9uLCBub3QgaW4gcmVhbCBCYWNrZW5kcy5cbiAgICovXG4gIGNvbm5lY3Rpb25zQXJyYXk6IE1vY2tDb25uZWN0aW9uW107XG4gIC8qKlxuICAgKiB7QGxpbmsgRXZlbnRFbWl0dGVyfSBvZiB7QGxpbmsgTW9ja0Nvbm5lY3Rpb259IGluc3RhbmNlcyB0aGF0IGhhdmVuJ3QgeWV0IGJlZW4gcmVzb2x2ZWQgKGkuZS5cbiAgICogd2l0aCBhIGByZWFkeVN0YXRlYFxuICAgKiBsZXNzIHRoYW4gNCkuIFVzZWQgaW50ZXJuYWxseSB0byB2ZXJpZnkgdGhhdCBubyBjb25uZWN0aW9ucyBhcmUgcGVuZGluZyB2aWEgdGhlXG4gICAqIGB2ZXJpZnlOb1BlbmRpbmdSZXF1ZXN0c2AgbWV0aG9kLlxuICAgKlxuICAgKiBUaGlzIHByb3BlcnR5IG9ubHkgZXhpc3RzIGluIHRoZSBtb2NrIGltcGxlbWVudGF0aW9uLCBub3QgaW4gcmVhbCBCYWNrZW5kcy5cbiAgICovXG4gIHBlbmRpbmdDb25uZWN0aW9uczogYW55OyAgLy8gU3ViamVjdDxNb2NrQ29ubmVjdGlvbj5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5jb25uZWN0aW9uc0FycmF5ID0gW107XG4gICAgdGhpcy5jb25uZWN0aW9ucyA9IG5ldyBTdWJqZWN0KCk7XG4gICAgdGhpcy5jb25uZWN0aW9ucy5zdWJzY3JpYmUoY29ubmVjdGlvbiA9PiB0aGlzLmNvbm5lY3Rpb25zQXJyYXkucHVzaChjb25uZWN0aW9uKSk7XG4gICAgdGhpcy5wZW5kaW5nQ29ubmVjdGlvbnMgPSBuZXcgU3ViamVjdCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyBhbGwgY29ubmVjdGlvbnMsIGFuZCByYWlzZXMgYW4gZXhjZXB0aW9uIGlmIGFueSBjb25uZWN0aW9uIGhhcyBub3QgcmVjZWl2ZWQgYSByZXNwb25zZS5cbiAgICpcbiAgICogVGhpcyBtZXRob2Qgb25seSBleGlzdHMgaW4gdGhlIG1vY2sgaW1wbGVtZW50YXRpb24sIG5vdCBpbiByZWFsIEJhY2tlbmRzLlxuICAgKi9cbiAgdmVyaWZ5Tm9QZW5kaW5nUmVxdWVzdHMoKSB7XG4gICAgbGV0IHBlbmRpbmcgPSAwO1xuICAgIHRoaXMucGVuZGluZ0Nvbm5lY3Rpb25zLnN1YnNjcmliZShjID0+IHBlbmRpbmcrKyk7XG4gICAgaWYgKHBlbmRpbmcgPiAwKSB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihgJHtwZW5kaW5nfSBwZW5kaW5nIGNvbm5lY3Rpb25zIHRvIGJlIHJlc29sdmVkYCk7XG4gIH1cblxuICAvKipcbiAgICogQ2FuIGJlIHVzZWQgaW4gY29uanVuY3Rpb24gd2l0aCBgdmVyaWZ5Tm9QZW5kaW5nUmVxdWVzdHNgIHRvIHJlc29sdmUgYW55IG5vdC15ZXQtcmVzb2x2ZVxuICAgKiBjb25uZWN0aW9ucywgaWYgaXQncyBleHBlY3RlZCB0aGF0IHRoZXJlIGFyZSBjb25uZWN0aW9ucyB0aGF0IGhhdmUgbm90IHlldCByZWNlaXZlZCBhIHJlc3BvbnNlLlxuICAgKlxuICAgKiBUaGlzIG1ldGhvZCBvbmx5IGV4aXN0cyBpbiB0aGUgbW9jayBpbXBsZW1lbnRhdGlvbiwgbm90IGluIHJlYWwgQmFja2VuZHMuXG4gICAqL1xuICByZXNvbHZlQWxsQ29ubmVjdGlvbnMoKSB7IHRoaXMuY29ubmVjdGlvbnMuc3Vic2NyaWJlKGMgPT4gYy5yZWFkeVN0YXRlID0gNCk7IH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyB7QGxpbmsgTW9ja0Nvbm5lY3Rpb259LiBUaGlzIGlzIGVxdWl2YWxlbnQgdG8gY2FsbGluZyBgbmV3XG4gICAqIE1vY2tDb25uZWN0aW9uKClgLCBleGNlcHQgdGhhdCBpdCBhbHNvIHdpbGwgZW1pdCB0aGUgbmV3IGBDb25uZWN0aW9uYCB0byB0aGUgYGNvbm5lY3Rpb25zYFxuICAgKiBlbWl0dGVyIG9mIHRoaXMgYE1vY2tCYWNrZW5kYCBpbnN0YW5jZS4gVGhpcyBtZXRob2Qgd2lsbCB1c3VhbGx5IG9ubHkgYmUgdXNlZCBieSB0ZXN0c1xuICAgKiBhZ2FpbnN0IHRoZSBmcmFtZXdvcmsgaXRzZWxmLCBub3QgYnkgZW5kLXVzZXJzLlxuICAgKi9cbiAgY3JlYXRlQ29ubmVjdGlvbihyZXE6IFJlcXVlc3QpOiBDb25uZWN0aW9uIHtcbiAgICBpZiAoIWlzUHJlc2VudChyZXEpIHx8ICEocmVxIGluc3RhbmNlb2YgUmVxdWVzdCkpIHtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKGBjcmVhdGVDb25uZWN0aW9uIHJlcXVpcmVzIGFuIGluc3RhbmNlIG9mIFJlcXVlc3QsIGdvdCAke3JlcX1gKTtcbiAgICB9XG4gICAgbGV0IGNvbm5lY3Rpb24gPSBuZXcgTW9ja0Nvbm5lY3Rpb24ocmVxKTtcbiAgICB0aGlzLmNvbm5lY3Rpb25zLm5leHQoY29ubmVjdGlvbik7XG4gICAgcmV0dXJuIGNvbm5lY3Rpb247XG4gIH1cbn1cbiJdfQ==