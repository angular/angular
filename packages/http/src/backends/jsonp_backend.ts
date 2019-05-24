/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable} from '@angular/core';
import {Observable, Observer} from 'rxjs';

import {ResponseOptions} from '../base_response_options';
import {ReadyState, RequestMethod, ResponseType} from '../enums';
import {Connection, ConnectionBackend} from '../interfaces';
import {Request} from '../static_request';
import {Response} from '../static_response';

import {BrowserJsonp} from './browser_jsonp';

const JSONP_ERR_NO_CALLBACK = 'JSONP injected script did not invoke callback.';
const JSONP_ERR_WRONG_METHOD = 'JSONP requests must use GET request method.';

/**
 * Base class for an in-flight JSONP request.
 *
 * @deprecated see https://angular.io/guide/http
 * @publicApi
 */
export class JSONPConnection implements Connection {
  // TODO(issue/24571): remove '!'.
  private _id !: string;
  // TODO(issue/24571): remove '!'.
  private _script !: Element;
  private _responseData: any;
  private _finished: boolean = false;

  /**
   * The {@link ReadyState} of this request.
   */
  // TODO(issue/24571): remove '!'.
  readyState !: ReadyState;

  /**
   * The outgoing HTTP request.
   */
  request: Request;

  /**
   * An observable that completes with the response, when the request is finished.
   */
  response: Observable<Response>;

  /** @internal */
  constructor(
      req: Request, private _dom: BrowserJsonp, private baseResponseOptions?: ResponseOptions) {
    if (req.method !== RequestMethod.Get) {
      throw new TypeError(JSONP_ERR_WRONG_METHOD);
    }
    this.request = req;
    this.response = new Observable<Response>((responseObserver: Observer<Response>) => {

      this.readyState = ReadyState.Loading;
      const id = this._id = _dom.nextRequestID();

      _dom.exposeConnection(id, this);

      // Workaround Dart
      // url = url.replace(/=JSONP_CALLBACK(&|$)/, `generated method`);
      const callback = _dom.requestCallback(this._id);
      let url: string = req.url;
      if (url.indexOf('=JSONP_CALLBACK&') > -1) {
        url = url.replace('=JSONP_CALLBACK&', `=${callback}&`);
      } else if (url.lastIndexOf('=JSONP_CALLBACK') === url.length - '=JSONP_CALLBACK'.length) {
        url = url.substring(0, url.length - '=JSONP_CALLBACK'.length) + `=${callback}`;
      }

      const script = this._script = _dom.build(url);

      const onLoad = (event: Event) => {
        if (this.readyState === ReadyState.Cancelled) return;
        this.readyState = ReadyState.Done;
        _dom.cleanup(script);
        if (!this._finished) {
          let responseOptions =
              new ResponseOptions({body: JSONP_ERR_NO_CALLBACK, type: ResponseType.Error, url});
          if (baseResponseOptions) {
            responseOptions = baseResponseOptions.merge(responseOptions);
          }
          responseObserver.error(new Response(responseOptions));
          return;
        }

        let responseOptions = new ResponseOptions({body: this._responseData, url});
        if (this.baseResponseOptions) {
          responseOptions = this.baseResponseOptions.merge(responseOptions);
        }

        responseObserver.next(new Response(responseOptions));
        responseObserver.complete();
      };

      const onError = (error: Error) => {
        if (this.readyState === ReadyState.Cancelled) return;
        this.readyState = ReadyState.Done;
        _dom.cleanup(script);
        let responseOptions = new ResponseOptions({body: error.message, type: ResponseType.Error});
        if (baseResponseOptions) {
          responseOptions = baseResponseOptions.merge(responseOptions);
        }
        responseObserver.error(new Response(responseOptions));
      };

      script.addEventListener('load', onLoad);
      script.addEventListener('error', onError);

      _dom.send(script);

      return () => {
        this.readyState = ReadyState.Cancelled;
        script.removeEventListener('load', onLoad);
        script.removeEventListener('error', onError);
        this._dom.cleanup(script);
      };
    });
  }

  /**
   * Callback called when the JSONP request completes, to notify the application
   * of the new data.
   */
  finished(data?: any) {
    // Don't leak connections
    this._finished = true;
    this._dom.removeConnection(this._id);
    if (this.readyState === ReadyState.Cancelled) return;
    this._responseData = data;
  }
}

/**
 * A {@link ConnectionBackend} that uses the JSONP strategy of making requests.
 *
 * @deprecated see https://angular.io/guide/http
 * @publicApi
 */
@Injectable()
export class JSONPBackend extends ConnectionBackend {
  /** @internal */
  constructor(private _browserJSONP: BrowserJsonp, private _baseResponseOptions: ResponseOptions) {
    super();
  }

  createConnection(request: Request): JSONPConnection {
    return new JSONPConnection(request, this._browserJSONP, this._baseResponseOptions);
  }
}
