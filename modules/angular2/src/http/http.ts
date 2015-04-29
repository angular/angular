/// <reference path="../../typings/rx/rx.all.d.ts" />

import {Injectable} from 'angular2/src/di/decorators';
import {IRequestOptions, IConnection} from './interfaces';
import {Request} from './static_request';
import {Response} from './static_response';
import {XHRBackend} from './backends/xhr_backend';
import * as Rx from 'rx';

/**
 * This function is bound to a single underlying connection mechanism, such as XHR, which could be
 * mocked with dependency injection by replacing the `Backend` binding. For other transports, like
 * JSONP or Node, a separate http function would be created, such as httpJSONP.
 *
 * Ideally, much of the logic used here could be moved out of http and re-used.
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
export function HttpFactory(backend: XHRBackend) {
  return function(url: string, options?: IRequestOptions) {

    return <Rx.Observable<Response>>(Observable.create(observer => {
      var connection: IConnection = backend.createConnection(new Request(url, options));
      var internalSubscription = connection.response.subscribe(observer);
      return () => {
        internalSubscription.dispose();
        connection.dispose();
      }
    }))
  }
}
