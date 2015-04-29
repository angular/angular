import {Injectable} from 'angular2/di';
import {Request} from 'angular2/src/http/static_request';
import {Response} from 'angular2/src/http/static_response';
import {ReadyStates} from 'angular2/src/http/enums';
import * as Rx from 'rx';

/**
 * Connection represents a request and response for an underlying transport, like XHR or mock.
 * The mock implementation contains helper methods to respond to connections within tests.
 * API subject to change and expand.
 **/
export class Connection {
  /**
   * Observer to call on download progress, if provided in config.
   **/
  downloadObserver: Rx.Observer<Response>;

  /**
   * TODO
   * Name `readyState` should change to be more generic, and states could be made to be more
   * descriptive than XHR states.
   **/

  readyState: ReadyStates;
  request: Request;
  response: Rx.Subject<Response>;

  constructor(req: Request) {
    // State
    if (Rx.hasOwnProperty('default')) {
      this.response = new ((<any>Rx).default.Rx.Subject)();
    } else {
      this.response = new Rx.Subject<Response>();
    }

    this.readyState = ReadyStates.OPEN;
    this.request = req;
    this.dispose = this.dispose.bind(this);
  }

  dispose() {
    if (this.readyState !== ReadyStates.DONE) {
      this.readyState = ReadyStates.CANCELLED;
    }
  }

  /**
   * Called after a connection has been established.
   **/
  mockRespond(res: Response) {
    if (this.readyState >= ReadyStates.DONE) {
      throw new Error('Connection has already been resolved');
    }
    this.readyState = ReadyStates.DONE;
    this.response.onNext(res);
    this.response.onCompleted();
  }

  mockDownload(res: Response) {
    this.downloadObserver.onNext(res);
    if (res.bytesLoaded === res.totalBytes) {
      this.downloadObserver.onCompleted();
    }
  }

  mockError(err?) {
    // Matches XHR semantics
    this.readyState = ReadyStates.DONE;
    this.response.onError(err);
    this.response.onCompleted();
  }
}

@Injectable()
export class MockBackend {
  connections: Rx.Subject<Connection>;
  connectionsArray: Array<Connection>;
  pendingConnections: Rx.Observable<Connection>;
  constructor() {
    this.connectionsArray = [];
    if (Rx.hasOwnProperty('default')) {
      this.connections = new (<any>Rx).default.Rx.Subject();
    } else {
      this.connections = new Rx.Subject<Connection>();
    }
    this.connections.subscribe(connection => this.connectionsArray.push(connection));
    this.pendingConnections = this.connections.filter((c) => c.readyState < ReadyStates.DONE);
  }

  verifyNoPendingRequests() {
    let pending = 0;
    this.pendingConnections.subscribe((c) => pending++);
    if (pending > 0) throw new Error(`${pending} pending connections to be resolved`);
  }

  resolveAllConnections() { this.connections.subscribe((c) => c.readyState = 4); }

  createConnection(req: Request) {
    if (!req || !(req instanceof Request)) {
      throw new Error(`createConnection requires an instance of Request, got ${req}`);
    }
    let connection = new Connection(req);
    this.connections.onNext(connection);
    return connection;
  }
}
