import {ConnectionBackend, Connection} from '../interfaces';
import {ReadyStates, RequestMethods} from '../enums';
import {Request} from '../static_request';
import {Response} from '../static_response';
import {Inject} from 'angular2/di';
import {Injectable} from 'angular2/di';
import {BrowserXHR} from './browser_xhr';
import * as Rx from 'rx';

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
  response: Rx.Subject<Response>;
  readyState: ReadyStates;
  private _xhr;
  constructor(req: Request, NativeConstruct: any) {
    this.request = req;
    if (Rx.hasOwnProperty('default')) {
      this.response = new (<any>Rx).default.Rx.Subject();
    } else {
      this.response = new Rx.Subject<Response>();
    }
    this._xhr = new NativeConstruct();
    // TODO(jeffbcross): implement error listening/propagation
    this._xhr.open(RequestMethods[req.method], req.url);
    this._xhr.addEventListener(
        'load',
        () => {this.response.onNext(new Response(this._xhr.response || this._xhr.responseText))});
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
  constructor(private _NativeConstruct: BrowserXHR) {}
  createConnection(request: Request): XHRConnection {
    return new XHRConnection(request, this._NativeConstruct);
  }
}
