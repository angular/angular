/// <reference path="../../typings/rx/rx.d.ts" />

import {Injectable} from 'angular2/src/di/decorators';
import {IRequestOptions, Connection, IHttp} from './interfaces';
import {Request} from './static_request';
import {Response} from './static_response';
import {XHRBackend} from './backends/xhr_backend';
import {BaseRequestOptions} from './base_request_options';
import {RequestMethods} from './enums';
import {URLSearchParams} from './url_search_params';
import * as Rx from 'rx';

function httpRequest(backend: XHRBackend, request: Request): Rx.Observable<Response> {
  return <Rx.Observable<Response>>(Observable.create(observer => {
    var connection: Connection = backend.createConnection(request);
    var internalSubscription = connection.response.subscribe(observer);
    return () => {
      internalSubscription.dispose();
      connection.dispose();
    };
  }));
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
  constructor(private _backend: XHRBackend, private _defaultOptions: BaseRequestOptions) {}

  /**
   * Performs any type of http request. First argument is required, and can either be a url or
   * a {@link Request} instance. If the first argument is a url, an optional {@link RequestOptions}
   * object can be provided as the 2nd argument. The options object will be merged with the values
   * of {@link BaseRequestOptions} before performing the request.
   */
  request(url: string | Request, options?: IRequestOptions): Rx.Observable<Response> {
    if (typeof url === 'string') {
      return httpRequest(this._backend, new Request(url, this._defaultOptions.merge(options)));
    } else if (url instanceof Request) {
      return httpRequest(this._backend, url);
    }
  }

  /**
   * Performs a request with `get` http method.
   */
  get(url: string, options?: IRequestOptions): Rx.Observable<Response> {
    return httpRequest(this._backend, new Request(url, this._defaultOptions.merge(options)
                                                           .merge({method: RequestMethods.GET})));
  }

  /**
   * Performs a request with `post` http method.
   */
  post(url: string, body: URLSearchParams | FormData | Blob | string,
       options?: IRequestOptions): Rx.Observable<Response> {
    return httpRequest(this._backend,
                       new Request(url, this._defaultOptions.merge(options)

                                            .merge({body: body, method: RequestMethods.POST})));
  }

  /**
   * Performs a request with `put` http method.
   */
  put(url: string, body: URLSearchParams | FormData | Blob | string,
      options?: IRequestOptions): Rx.Observable<Response> {
    return httpRequest(this._backend,
                       new Request(url, this._defaultOptions.merge(options)
                                            .merge({body: body, method: RequestMethods.PUT})));
  }

  /**
   * Performs a request with `delete` http method.
   */
  delete (url: string, options?: IRequestOptions): Rx.Observable<Response> {
    return httpRequest(this._backend, new Request(url, this._defaultOptions.merge(options).merge(
                                                           {method: RequestMethods.DELETE})));
  }

  /**
   * Performs a request with `patch` http method.
   */
  patch(url: string, body: URLSearchParams | FormData | Blob | string,
        options?: IRequestOptions): Rx.Observable<Response> {
    return httpRequest(this._backend,
                       new Request(url, this._defaultOptions.merge(options)
                                            .merge({body: body, method: RequestMethods.PATCH})));
  }

  /**
   * Performs a request with `head` http method.
   */
  head(url: string, options?: IRequestOptions): Rx.Observable<Response> {
    return httpRequest(this._backend, new Request(url, this._defaultOptions.merge(options)
                                                           .merge({method: RequestMethods.HEAD})));
  }
}

var Observable;
if (Rx.hasOwnProperty('default')) {
  Observable = (<any>Rx).default.Rx.Observable;
} else {
  Observable = Rx.Observable;
}

/**
 *
 * Alias to the `request` method of {@link Http}, for those who'd prefer a simple function instead
 * of an object. In order to get TypeScript type information about the `HttpFactory`, the {@link
 * IHttp} interface can be used as shown in the following example.
 *
 * #Example
 *
 * ```
 * import {httpInjectables, HttpFactory, IHttp} from 'angular2/http';
 * @Component({
 *   appInjector: [httpInjectables]
 * })
 * @View({
 *   templateUrl: 'people.html'
 * })
 * class MyComponent {
 *  constructor(@Inject(HttpFactory) http:IHttp) {
 *    http('people.json').subscribe(res => this.people = res.json());
 *  }
 * }
 * ```
 **/
export function HttpFactory(backend: XHRBackend, defaultOptions: BaseRequestOptions): IHttp {
  return function(url: string | Request, options?: IRequestOptions) {
    if (typeof url === 'string') {
      return httpRequest(backend, new Request(url, defaultOptions.merge(options)));
    } else if (url instanceof Request) {
      return httpRequest(backend, url);
    }
  };
}
