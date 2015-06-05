/// <reference path="../../typings/rx/rx.all.d.ts" />

import {Injectable} from 'angular2/src/di/decorators';
import {RequestOptions, Connection} from './interfaces';
import {Request} from './static_request';
import {Response} from './static_response';
import {XHRBackend} from './backends/xhr_backend';
import {BaseRequestOptions} from './base_request_options';
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

// Abstract
@Injectable()
export class Http {
}

var Observable;
if (Rx.hasOwnProperty('default')) {
  Observable = (<any>Rx).default.Rx.Observable;
} else {
  Observable = Rx.Observable;
}
export function HttpFactory(backend: XHRBackend, defaultOptions: BaseRequestOptions) {
  return function(url: string, options?: RequestOptions) {
    return <Rx.Observable<Response>>(Observable.create(observer => {
      var connection: Connection = backend.createConnection(new Request(url, options));
      var internalSubscription = connection.response.subscribe(observer);
      return () => {
        internalSubscription.dispose();
        connection.dispose();
      }
    }))
  }
}
