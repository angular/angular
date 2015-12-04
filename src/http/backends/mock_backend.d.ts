import { Request } from '../static_request';
import { Response } from '../static_response';
import { ReadyStates } from '../enums';
import { Connection, ConnectionBackend } from '../interfaces';
/**
 *
 * Mock Connection to represent a {@link Connection} for tests.
 *
 **/
export declare class MockConnection implements Connection {
    /**
     * Describes the state of the connection, based on `XMLHttpRequest.readyState`, but with
     * additional states. For example, state 5 indicates an aborted connection.
     */
    readyState: ReadyStates;
    /**
     * {@link Request} instance used to create the connection.
     */
    request: Request;
    /**
     * {@link EventEmitter} of {@link Response}. Can be subscribed to in order to be notified when a
     * response is available.
     */
    response: any;
    constructor(req: Request);
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
    mockRespond(res: Response): void;
    /**
     * Not yet implemented!
     *
     * Sends the provided {@link Response} to the `downloadObserver` of the `Request`
     * associated with this connection.
     */
    mockDownload(res: Response): void;
    /**
     * Emits the provided error object as an error to the {@link Response} {@link EventEmitter}
     * returned
     * from {@link Http}.
     */
    mockError(err?: Error): void;
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
export declare class MockBackend implements ConnectionBackend {
    /**
     * {@link EventEmitter}
     * of {@link MockConnection} instances that have been created by this backend. Can be subscribed
     * to in order to respond to connections.
     *
     * ### Example
     *
     * ```
     * import {MockBackend, Http, BaseRequestOptions} from 'angular2/http';
     * import {Injector} from 'angular2/core';
     *
     * it('should get a response', () => {
     *   var connection; //this will be set when a new connection is emitted from the backend.
     *   var text; //this will be set from mock response
     *   var injector = Injector.resolveAndCreate([
     *     MockBackend,
     *     provide(Http, {useFactory: (backend, options) {
     *       return new Http(backend, options);
     *     }, deps: [MockBackend, BaseRequestOptions]}]);
     *   var backend = injector.get(MockBackend);
     *   var http = injector.get(Http);
     *   backend.connections.subscribe(c => connection = c);
     *   http.request('something.json').subscribe(res => {
     *     text = res.text();
     *   });
     *   connection.mockRespond(new Response({body: 'Something'}));
     *   expect(text).toBe('Something');
     * });
     * ```
     *
     * This property only exists in the mock implementation, not in real Backends.
     */
    connections: any;
    /**
     * An array representation of `connections`. This array will be updated with each connection that
     * is created by this backend.
     *
     * This property only exists in the mock implementation, not in real Backends.
     */
    connectionsArray: MockConnection[];
    /**
     * {@link EventEmitter} of {@link MockConnection} instances that haven't yet been resolved (i.e.
     * with a `readyState`
     * less than 4). Used internally to verify that no connections are pending via the
     * `verifyNoPendingRequests` method.
     *
     * This property only exists in the mock implementation, not in real Backends.
     */
    pendingConnections: any;
    constructor();
    /**
     * Checks all connections, and raises an exception if any connection has not received a response.
     *
     * This method only exists in the mock implementation, not in real Backends.
     */
    verifyNoPendingRequests(): void;
    /**
     * Can be used in conjunction with `verifyNoPendingRequests` to resolve any not-yet-resolve
     * connections, if it's expected that there are connections that have not yet received a response.
     *
     * This method only exists in the mock implementation, not in real Backends.
     */
    resolveAllConnections(): void;
    /**
     * Creates a new {@link MockConnection}. This is equivalent to calling `new
     * MockConnection()`, except that it also will emit the new `Connection` to the `connections`
     * emitter of this `MockBackend` instance. This method will usually only be used by tests
     * against the framework itself, not by end-users.
     */
    createConnection(req: Request): Connection;
}
