/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DOCUMENT} from '@angular/common';
import {EnvironmentInjector, Inject, inject, Injectable} from '@angular/core';
import {Observable, Observer} from 'rxjs';

import {HttpBackend, HttpHandler} from './backend';
import {HttpHandlerFn} from './interceptor';
import {HttpRequest} from './request';
import {HttpErrorResponse, HttpEvent, HttpEventType, HttpResponse, HttpStatusCode} from './response';


// Every request made through JSONP needs a callback name that's unique across the
// whole page. Each request is assigned an id and the callback name is constructed
// from that. The next id to be assigned is tracked in a global variable here that
// is shared among all applications on the page.
let nextRequestId: number = 0;

/**
 * When a pending <script> is unsubscribed we'll move it to this document, so it won't be
 * executed.
 */
let foreignDocument: Document|undefined;

// Error text given when a JSONP script is injected, but doesn't invoke the callback
// passed in its URL.
export const JSONP_ERR_NO_CALLBACK = 'JSONP injected script did not invoke callback.';

// Error text given when a request is passed to the JsonpClientBackend that doesn't
// have a request method JSONP.
export const JSONP_ERR_WRONG_METHOD = 'JSONP requests must use JSONP request method.';
export const JSONP_ERR_WRONG_RESPONSE_TYPE = 'JSONP requests must use Json response type.';

// Error text given when a request is passed to the JsonpClientBackend that has
// headers set
export const JSONP_ERR_HEADERS_NOT_SUPPORTED = 'JSONP requests do not support headers.';

/**
 * DI token/abstract type representing a map of JSONP callbacks.
 *
 * In the browser, this should always be the `window` object.
 *
 *
 */
export abstract class JsonpCallbackContext {
  [key: string]: (data: any) => void;
}

/**
 * Factory function that determines where to store JSONP callbacks.
 *
 * Ordinarily JSONP callbacks are stored on the `window` object, but this may not exist
 * in test environments. In that case, callbacks are stored on an anonymous object instead.
 *
 *
 */
export function jsonpCallbackContext(): Object {
  if (typeof window === 'object') {
    return window;
  }
  return {};
}

/**
 * Processes an `HttpRequest` with the JSONP method,
 * by performing JSONP style requests.
 * @see `HttpHandler`
 * @see `HttpXhrBackend`
 *
 * @publicApi
 */
@Injectable()
export class JsonpClientBackend implements HttpBackend {
  /**
   * A resolved promise that can be used to schedule microtasks in the event handlers.
   */
  private readonly resolvedPromise = Promise.resolve();

  constructor(private callbackMap: JsonpCallbackContext, @Inject(DOCUMENT) private document: any) {}

  /**
   * Get the name of the next callback method, by incrementing the global `nextRequestId`.
   */
  private nextCallback(): string {
    return `ng_jsonp_callback_${nextRequestId++}`;
  }

  /**
   * Processes a JSONP request and returns an event stream of the results.
   * @param req The request object.
   * @returns An observable of the response events.
   *
   */
  handle(req: HttpRequest<never>): Observable<HttpEvent<any>> {
    // Firstly, check both the method and response type. If either doesn't match
    // then the request was improperly routed here and cannot be handled.
    if (req.method !== 'JSONP') {
      throw new Error(JSONP_ERR_WRONG_METHOD);
    } else if (req.responseType !== 'json') {
      throw new Error(JSONP_ERR_WRONG_RESPONSE_TYPE);
    }

    // Check the request headers. JSONP doesn't support headers and
    // cannot set any that were supplied.
    if (req.headers.keys().length > 0) {
      throw new Error(JSONP_ERR_HEADERS_NOT_SUPPORTED);
    }

    // Everything else happens inside the Observable boundary.
    return new Observable<HttpEvent<any>>((observer: Observer<HttpEvent<any>>) => {
      // The first step to make a request is to generate the callback name, and replace the
      // callback placeholder in the URL with the name. Care has to be taken here to ensure
      // a trailing &, if matched, gets inserted back into the URL in the correct place.
      const callback = this.nextCallback();
      const url = req.urlWithParams.replace(/=JSONP_CALLBACK(&|$)/, `=${callback}$1`);

      // Construct the <script> tag and point it at the URL.
      const node = this.document.createElement('script');
      node.src = url;

      // A JSONP request requires waiting for multiple callbacks. These variables
      // are closed over and track state across those callbacks.

      // The response object, if one has been received, or null otherwise.
      let body: any|null = null;

      // Whether the response callback has been called.
      let finished: boolean = false;

      // Set the response callback in this.callbackMap (which will be the window
      // object in the browser. The script being loaded via the <script> tag will
      // eventually call this callback.
      this.callbackMap[callback] = (data?: any) => {
        // Data has been received from the JSONP script. Firstly, delete this callback.
        delete this.callbackMap[callback];

        // Set state to indicate data was received.
        body = data;
        finished = true;
      };

      // cleanup() is a utility closure that removes the <script> from the page and
      // the response callback from the window. This logic is used in both the
      // success, error, and cancellation paths, so it's extracted out for convenience.
      const cleanup = () => {
        // Remove the <script> tag if it's still on the page.
        if (node.parentNode) {
          node.parentNode.removeChild(node);
        }

        // Remove the response callback from the callbackMap (window object in the
        // browser).
        delete this.callbackMap[callback];
      };

      // onLoad() is the success callback which runs after the response callback
      // if the JSONP script loads successfully. The event itself is unimportant.
      // If something went wrong, onLoad() may run without the response callback
      // having been invoked.
      const onLoad = (event: Event) => {
        // We wrap it in an extra Promise, to ensure the microtask
        // is scheduled after the loaded endpoint has executed any potential microtask itself,
        // which is not guaranteed in Internet Explorer and EdgeHTML. See issue #39496
        this.resolvedPromise.then(() => {
          // Cleanup the page.
          cleanup();

          // Check whether the response callback has run.
          if (!finished) {
            // It hasn't, something went wrong with the request. Return an error via
            // the Observable error path. All JSONP errors have status 0.
            observer.error(new HttpErrorResponse({
              url,
              status: 0,
              statusText: 'JSONP Error',
              error: new Error(JSONP_ERR_NO_CALLBACK),
            }));
            return;
          }

          // Success. body either contains the response body or null if none was
          // returned.
          observer.next(new HttpResponse({
            body,
            status: HttpStatusCode.Ok,
            statusText: 'OK',
            url,
          }));

          // Complete the stream, the response is over.
          observer.complete();
        });
      };

      // onError() is the error callback, which runs if the script returned generates
      // a Javascript error. It emits the error via the Observable error channel as
      // a HttpErrorResponse.
      const onError: any = (error: Error) => {
        cleanup();

        // Wrap the error in a HttpErrorResponse.
        observer.error(new HttpErrorResponse({
          error,
          status: 0,
          statusText: 'JSONP Error',
          url,
        }));
      };

      // Subscribe to both the success (load) and error events on the <script> tag,
      // and add it to the page.
      node.addEventListener('load', onLoad);
      node.addEventListener('error', onError);
      this.document.body.appendChild(node);

      // The request has now been successfully sent.
      observer.next({type: HttpEventType.Sent});

      // Cancellation handler.
      return () => {
        if (!finished) {
          this.removeListeners(node);
        }

        // And finally, clean up the page.
        cleanup();
      };
    });
  }

  private removeListeners(script: HTMLScriptElement): void {
    // Issue #34818
    // Changing <script>'s ownerDocument will prevent it from execution.
    // https://html.spec.whatwg.org/multipage/scripting.html#execute-the-script-block
    if (!foreignDocument) {
      foreignDocument = (this.document.implementation as DOMImplementation).createHTMLDocument();
    }
    foreignDocument.adoptNode(script);
  }
}

/**
 * Identifies requests with the method JSONP and shifts them to the `JsonpClientBackend`.
 */
export function jsonpInterceptorFn(
    req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  if (req.method === 'JSONP') {
    return inject(JsonpClientBackend).handle(req as HttpRequest<never>);
  }

  // Fall through for normal HTTP requests.
  return next(req);
}

/**
 * Identifies requests with the method JSONP and
 * shifts them to the `JsonpClientBackend`.
 *
 * @see `HttpInterceptor`
 *
 * @publicApi
 */
@Injectable()
export class JsonpInterceptor {
  constructor(private injector: EnvironmentInjector) {}

  /**
   * Identifies and handles a given JSONP request.
   * @param initialRequest The outgoing request object to handle.
   * @param next The next interceptor in the chain, or the backend
   * if no interceptors remain in the chain.
   * @returns An observable of the event stream.
   */
  intercept(initialRequest: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return this.injector.runInContext(
        () => jsonpInterceptorFn(
            initialRequest, downstreamRequest => next.handle(downstreamRequest)));
  }
}
