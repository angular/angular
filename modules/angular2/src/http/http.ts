/// <reference path="../../typings/rx/rx.all.d.ts" />

import {Injectable} from 'angular2/src/di/decorators';
import {RequestOptions, Connection} from './interfaces';
import {Request} from './static_request';
import {Response} from './static_response';
import {XHRBackend} from './backends/xhr_backend';
import {BaseRequestOptions} from './base_request_options';
import {RequestMethods} from './enums';
import {URLSearchParams} from './url_search_params';
import * as Rx from 'rx';

/**
 * A function to perform http requests over XMLHttpRequest.
 *
 * #Example
 *
 * ```
 * @Component({
 *   appInjector: [httpBindings]
 * })
 * @View({
 *   directives: [NgFor],
 *   template: `
 *     <ul>
 *       <li *ng-for="#person of people">
 *         hello, {{person.name}}
 *       </li>
 *     </ul>
 *   `
 * })
 * class MyComponent {
 *  constructor(http:Http) {
 *    http('people.json').subscribe(res => this.people = res.json());
 *  }
 * }
 * ```
 *
 *
 * This function is bound to a single underlying connection mechanism, such as XHR, which could be
 * mocked with dependency injection by replacing the `Backend` binding. For other transports, like
 * JSONP or Node, a separate http function would be created, such as httpJSONP.
 *
 * @exportedAs angular2/http
 *
 **/

function httpRequest(backend: XHRBackend, request: Request) {
  return <Rx.Observable<Response>>(Observable.create(observer => {
    var connection: Connection = backend.createConnection(request);
    var internalSubscription = connection.response.subscribe(observer);
    return () => {
      internalSubscription.dispose();
      connection.dispose();
    }
  }))
}

// Abstract
@Injectable()
export class Http {
  constructor(private backend: XHRBackend, private defaultOptions: BaseRequestOptions) {}

  request(url: string|Request, options?: RequestOptions): Rx.Observable<Response> {
    if (typeof url === 'string') {
      return httpRequest(this.backend, new Request(url, this.defaultOptions.merge(options)));
    } else if (url instanceof Request) {
      return httpRequest(this.backend, url);
    }
  }

  get(url: string, options?: RequestOptions) {
    return httpRequest(this.backend, new Request(url, this.defaultOptions.merge(options)
                                                          .merge({method: RequestMethods.GET})));
  }

  post(url: string, body: URLSearchParams | FormData | Blob | string, options?: RequestOptions) {
    return httpRequest(this.backend,
                       new Request(url, this.defaultOptions.merge(options)

                                            .merge({body: body, method: RequestMethods.POST})));
  }

  put(url: string, body: URLSearchParams | FormData | Blob | string, options?: RequestOptions) {
    return httpRequest(this.backend,
                       new Request(url, this.defaultOptions.merge(options)
                                            .merge({body: body, method: RequestMethods.PUT})));
  }

  delete (url: string, options?: RequestOptions) {
    return httpRequest(this.backend, new Request(url, this.defaultOptions.merge(options)
                                                          .merge({method: RequestMethods.DELETE})));
  }

  patch(url: string, body: URLSearchParams | FormData | Blob | string, options?: RequestOptions) {
    return httpRequest(this.backend,
                       new Request(url, this.defaultOptions.merge(options)
                                            .merge({body: body, method: RequestMethods.PATCH})));
  }

  head(url: string, options?: RequestOptions) {
    return httpRequest(this.backend, new Request(url, this.defaultOptions.merge(options)
                                                          .merge({method: RequestMethods.HEAD})));
  }
}

var Observable;
if (Rx.hasOwnProperty('default')) {
  Observable = (<any>Rx).default.Rx.Observable;
} else {
  Observable = Rx.Observable;
}
export function HttpFactory(backend: XHRBackend, defaultOptions: BaseRequestOptions) {
  return function(url: string | Request, options?: RequestOptions) {
    if (typeof url === 'string') {
      return httpRequest(backend, new Request(url, defaultOptions.merge(options)));
    } else if (url instanceof Request) {
      return httpRequest(backend, url);
    }
  }
}
