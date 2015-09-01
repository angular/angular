import {ConnectionBackend, Connection} from '../interfaces';
import {ReadyStates, RequestMethods, ResponseTypes} from '../enums';
import {Request} from '../static_request';
import {Response} from '../static_response';
import {ResponseOptions, BaseResponseOptions} from '../base_response_options';
import {Injectable} from 'angular2/di';
import {BrowserXhr} from './browser_xhr';
import {EventEmitter, ObservableWrapper} from 'angular2/src/core/facade/async';
import {isPresent} from 'angular2/src/core/facade/lang';

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
   * Response {@link EventEmitter} which emits a single {@link Response} value on load event of
   * `XMLHttpRequest`.
   */
  response: EventEmitter;  // TODO: Make generic of <Response>;
  readyState: ReadyStates;
  private _xhr;  // TODO: make type XMLHttpRequest, pending resolution of
                 // https://github.com/angular/ts2dart/issues/230
  constructor(req: Request, browserXHR: BrowserXhr, baseResponseOptions?: ResponseOptions) {
    this.request = req;
    this.response = new EventEmitter();
    this._xhr = browserXHR.build();
    // TODO(jeffbcross): implement error listening/propagation
    this._xhr.open(RequestMethods[req.method].toUpperCase(), req.url);
    this._xhr.addEventListener('load', (_) => {
      // responseText is the old-school way of retrieving response (supported by IE8 & 9)
      // response/responseType properties were introduced in XHR Level2 spec (supported by IE10)
      let response = isPresent(this._xhr.response) ? this._xhr.response : this._xhr.responseText;

      // normalize IE9 bug (http://bugs.jquery.com/ticket/1450)
      let status = this._xhr.status === 1223 ? 204 : this._xhr.status;

      // fix status code when it is 0 (0 status is undocumented).
      // Occurs when accessing file resources or on Android 4.1 stock browser
      // while retrieving files from application cache.
      if (status === 0) {
        status = response ? 200 : 0;
      }

      var responseOptions = new ResponseOptions({body: response, status: status});
      if (isPresent(baseResponseOptions)) {
        responseOptions = baseResponseOptions.merge(responseOptions);
      }

      ObservableWrapper.callNext(this.response, new Response(responseOptions));
      // TODO(gdi2290): defer complete if array buffer until done
      ObservableWrapper.callReturn(this.response);
    });

    this._xhr.addEventListener('error', (err) => {
      var responseOptions = new ResponseOptions({body: err, type: ResponseTypes.Error});
      if (isPresent(baseResponseOptions)) {
        responseOptions = baseResponseOptions.merge(responseOptions);
      }
      ObservableWrapper.callThrow(this.response, new Response(responseOptions));
    });
    // TODO(jeffbcross): make this more dynamic based on body type

    if (isPresent(req.headers)) {
      req.headers.forEach((value, name) => { this._xhr.setRequestHeader(name, value); });
    }

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
 * import {Http, MyNodeBackend, HTTP_BINDINGS, BaseRequestOptions} from 'angular2/http';
 * @Component({
 *   viewBindings: [
 *     HTTP_BINDINGS,
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
  constructor(private _browserXHR: BrowserXhr, private _baseResponseOptions: ResponseOptions) {}
  createConnection(request: Request): XHRConnection {
    return new XHRConnection(request, this._browserXHR, this._baseResponseOptions);
  }
}
