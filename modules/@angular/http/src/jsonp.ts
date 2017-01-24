/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable, NgModule} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Observer} from 'rxjs/Observer';

import {HttpBackend} from './backend';
import {Http} from './http';
import {HTTP_INTERCEPTORS, HttpInterceptor} from './interceptor';
import {HttpRequest, HttpResponse} from './request_response';


export const JSONP_ERR_NO_CALLBACK = 'JSONP injected script did not invoke callback.';
export const JSONP_ERR_WRONG_METHOD = 'JSONP requests must use JSONP request method.';

let nextRequestId = 0;
const JSONP_HOME = '__ng_jsonp__';

/**
 * Adapts {@link JsonpBackend} to the browser environment.
 *
 * Can be overridden by the user to implement custom behavior, for example if a different
 * scheme for choosing JSONP callback names is desired.
 */
@Injectable()
export class JsonpAdapter {
  /**
   * Create a new `<script>` element.
   */
  createScript(): HTMLScriptElement { return document.createElement('script'); }

  /**
   * An accessor for document.body.
   */
  get body(): HTMLBodyElement { return document.body as HTMLBodyElement; }

  /**
   * A map on which callbacks will be stored under their `callbackIndex`.
   */
  get callbackMap(): {[key: string]: Function} {
    if (typeof window === 'object') {
      const w = window as any;
      if (!w[JSONP_HOME]) {
        w[JSONP_HOME] = {};
      }
      return w[JSONP_HOME];
    } else {
      return {};
    }
  }

  /**
   * Index of the callback into `callbackMap`.
   */
  callbackIndex(id: number): string { return `__req${id}`; }

  /**
   * Full path to the callback as seen from the global scope. This will be sent to the
   * server as the JSONP callback.
   */
  callback(id: number): string { return `${JSONP_HOME}.__req${id}`; }
}

/**
 * An {@link HttpBackend} that handles requests by making a JSONP call.
 *
 * Throws when asked to handle a request that doesn't have the method 'JSONP'.
 */
@Injectable()
export class JsonpBackend implements HttpBackend {
  private nextRequestId: number = 0;

  constructor(private adapter: JsonpAdapter) {}

  handle(req: HttpRequest): Observable<HttpResponse> {
    if (req.method.toUpperCase() !== 'JSONP') {
      throw new TypeError(JSONP_ERR_WRONG_METHOD);
    }

    // All the action happens in an Observable, allowing retries if necessary.
    return new Observable<HttpResponse>((observer: Observer<HttpResponse>) => {
      // Allocate a request id and create a <script> node with the appropriate URL.
      const id = this.nextRequestId++;
      const callbackIndex = this.adapter.callbackIndex(id);
      const url = req.url.replace(/=JSONP_CALLBACK(&|$)/, `=${this.adapter.callback(id)}$1`);
      const node: HTMLScriptElement = this.adapter.createScript();
      node.src = url;

      // State of the request.
      let data: any = null;
      let finished: boolean = false;
      let cancelled: boolean = false;

      // Function which cleans up the DOM and unregisters the callback.
      const cleanup = () => {
        if (node.parentNode) {
          node.parentNode.removeChild(node);
        }
        delete this.adapter.callbackMap[callbackIndex];
      };

      // Set the callback in the adapter, making it available when the <script> loads.
      this.adapter.callbackMap[callbackIndex] = (optData?: any) => {
        // When data is received, first remove the callback.
        delete this.adapter.callbackMap[callbackIndex];

        // If this request has been cancelled, do nothing.
        if (cancelled) {
          return;
        }

        // Otherwise, update state to indicate data has been successfully received.
        data = optData;
        finished = true;
      };

      // Called when the script successfully loads. By this point, the callback should
      // have been called.
      const onLoad = (event: Event) => {
        if (cancelled) {
          return;
        }
        cleanup();

        // If no response has been received yet, send an error.
        if (!finished) {
          const response = new HttpResponse({body: JSONP_ERR_NO_CALLBACK, status: 502});
          observer.error(response);
          return;
        }

        // Complete with a successful response.
        observer.next(new HttpResponse({url, body: data}));
        observer.complete();
      };

      // Called when the script errors.
      const onError: any = (err: Error) => {
        if (cancelled) {
          return;
        }
        cleanup();

        // Complete with the error.
        observer.error(new HttpResponse({body: err.message, status: 502}));
      };

      // Add the node to the body.
      node.addEventListener('load', onLoad);
      node.addEventListener('error', onError);
      this.adapter.body.appendChild(node);

      // On unsubscription, cancel the outgoing JSONP request.
      return () => {
        cancelled = true;
        node.removeEventListener('load', onLoad);
        node.removeEventListener('error', onError);
        cleanup();
      };
    });
  }
}

/**
 * An {@link HttpInterceptor} which sends requests with the method 'JSONP' to the
 * {@link Jsonpbackend} instead of continuing the request chain.
 *
 * Should be the last interceptor in the chain.
 */
@Injectable()
export class JsonpInterceptor implements HttpInterceptor {
  constructor(private jsonp: JsonpBackend) {}

  intercept(req: HttpRequest, next: HttpBackend): Observable<HttpResponse> {
    if (req.method.toUpperCase() !== 'JSONP') {
      return next.handle(req);
    }
    return this.jsonp.handle(req);
  }
}

/**
 * An injectable entrypoint to the JSONP mechanism.
 */
@Injectable()
export class Jsonp {
  constructor(private http: Http) {}

  get(url: string): Observable<HttpResponse> { return this.http.request(url, {method: 'JSONP'}); }
}

/**
 * Configures support for JSONP in an Angular application.
 *
 * Due to the ordering of interceptors, it should be installed after any application
 * interceptors are configured.
 */
@NgModule({
  providers: [
    Jsonp,
    JsonpAdapter,
    JsonpBackend,
    {provide: HTTP_INTERCEPTORS, useClass: JsonpInterceptor, multi: true},
  ],
})
export class JsonpModule {
}
