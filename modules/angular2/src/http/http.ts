import {isString, isPresent, isBlank, makeTypeError} from 'angular2/src/core/facade/lang';
import {Injectable} from 'angular2/src/core/di/decorators';
import {RequestOptionsArgs, Connection, ConnectionBackend} from './interfaces';
import {Request} from './static_request';
import {BaseRequestOptions, RequestOptions} from './base_request_options';
import {RequestMethods} from './enums';
import {EventEmitter} from 'angular2/src/core/facade/async';

function httpRequest(backend: ConnectionBackend, request: Request): EventEmitter {
  return backend.createConnection(request).response;
}

function mergeOptions(defaultOpts, providedOpts, method, url): RequestOptions {
  var newOptions = defaultOpts;
  if (isPresent(providedOpts)) {
    // Hack so Dart can used named parameters
    newOptions = newOptions.merge(new RequestOptions({
      method: providedOpts.method,
      url: providedOpts.url,
      search: providedOpts.search,
      headers: providedOpts.headers,
      body: providedOpts.body,
      mode: providedOpts.mode,
      credentials: providedOpts.credentials,
      cache: providedOpts.cache
    }));
  }
  if (isPresent(method)) {
    return newOptions.merge(new RequestOptions({method: method, url: url}));
  } else {
    return newOptions.merge(new RequestOptions({url: url}));
  }
}

/**
 * Performs http requests using `XMLHttpRequest` as the default backend.
 *
 * `Http` is available as an injectable class, with methods to perform http requests. Calling
 * `request` returns an {@link EventEmitter} which will emit a single {@link Response} when a
 * response is received.
 *
 *
 * ## Breaking Change
 *
 * Previously, methods of `Http` would return an RxJS Observable directly. For now,
 * the `toRx()` method of {@link EventEmitter} needs to be called in order to get the RxJS
 * Subject. `EventEmitter` does not provide combinators like `map`, and has different semantics for
 * subscribing/observing. This is temporary; the result of all `Http` method calls will be either an
 * Observable
 * or Dart Stream when [issue #2794](https://github.com/angular/angular/issues/2794) is resolved.
 *
 * #Example
 *
 * ```
 * import {Http, HTTP_BINDINGS} from 'angular2/http';
 * @Component({selector: 'http-app', viewBindings: [HTTP_BINDINGS]})
 * @View({templateUrl: 'people.html'})
 * class PeopleComponent {
 *   constructor(http: Http) {
 *     http.get('people.json')
 *       //Get the RxJS Subject
 *       .toRx()
 *       // Call map on the response observable to get the parsed people object
 *       .map(res => res.json())
 *       // Subscribe to the observable to get the parsed people object and attach it to the
 *       // component
 *       .subscribe(people => this.people = people);
 *   }
 * }
 * ```
 *
 * To use the {@link EventEmitter} returned by `Http`, simply pass a generator (See "interface
 *Generator" in the Async Generator spec: https://github.com/jhusain/asyncgenerator) to the
 *`observer` method of the returned emitter, with optional methods of `next`, `throw`, and `return`.
 *
 * #Example
 *
 * ```
 * http.get('people.json').observer({next: (value) => this.people = people});
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
 * http.get('request-from-mock-backend.json').toRx().subscribe((res:Response) => doSomething(res));
 * ```
 *
 **/
@Injectable()
export class Http {
  constructor(protected _backend: ConnectionBackend, protected _defaultOptions: RequestOptions) {}

  /**
   * Performs any type of http request. First argument is required, and can either be a url or
   * a {@link Request} instance. If the first argument is a url, an optional {@link RequestOptions}
   * object can be provided as the 2nd argument. The options object will be merged with the values
   * of {@link BaseRequestOptions} before performing the request.
   */
  request(url: string | Request, options?: RequestOptionsArgs): EventEmitter {
    var responseObservable: EventEmitter;
    if (isString(url)) {
      responseObservable = httpRequest(
          this._backend,
          new Request(mergeOptions(this._defaultOptions, options, RequestMethods.Get, url)));
    } else if (url instanceof Request) {
      responseObservable = httpRequest(this._backend, url);
    }
    return responseObservable;
  }

  /**
   * Performs a request with `get` http method.
   */
  get(url: string, options?: RequestOptionsArgs): EventEmitter {
    return httpRequest(this._backend, new Request(mergeOptions(this._defaultOptions, options,
                                                               RequestMethods.Get, url)));
  }

  /**
   * Performs a request with `post` http method.
   */
  post(url: string, body: string, options?: RequestOptionsArgs): EventEmitter {
    return httpRequest(
        this._backend,
        new Request(mergeOptions(this._defaultOptions.merge(new RequestOptions({body: body})),
                                 options, RequestMethods.Post, url)));
  }

  /**
   * Performs a request with `put` http method.
   */
  put(url: string, body: string, options?: RequestOptionsArgs): EventEmitter {
    return httpRequest(
        this._backend,
        new Request(mergeOptions(this._defaultOptions.merge(new RequestOptions({body: body})),
                                 options, RequestMethods.Put, url)));
  }

  /**
   * Performs a request with `delete` http method.
   */
  delete (url: string, options?: RequestOptionsArgs): EventEmitter {
    return httpRequest(this._backend, new Request(mergeOptions(this._defaultOptions, options,
                                                               RequestMethods.Delete, url)));
  }

  /**
   * Performs a request with `patch` http method.
   */
  patch(url: string, body: string, options?: RequestOptionsArgs): EventEmitter {
    return httpRequest(
        this._backend,
        new Request(mergeOptions(this._defaultOptions.merge(new RequestOptions({body: body})),
                                 options, RequestMethods.Patch, url)));
  }

  /**
   * Performs a request with `head` http method.
   */
  head(url: string, options?: RequestOptionsArgs): EventEmitter {
    return httpRequest(this._backend, new Request(mergeOptions(this._defaultOptions, options,
                                                               RequestMethods.Head, url)));
  }
}

@Injectable()
export class Jsonp extends Http {
  constructor(backend: ConnectionBackend, defaultOptions: RequestOptions) {
    super(backend, defaultOptions);
  }

  /**
   * Performs any type of http request. First argument is required, and can either be a url or
   * a {@link Request} instance. If the first argument is a url, an optional {@link RequestOptions}
   * object can be provided as the 2nd argument. The options object will be merged with the values
   * of {@link BaseRequestOptions} before performing the request.
   */
  request(url: string | Request, options?: RequestOptionsArgs): EventEmitter {
    var responseObservable: EventEmitter;
    if (isString(url)) {
      url = new Request(mergeOptions(this._defaultOptions, options, RequestMethods.Get, url));
    }
    if (url instanceof Request) {
      if (url.method !== RequestMethods.Get) {
        makeTypeError('JSONP requests must use GET request method.');
      }
      responseObservable = httpRequest(this._backend, url);
    }
    return responseObservable;
  }
}
