import {isString, isPresent, isBlank} from 'angular2/src/facade/lang';
import {Injectable} from 'angular2/src/di/decorators';
import {IRequestOptions, Connection, ConnectionBackend} from './interfaces';
import {Request} from './static_request';
import {BaseRequestOptions, RequestOptions} from './base_request_options';
import {RequestMethods} from './enums';
import {EventEmitter} from 'angular2/src/facade/async';

function httpRequest(backend: ConnectionBackend, request: Request): EventEmitter {
  return backend.createConnection(request).response;
}

function mergeOptions(defaultOpts, providedOpts, method, url): RequestOptions {
  var newOptions = defaultOpts;
  if (isPresent(providedOpts)) {
    newOptions = newOptions.merge(providedOpts);
  }
  if (isPresent(method)) {
    return newOptions.merge({method: method, url: url});
  } else {
    return newOptions.merge({url: url});
  }
}

/**
 * Performs http requests using `XMLHttpRequest` as the default backend.
 *
 * `Http` is available as an injectable class, with methods to perform http requests. Calling
 * `request` returns an
 * [Observable](https://github.com/Reactive-Extensions/RxJS/blob/master/doc/api/core/observable.md),
 * which will emit a single {@link Response} when a response is
 * received.
 *
 * #Example
 *
 * ```
 * import {Http, httpInjectables} from 'angular2/http';
 * @Component({selector: 'http-app', appInjector: [httpInjectables]})
 * @View({templateUrl: 'people.html'})
 * class PeopleComponent {
 *   constructor(http: Http) {
 *     http('people.json')
 *       // Call map on the response observable to get the parsed people object
 *       .map(res => res.json())
 *       // Subscribe to the observable to get the parsed people object and attach it to the
 *       // component
 *       .subscribe(people => this.people = people);
 *   }
 * }
 * ```
 *
 * The default construct used to perform requests, `XMLHttpRequest`, is abstracted as a "Backend" (
 * {@link XHRBackend} in this case), which could be mocked with dependency injection by replacing
 * the {@link XHRBackend} binding, as in the following example:
 *
 * #Example
 *
 * ```
 * import {MockBackend, BaseRequestOptions, Http} from 'angular2/http';
 * var injector = Injector.resolveAndCreate([
 *   BaseRequestOptions,
 *   MockBackend,
 *   bind(Http).toFactory(
 *       function(backend, defaultOptions) {
 *         return new Http(backend, defaultOptions);
 *       },
 *       [MockBackend, BaseRequestOptions])
 * ]);
 * var http = injector.get(Http);
 * http.get('request-from-mock-backend.json').subscribe((res:Response) => doSomething(res));
 * ```
 *
 **/
@Injectable()
export class Http {
  constructor(private _backend: ConnectionBackend, private _defaultOptions: BaseRequestOptions) {}

  /**
   * Performs any type of http request. First argument is required, and can either be a url or
   * a {@link Request} instance. If the first argument is a url, an optional {@link RequestOptions}
   * object can be provided as the 2nd argument. The options object will be merged with the values
   * of {@link BaseRequestOptions} before performing the request.
   */
  request(url: string | Request, options?: IRequestOptions): EventEmitter {
    var responseObservable: EventEmitter;
    if (isString(url)) {
      responseObservable = httpRequest(
          this._backend,
          new Request(mergeOptions(this._defaultOptions, options, RequestMethods.GET, url)));
    } else if (url instanceof Request) {
      responseObservable = httpRequest(this._backend, url);
    }
    return responseObservable;
  }

  /**
   * Performs a request with `get` http method.
   */
  get(url: string, options?: IRequestOptions) {
    return httpRequest(this._backend, new Request(mergeOptions(this._defaultOptions, options,
                                                               RequestMethods.GET, url)));
  }

  /**
   * Performs a request with `post` http method.
   */
  post(url: string, body: string, options?: IRequestOptions) {
    return httpRequest(this._backend,
                       new Request(mergeOptions(this._defaultOptions.merge({body: body}), options,
                                                RequestMethods.POST, url)));
  }

  /**
   * Performs a request with `put` http method.
   */
  put(url: string, body: string, options?: IRequestOptions) {
    return httpRequest(this._backend,
                       new Request(mergeOptions(this._defaultOptions.merge({body: body}), options,
                                                RequestMethods.PUT, url)));
  }

  /**
   * Performs a request with `delete` http method.
   */
  delete (url: string, options?: IRequestOptions) {
    return httpRequest(this._backend, new Request(mergeOptions(this._defaultOptions, options,
                                                               RequestMethods.DELETE, url)));
  }

  /**
   * Performs a request with `patch` http method.
   */
  patch(url: string, body: string, options?: IRequestOptions) {
    return httpRequest(this._backend,
                       new Request(mergeOptions(this._defaultOptions.merge({body: body}), options,
                                                RequestMethods.PATCH, url)));
  }

  /**
   * Performs a request with `head` http method.
   */
  head(url: string, options?: IRequestOptions) {
    return httpRequest(this._backend, new Request(mergeOptions(this._defaultOptions, options,
                                                               RequestMethods.HEAD, url)));
  }
}
