var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from 'angular2/core';
import { Request } from '../static_request';
import { ReadyState } from '../enums';
import { isPresent } from 'angular2/src/facade/lang';
import { BaseException } from 'angular2/src/facade/exceptions';
import { Subject } from 'rxjs/Subject';
import { ReplaySubject } from 'rxjs/subject/ReplaySubject';
import { take } from 'rxjs/operator/take';
/**
 *
 * Mock Connection to represent a {@link Connection} for tests.
 *
 **/
export class MockConnection {
    constructor(req) {
        this.response = take.call(new ReplaySubject(1), 1);
        this.readyState = ReadyState.Open;
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
        if (this.readyState === ReadyState.Done || this.readyState === ReadyState.Cancelled) {
            throw new BaseException('Connection has already been resolved');
        }
        this.readyState = ReadyState.Done;
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
        this.readyState = ReadyState.Done;
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
