import {ConnectionBackend, Connection} from '../interfaces';
import {ReadyStates, RequestMethods, RequestMethodsMap} from '../enums';
import {Request} from '../static_request';
import {Response} from '../static_response';
import {Injectable} from 'angular2/di';
import {BrowserXHR} from './browser_xhr';
import {EventEmitter, ObservableWrapper} from 'angular2/src/facade/async';
import {isPresent, ENUM_INDEX} from 'angular2/src/facade/lang';

/**
 * Creates connections using `XMLHttpRequest`. Given a fully-qualified
 * request, an `XHRConnection` will immediately create an `XMLHttpRequest` object and send the
 * request.
 *
 * This class would typically not be created or interacted with directly inside applications, though
 * the {@link MockConnection} may be interacted with in tests.
 */
export class XHRConnection implements Connection {
  request: Request;
  /**
   * Response
   * [Subject](https://github.com/Reactive-Extensions/RxJS/blob/master/doc/api/subjects/subject.md)
   * which emits a single {@link Response} value on load event of `XMLHttpRequest`.
   */
  response: EventEmitter;  //<Response>;
  readyState: ReadyStates;
  private _xhr;
  constructor(req: Request, browserXHR: BrowserXHR) {
    // TODO: get rid of this when enum lookups are available in ts2dart
    // https://github.com/angular/ts2dart/issues/221
    var requestMethodsMap = new RequestMethodsMap();
    this.request = req;
    this.response = new EventEmitter();
    this._xhr = browserXHR.build();
    // TODO(jeffbcross): implement error listening/propagation
    this._xhr.open(requestMethodsMap.getMethod(ENUM_INDEX(req.method)), req.url);
    this._xhr.addEventListener(
        'load',
        (_) => {ObservableWrapper.callNext(
            this.response, new Response({
              body: isPresent(this._xhr.response) ? this._xhr.response : this._xhr.responseText
            }))});
    // TODO(jeffbcross): make this more dynamic based on body type
    this._xhr.send(this.request.text());
  }

  /**
   * Calls abort on the underlying XMLHttpRequest.
   */
  dispose(): void { this._xhr.abort(); }
}

/**
 * Creates {@link XHRConnection} instances.
 *
 * This class would typically not be used by end users, but could be
 * overridden if a different backend implementation should be used,
 * such as in a node backend.
 *
 * #Example
 *
 * ```
 * import {Http, MyNodeBackend, httpInjectables, BaseRequestOptions} from 'angular2/http';
 * @Component({
 *   appInjector: [
 *     httpInjectables,
 *     bind(Http).toFactory((backend, options) => {
 *       return new Http(backend, options);
 *     }, [MyNodeBackend, BaseRequestOptions])]
 * })
 * class MyComponent {
 *   constructor(http:Http) {
 *     http('people.json').subscribe(res => this.people = res.json());
 *   }
 * }
 * ```
 *
 **/
@Injectable()
export class XHRBackend implements ConnectionBackend {
  constructor(private _browserXHR: BrowserXHR) {}
  createConnection(request: Request): XHRConnection {
    return new XHRConnection(request, this._browserXHR);
  }
}
