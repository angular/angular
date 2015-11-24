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
import { Injectable } from 'angular2/angular2';
import { Request } from '../static_request';
import { ReadyStates } from '../enums';
import { isPresent } from 'angular2/src/facade/lang';
import { BaseException } from 'angular2/src/facade/exceptions';
import { Subject, ReplaySubject } from '@reactivex/rxjs/dist/cjs/Rx';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9ja19iYWNrZW5kLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2h0dHAvYmFja2VuZHMvbW9ja19iYWNrZW5kLnRzIl0sIm5hbWVzIjpbIk1vY2tDb25uZWN0aW9uIiwiTW9ja0Nvbm5lY3Rpb24uY29uc3RydWN0b3IiLCJNb2NrQ29ubmVjdGlvbi5tb2NrUmVzcG9uZCIsIk1vY2tDb25uZWN0aW9uLm1vY2tEb3dubG9hZCIsIk1vY2tDb25uZWN0aW9uLm1vY2tFcnJvciIsIk1vY2tCYWNrZW5kIiwiTW9ja0JhY2tlbmQuY29uc3RydWN0b3IiLCJNb2NrQmFja2VuZC52ZXJpZnlOb1BlbmRpbmdSZXF1ZXN0cyIsIk1vY2tCYWNrZW5kLnJlc29sdmVBbGxDb25uZWN0aW9ucyIsIk1vY2tCYWNrZW5kLmNyZWF0ZUNvbm5lY3Rpb24iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O09BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxtQkFBbUI7T0FDckMsRUFBQyxPQUFPLEVBQUMsTUFBTSxtQkFBbUI7T0FFbEMsRUFBQyxXQUFXLEVBQUMsTUFBTSxVQUFVO09BRTdCLEVBQUMsU0FBUyxFQUFDLE1BQU0sMEJBQTBCO09BQzNDLEVBQUMsYUFBYSxFQUFtQixNQUFNLGdDQUFnQztPQUN2RSxFQUFDLE9BQU8sRUFBRSxhQUFhLEVBQUMsTUFBTSw2QkFBNkI7QUFFbEU7Ozs7SUFJSTtBQUNKO0lBb0JFQSxZQUFZQSxHQUFZQTtRQUN0QkMsSUFBSUEsQ0FBQ0EsUUFBUUEsR0FBR0EsSUFBSUEsYUFBYUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDN0NBLElBQUlBLENBQUNBLFVBQVVBLEdBQUdBLFdBQVdBLENBQUNBLElBQUlBLENBQUNBO1FBQ25DQSxJQUFJQSxDQUFDQSxPQUFPQSxHQUFHQSxHQUFHQSxDQUFDQTtJQUNyQkEsQ0FBQ0E7SUFFREQ7Ozs7Ozs7Ozs7Ozs7T0FhR0E7SUFD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QUFVQSxDQUFDQSxDQUFDQTtRQUNsQ0EsTUFBTUEsQ0FBQ0EsVUFBVUEsQ0FBQ0E7SUFDcEJBLENBQUNBO0FBQ0hKLENBQUNBO0FBNUZEO0lBQUMsVUFBVSxFQUFFOztnQkE0Rlo7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnYW5ndWxhcjIvYW5ndWxhcjInO1xuaW1wb3J0IHtSZXF1ZXN0fSBmcm9tICcuLi9zdGF0aWNfcmVxdWVzdCc7XG5pbXBvcnQge1Jlc3BvbnNlfSBmcm9tICcuLi9zdGF0aWNfcmVzcG9uc2UnO1xuaW1wb3J0IHtSZWFkeVN0YXRlc30gZnJvbSAnLi4vZW51bXMnO1xuaW1wb3J0IHtDb25uZWN0aW9uLCBDb25uZWN0aW9uQmFja2VuZH0gZnJvbSAnLi4vaW50ZXJmYWNlcyc7XG5pbXBvcnQge2lzUHJlc2VudH0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7QmFzZUV4Y2VwdGlvbiwgV3JhcHBlZEV4Y2VwdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCB7U3ViamVjdCwgUmVwbGF5U3ViamVjdH0gZnJvbSAnQHJlYWN0aXZleC9yeGpzL2Rpc3QvY2pzL1J4JztcblxuLyoqXG4gKlxuICogTW9jayBDb25uZWN0aW9uIHRvIHJlcHJlc2VudCBhIHtAbGluayBDb25uZWN0aW9ufSBmb3IgdGVzdHMuXG4gKlxuICoqL1xuZXhwb3J0IGNsYXNzIE1vY2tDb25uZWN0aW9uIGltcGxlbWVudHMgQ29ubmVjdGlvbiB7XG4gIC8vIFRPRE8gTmFtZSBgcmVhZHlTdGF0ZWAgc2hvdWxkIGNoYW5nZSB0byBiZSBtb3JlIGdlbmVyaWMsIGFuZCBzdGF0ZXMgY291bGQgYmUgbWFkZSB0byBiZSBtb3JlXG4gIC8vIGRlc2NyaXB0aXZlIHRoYW4gWEhSIHN0YXRlcy5cbiAgLyoqXG4gICAqIERlc2NyaWJlcyB0aGUgc3RhdGUgb2YgdGhlIGNvbm5lY3Rpb24sIGJhc2VkIG9uIGBYTUxIdHRwUmVxdWVzdC5yZWFkeVN0YXRlYCwgYnV0IHdpdGhcbiAgICogYWRkaXRpb25hbCBzdGF0ZXMuIEZvciBleGFtcGxlLCBzdGF0ZSA1IGluZGljYXRlcyBhbiBhYm9ydGVkIGNvbm5lY3Rpb24uXG4gICAqL1xuICByZWFkeVN0YXRlOiBSZWFkeVN0YXRlcztcblxuICAvKipcbiAgICoge0BsaW5rIFJlcXVlc3R9IGluc3RhbmNlIHVzZWQgdG8gY3JlYXRlIHRoZSBjb25uZWN0aW9uLlxuICAgKi9cbiAgcmVxdWVzdDogUmVxdWVzdDtcblxuICAvKipcbiAgICoge0BsaW5rIEV2ZW50RW1pdHRlcn0gb2Yge0BsaW5rIFJlc3BvbnNlfS4gQ2FuIGJlIHN1YnNjcmliZWQgdG8gaW4gb3JkZXIgdG8gYmUgbm90aWZpZWQgd2hlbiBhXG4gICAqIHJlc3BvbnNlIGlzIGF2YWlsYWJsZS5cbiAgICovXG4gIHJlc3BvbnNlOiBhbnk7ICAvLyBTdWJqZWN0PFJlc3BvbnNlPlxuXG4gIGNvbnN0cnVjdG9yKHJlcTogUmVxdWVzdCkge1xuICAgIHRoaXMucmVzcG9uc2UgPSBuZXcgUmVwbGF5U3ViamVjdCgxKS50YWtlKDEpO1xuICAgIHRoaXMucmVhZHlTdGF0ZSA9IFJlYWR5U3RhdGVzLk9wZW47XG4gICAgdGhpcy5yZXF1ZXN0ID0gcmVxO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlbmRzIGEgbW9jayByZXNwb25zZSB0byB0aGUgY29ubmVjdGlvbi4gVGhpcyByZXNwb25zZSBpcyB0aGUgdmFsdWUgdGhhdCBpcyBlbWl0dGVkIHRvIHRoZVxuICAgKiB7QGxpbmsgRXZlbnRFbWl0dGVyfSByZXR1cm5lZCBieSB7QGxpbmsgSHR0cH0uXG4gICAqXG4gICAqICMjIyBFeGFtcGxlXG4gICAqXG4gICAqIGBgYFxuICAgKiB2YXIgY29ubmVjdGlvbjtcbiAgICogYmFja2VuZC5jb25uZWN0aW9ucy5zdWJzY3JpYmUoYyA9PiBjb25uZWN0aW9uID0gYyk7XG4gICAqIGh0dHAucmVxdWVzdCgnZGF0YS5qc29uJykuc3Vic2NyaWJlKHJlcyA9PiBjb25zb2xlLmxvZyhyZXMudGV4dCgpKSk7XG4gICAqIGNvbm5lY3Rpb24ubW9ja1Jlc3BvbmQobmV3IFJlc3BvbnNlKCdmYWtlIHJlc3BvbnNlJykpOyAvL2xvZ3MgJ2Zha2UgcmVzcG9uc2UnXG4gICAqIGBgYFxuICAgKlxuICAgKi9cbiAgbW9ja1Jlc3BvbmQocmVzOiBSZXNwb25zZSkge1xuICAgIGlmICh0aGlzLnJlYWR5U3RhdGUgPT09IFJlYWR5U3RhdGVzLkRvbmUgfHwgdGhpcy5yZWFkeVN0YXRlID09PSBSZWFkeVN0YXRlcy5DYW5jZWxsZWQpIHtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKCdDb25uZWN0aW9uIGhhcyBhbHJlYWR5IGJlZW4gcmVzb2x2ZWQnKTtcbiAgICB9XG4gICAgdGhpcy5yZWFkeVN0YXRlID0gUmVhZHlTdGF0ZXMuRG9uZTtcbiAgICB0aGlzLnJlc3BvbnNlLm5leHQocmVzKTtcbiAgICB0aGlzLnJlc3BvbnNlLmNvbXBsZXRlKCk7XG4gIH1cblxuICAvKipcbiAgICogTm90IHlldCBpbXBsZW1lbnRlZCFcbiAgICpcbiAgICogU2VuZHMgdGhlIHByb3ZpZGVkIHtAbGluayBSZXNwb25zZX0gdG8gdGhlIGBkb3dubG9hZE9ic2VydmVyYCBvZiB0aGUgYFJlcXVlc3RgXG4gICAqIGFzc29jaWF0ZWQgd2l0aCB0aGlzIGNvbm5lY3Rpb24uXG4gICAqL1xuICBtb2NrRG93bmxvYWQocmVzOiBSZXNwb25zZSkge1xuICAgIC8vIHRoaXMucmVxdWVzdC5kb3dubG9hZE9ic2VydmVyLm9uTmV4dChyZXMpO1xuICAgIC8vIGlmIChyZXMuYnl0ZXNMb2FkZWQgPT09IHJlcy50b3RhbEJ5dGVzKSB7XG4gICAgLy8gICB0aGlzLnJlcXVlc3QuZG93bmxvYWRPYnNlcnZlci5vbkNvbXBsZXRlZCgpO1xuICAgIC8vIH1cbiAgfVxuXG4gIC8vIFRPRE8oamVmZmJjcm9zcyk6IGNvbnNpZGVyIHVzaW5nIFJlc3BvbnNlIHR5cGVcbiAgLyoqXG4gICAqIEVtaXRzIHRoZSBwcm92aWRlZCBlcnJvciBvYmplY3QgYXMgYW4gZXJyb3IgdG8gdGhlIHtAbGluayBSZXNwb25zZX0ge0BsaW5rIEV2ZW50RW1pdHRlcn1cbiAgICogcmV0dXJuZWRcbiAgICogZnJvbSB7QGxpbmsgSHR0cH0uXG4gICAqL1xuICBtb2NrRXJyb3IoZXJyPzogRXJyb3IpIHtcbiAgICAvLyBNYXRjaGVzIFhIUiBzZW1hbnRpY3NcbiAgICB0aGlzLnJlYWR5U3RhdGUgPSBSZWFkeVN0YXRlcy5Eb25lO1xuICAgIHRoaXMucmVzcG9uc2UuZXJyb3IoZXJyKTtcbiAgfVxufVxuXG4vKipcbiAqIEEgbW9jayBiYWNrZW5kIGZvciB0ZXN0aW5nIHRoZSB7QGxpbmsgSHR0cH0gc2VydmljZS5cbiAqXG4gKiBUaGlzIGNsYXNzIGNhbiBiZSBpbmplY3RlZCBpbiB0ZXN0cywgYW5kIHNob3VsZCBiZSB1c2VkIHRvIG92ZXJyaWRlIHByb3ZpZGVyc1xuICogdG8gb3RoZXIgYmFja2VuZHMsIHN1Y2ggYXMge0BsaW5rIFhIUkJhY2tlbmR9LlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogYGBgXG4gKiBpbXBvcnQge01vY2tCYWNrZW5kLCBEZWZhdWx0T3B0aW9ucywgSHR0cH0gZnJvbSAnYW5ndWxhcjIvaHR0cCc7XG4gKiBpdCgnc2hvdWxkIGdldCBzb21lIGRhdGEnLCBpbmplY3QoW0FzeW5jVGVzdENvbXBsZXRlcl0sIChhc3luYykgPT4ge1xuICogICB2YXIgY29ubmVjdGlvbjtcbiAqICAgdmFyIGluamVjdG9yID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbXG4gKiAgICAgTW9ja0JhY2tlbmQsXG4gKiAgICAgcHJvdmlkZShIdHRwLCB7dXNlRmFjdG9yeTogKGJhY2tlbmQsIGRlZmF1bHRPcHRpb25zKSA9PiB7XG4gKiAgICAgICByZXR1cm4gbmV3IEh0dHAoYmFja2VuZCwgZGVmYXVsdE9wdGlvbnMpXG4gKiAgICAgfSwgZGVwczogW01vY2tCYWNrZW5kLCBEZWZhdWx0T3B0aW9uc119KV0pO1xuICogICB2YXIgaHR0cCA9IGluamVjdG9yLmdldChIdHRwKTtcbiAqICAgdmFyIGJhY2tlbmQgPSBpbmplY3Rvci5nZXQoTW9ja0JhY2tlbmQpO1xuICogICAvL0Fzc2lnbiBhbnkgbmV3bHktY3JlYXRlZCBjb25uZWN0aW9uIHRvIGxvY2FsIHZhcmlhYmxlXG4gKiAgIGJhY2tlbmQuY29ubmVjdGlvbnMuc3Vic2NyaWJlKGMgPT4gY29ubmVjdGlvbiA9IGMpO1xuICogICBodHRwLnJlcXVlc3QoJ2RhdGEuanNvbicpLnN1YnNjcmliZSgocmVzKSA9PiB7XG4gKiAgICAgZXhwZWN0KHJlcy50ZXh0KCkpLnRvQmUoJ2F3ZXNvbWUnKTtcbiAqICAgICBhc3luYy5kb25lKCk7XG4gKiAgIH0pO1xuICogICBjb25uZWN0aW9uLm1vY2tSZXNwb25kKG5ldyBSZXNwb25zZSgnYXdlc29tZScpKTtcbiAqIH0pKTtcbiAqIGBgYFxuICpcbiAqIFRoaXMgbWV0aG9kIG9ubHkgZXhpc3RzIGluIHRoZSBtb2NrIGltcGxlbWVudGF0aW9uLCBub3QgaW4gcmVhbCBCYWNrZW5kcy5cbiAqKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBNb2NrQmFja2VuZCBpbXBsZW1lbnRzIENvbm5lY3Rpb25CYWNrZW5kIHtcbiAgLyoqXG4gICAqIHtAbGluayBFdmVudEVtaXR0ZXJ9XG4gICAqIG9mIHtAbGluayBNb2NrQ29ubmVjdGlvbn0gaW5zdGFuY2VzIHRoYXQgaGF2ZSBiZWVuIGNyZWF0ZWQgYnkgdGhpcyBiYWNrZW5kLiBDYW4gYmUgc3Vic2NyaWJlZFxuICAgKiB0byBpbiBvcmRlciB0byByZXNwb25kIHRvIGNvbm5lY3Rpb25zLlxuICAgKlxuICAgKiAjIyMgRXhhbXBsZVxuICAgKlxuICAgKiBgYGBcbiAgICogaW1wb3J0IHtNb2NrQmFja2VuZCwgSHR0cCwgQmFzZVJlcXVlc3RPcHRpb25zfSBmcm9tICdhbmd1bGFyMi9odHRwJztcbiAgICogaW1wb3J0IHtJbmplY3Rvcn0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG4gICAqXG4gICAqIGl0KCdzaG91bGQgZ2V0IGEgcmVzcG9uc2UnLCAoKSA9PiB7XG4gICAqICAgdmFyIGNvbm5lY3Rpb247IC8vdGhpcyB3aWxsIGJlIHNldCB3aGVuIGEgbmV3IGNvbm5lY3Rpb24gaXMgZW1pdHRlZCBmcm9tIHRoZSBiYWNrZW5kLlxuICAgKiAgIHZhciB0ZXh0OyAvL3RoaXMgd2lsbCBiZSBzZXQgZnJvbSBtb2NrIHJlc3BvbnNlXG4gICAqICAgdmFyIGluamVjdG9yID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbXG4gICAqICAgICBNb2NrQmFja2VuZCxcbiAgICogICAgIHByb3ZpZGUoSHR0cCwge3VzZUZhY3Rvcnk6IChiYWNrZW5kLCBvcHRpb25zKSB7XG4gICAqICAgICAgIHJldHVybiBuZXcgSHR0cChiYWNrZW5kLCBvcHRpb25zKTtcbiAgICogICAgIH0sIGRlcHM6IFtNb2NrQmFja2VuZCwgQmFzZVJlcXVlc3RPcHRpb25zXX1dKTtcbiAgICogICB2YXIgYmFja2VuZCA9IGluamVjdG9yLmdldChNb2NrQmFja2VuZCk7XG4gICAqICAgdmFyIGh0dHAgPSBpbmplY3Rvci5nZXQoSHR0cCk7XG4gICAqICAgYmFja2VuZC5jb25uZWN0aW9ucy5zdWJzY3JpYmUoYyA9PiBjb25uZWN0aW9uID0gYyk7XG4gICAqICAgaHR0cC5yZXF1ZXN0KCdzb21ldGhpbmcuanNvbicpLnN1YnNjcmliZShyZXMgPT4ge1xuICAgKiAgICAgdGV4dCA9IHJlcy50ZXh0KCk7XG4gICAqICAgfSk7XG4gICAqICAgY29ubmVjdGlvbi5tb2NrUmVzcG9uZChuZXcgUmVzcG9uc2Uoe2JvZHk6ICdTb21ldGhpbmcnfSkpO1xuICAgKiAgIGV4cGVjdCh0ZXh0KS50b0JlKCdTb21ldGhpbmcnKTtcbiAgICogfSk7XG4gICAqIGBgYFxuICAgKlxuICAgKiBUaGlzIHByb3BlcnR5IG9ubHkgZXhpc3RzIGluIHRoZSBtb2NrIGltcGxlbWVudGF0aW9uLCBub3QgaW4gcmVhbCBCYWNrZW5kcy5cbiAgICovXG4gIGNvbm5lY3Rpb25zOiBhbnk7ICAvLzxNb2NrQ29ubmVjdGlvbj5cblxuICAvKipcbiAgICogQW4gYXJyYXkgcmVwcmVzZW50YXRpb24gb2YgYGNvbm5lY3Rpb25zYC4gVGhpcyBhcnJheSB3aWxsIGJlIHVwZGF0ZWQgd2l0aCBlYWNoIGNvbm5lY3Rpb24gdGhhdFxuICAgKiBpcyBjcmVhdGVkIGJ5IHRoaXMgYmFja2VuZC5cbiAgICpcbiAgICogVGhpcyBwcm9wZXJ0eSBvbmx5IGV4aXN0cyBpbiB0aGUgbW9jayBpbXBsZW1lbnRhdGlvbiwgbm90IGluIHJlYWwgQmFja2VuZHMuXG4gICAqL1xuICBjb25uZWN0aW9uc0FycmF5OiBNb2NrQ29ubmVjdGlvbltdO1xuICAvKipcbiAgICoge0BsaW5rIEV2ZW50RW1pdHRlcn0gb2Yge0BsaW5rIE1vY2tDb25uZWN0aW9ufSBpbnN0YW5jZXMgdGhhdCBoYXZlbid0IHlldCBiZWVuIHJlc29sdmVkIChpLmUuXG4gICAqIHdpdGggYSBgcmVhZHlTdGF0ZWBcbiAgICogbGVzcyB0aGFuIDQpLiBVc2VkIGludGVybmFsbHkgdG8gdmVyaWZ5IHRoYXQgbm8gY29ubmVjdGlvbnMgYXJlIHBlbmRpbmcgdmlhIHRoZVxuICAgKiBgdmVyaWZ5Tm9QZW5kaW5nUmVxdWVzdHNgIG1ldGhvZC5cbiAgICpcbiAgICogVGhpcyBwcm9wZXJ0eSBvbmx5IGV4aXN0cyBpbiB0aGUgbW9jayBpbXBsZW1lbnRhdGlvbiwgbm90IGluIHJlYWwgQmFja2VuZHMuXG4gICAqL1xuICBwZW5kaW5nQ29ubmVjdGlvbnM6IGFueTsgIC8vIFN1YmplY3Q8TW9ja0Nvbm5lY3Rpb24+XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuY29ubmVjdGlvbnNBcnJheSA9IFtdO1xuICAgIHRoaXMuY29ubmVjdGlvbnMgPSBuZXcgU3ViamVjdCgpO1xuICAgIHRoaXMuY29ubmVjdGlvbnMuc3Vic2NyaWJlKGNvbm5lY3Rpb24gPT4gdGhpcy5jb25uZWN0aW9uc0FycmF5LnB1c2goY29ubmVjdGlvbikpO1xuICAgIHRoaXMucGVuZGluZ0Nvbm5lY3Rpb25zID0gbmV3IFN1YmplY3QoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3MgYWxsIGNvbm5lY3Rpb25zLCBhbmQgcmFpc2VzIGFuIGV4Y2VwdGlvbiBpZiBhbnkgY29ubmVjdGlvbiBoYXMgbm90IHJlY2VpdmVkIGEgcmVzcG9uc2UuXG4gICAqXG4gICAqIFRoaXMgbWV0aG9kIG9ubHkgZXhpc3RzIGluIHRoZSBtb2NrIGltcGxlbWVudGF0aW9uLCBub3QgaW4gcmVhbCBCYWNrZW5kcy5cbiAgICovXG4gIHZlcmlmeU5vUGVuZGluZ1JlcXVlc3RzKCkge1xuICAgIGxldCBwZW5kaW5nID0gMDtcbiAgICB0aGlzLnBlbmRpbmdDb25uZWN0aW9ucy5zdWJzY3JpYmUoYyA9PiBwZW5kaW5nKyspO1xuICAgIGlmIChwZW5kaW5nID4gMCkgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oYCR7cGVuZGluZ30gcGVuZGluZyBjb25uZWN0aW9ucyB0byBiZSByZXNvbHZlZGApO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbiBiZSB1c2VkIGluIGNvbmp1bmN0aW9uIHdpdGggYHZlcmlmeU5vUGVuZGluZ1JlcXVlc3RzYCB0byByZXNvbHZlIGFueSBub3QteWV0LXJlc29sdmVcbiAgICogY29ubmVjdGlvbnMsIGlmIGl0J3MgZXhwZWN0ZWQgdGhhdCB0aGVyZSBhcmUgY29ubmVjdGlvbnMgdGhhdCBoYXZlIG5vdCB5ZXQgcmVjZWl2ZWQgYSByZXNwb25zZS5cbiAgICpcbiAgICogVGhpcyBtZXRob2Qgb25seSBleGlzdHMgaW4gdGhlIG1vY2sgaW1wbGVtZW50YXRpb24sIG5vdCBpbiByZWFsIEJhY2tlbmRzLlxuICAgKi9cbiAgcmVzb2x2ZUFsbENvbm5lY3Rpb25zKCkgeyB0aGlzLmNvbm5lY3Rpb25zLnN1YnNjcmliZShjID0+IGMucmVhZHlTdGF0ZSA9IDQpOyB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcge0BsaW5rIE1vY2tDb25uZWN0aW9ufS4gVGhpcyBpcyBlcXVpdmFsZW50IHRvIGNhbGxpbmcgYG5ld1xuICAgKiBNb2NrQ29ubmVjdGlvbigpYCwgZXhjZXB0IHRoYXQgaXQgYWxzbyB3aWxsIGVtaXQgdGhlIG5ldyBgQ29ubmVjdGlvbmAgdG8gdGhlIGBjb25uZWN0aW9uc2BcbiAgICogZW1pdHRlciBvZiB0aGlzIGBNb2NrQmFja2VuZGAgaW5zdGFuY2UuIFRoaXMgbWV0aG9kIHdpbGwgdXN1YWxseSBvbmx5IGJlIHVzZWQgYnkgdGVzdHNcbiAgICogYWdhaW5zdCB0aGUgZnJhbWV3b3JrIGl0c2VsZiwgbm90IGJ5IGVuZC11c2Vycy5cbiAgICovXG4gIGNyZWF0ZUNvbm5lY3Rpb24ocmVxOiBSZXF1ZXN0KTogQ29ubmVjdGlvbiB7XG4gICAgaWYgKCFpc1ByZXNlbnQocmVxKSB8fCAhKHJlcSBpbnN0YW5jZW9mIFJlcXVlc3QpKSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihgY3JlYXRlQ29ubmVjdGlvbiByZXF1aXJlcyBhbiBpbnN0YW5jZSBvZiBSZXF1ZXN0LCBnb3QgJHtyZXF9YCk7XG4gICAgfVxuICAgIGxldCBjb25uZWN0aW9uID0gbmV3IE1vY2tDb25uZWN0aW9uKHJlcSk7XG4gICAgdGhpcy5jb25uZWN0aW9ucy5uZXh0KGNvbm5lY3Rpb24pO1xuICAgIHJldHVybiBjb25uZWN0aW9uO1xuICB9XG59XG4iXX0=