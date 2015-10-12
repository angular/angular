import {ConnectionBackend, Connection} from '../interfaces';
import {ReadyStates, RequestMethods, ResponseTypes} from '../enums';
import {Request} from '../static_request';
import {Response} from '../static_response';
import {ResponseOptions, BaseResponseOptions} from '../base_response_options';
import {Injectable} from 'angular2/angular2';
import {BrowserXhr} from './browser_xhr';
import {isPresent} from 'angular2/src/core/facade/lang';
// todo(robwormald): temporary until https://github.com/angular/angular/issues/4390 decided
var Rx = require('@reactivex/rxjs/dist/cjs/Rx');
var {Observable} = Rx;
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
  response: any;  // TODO: Make generic of <Response>;
  readyState: ReadyStates;
  constructor(req: Request, browserXHR: BrowserXhr, baseResponseOptions?: ResponseOptions) {
    this.request = req;
    this.response = new Observable(responseObserver => {
      let _xhr: XMLHttpRequest = browserXHR.build();
      _xhr.open(RequestMethods[req.method].toUpperCase(), req.url);
      // load event handler
      let onLoad = () => {
        // responseText is the old-school way of retrieving response (supported by IE8 & 9)
        // response/responseType properties were introduced in XHR Level2 spec (supported by
        // IE10)
        let response = isPresent(_xhr.response) ? _xhr.response : _xhr.responseText;

        // normalize IE9 bug (http://bugs.jquery.com/ticket/1450)
        let status = _xhr.status === 1223 ? 204 : _xhr.status;

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
        responseObserver.next(new Response(responseOptions));
        // TODO(gdi2290): defer complete if array buffer until done
        responseObserver.complete();
      };
      // error event handler
      let onError = (err) => {
        var responseOptions = new ResponseOptions({body: err, type: ResponseTypes.Error});
        if (isPresent(baseResponseOptions)) {
          responseOptions = baseResponseOptions.merge(responseOptions);
        }
        responseObserver.error(new Response(responseOptions));
      };

      if (isPresent(req.headers)) {
        req.headers.forEach((values, name) => _xhr.setRequestHeader(name, values.join(',')));
      }

      _xhr.addEventListener('load', onLoad);
      _xhr.addEventListener('error', onError);

      _xhr.send(this.request.text());

      return () => {
        _xhr.removeEventListener('load', onLoad);
        _xhr.removeEventListener('error', onError);
        _xhr.abort();
      };
    });
  }
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
 * import {Http, MyNodeBackend, HTTP_PROVIDERS, BaseRequestOptions} from 'angular2/http';
 * @Component({
 *   viewProviders: [
 *     HTTP_PROVIDERS,
 *     provide(Http, {useFactory: (backend, options) => {
 *       return new Http(backend, options);
 *     }, deps: [MyNodeBackend, BaseRequestOptions]})]
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
