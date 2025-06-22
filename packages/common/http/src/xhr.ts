/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {XhrFactory} from '../../index';
import {
  Injectable,
  ɵRuntimeError as RuntimeError,
  ɵformatRuntimeError as formatRuntimeError,
} from '@angular/core';
import {from, Observable, Observer, of} from 'rxjs';
import {switchMap} from 'rxjs/operators';

import {HttpBackend} from './backend';
import {RuntimeErrorCode} from './errors';
import {HttpHeaders} from './headers';
import {
  ACCEPT_HEADER,
  ACCEPT_HEADER_VALUE,
  CONTENT_TYPE_HEADER,
  HttpRequest,
  X_REQUEST_URL_HEADER,
} from './request';
import {
  HTTP_STATUS_CODE_NO_CONTENT,
  HTTP_STATUS_CODE_OK,
  HttpDownloadProgressEvent,
  HttpErrorResponse,
  HttpEvent,
  HttpEventType,
  HttpHeaderResponse,
  HttpJsonParseError,
  HttpResponse,
  HttpUploadProgressEvent,
} from './response';

const XSSI_PREFIX = /^\)\]\}',?\n/;

const X_REQUEST_URL_REGEXP = RegExp(`^${X_REQUEST_URL_HEADER}:`, 'm');

/**
 * Determine an appropriate URL for the response, by checking either
 * XMLHttpRequest.responseURL or the X-Request-URL header.
 */
function getResponseUrl(xhr: any): string | null {
  if ('responseURL' in xhr && xhr.responseURL) {
    return xhr.responseURL;
  }
  if (X_REQUEST_URL_REGEXP.test(xhr.getAllResponseHeaders())) {
    return xhr.getResponseHeader(X_REQUEST_URL_HEADER);
  }
  return null;
}

/**
 * Uses `XMLHttpRequest` to send requests to a backend server.
 * @see {@link HttpHandler}
 * @see {@link JsonpClientBackend}
 *
 * @publicApi
 */
@Injectable()
export class HttpXhrBackend implements HttpBackend {
  constructor(private xhrFactory: XhrFactory) {}

  /**
   * Processes a request and returns a stream of response events.
   * @param req The request object.
   * @returns An observable of the response events.
   */
  handle(req: HttpRequest<any>): Observable<HttpEvent<any>> {
    // Quick check to give a better error message when a user attempts to use
    // HttpClient.jsonp() without installing the HttpClientJsonpModule
    if (req.method === 'JSONP') {
      throw new RuntimeError(
        RuntimeErrorCode.MISSING_JSONP_MODULE,
        (typeof ngDevMode === 'undefined' || ngDevMode) &&
          `Cannot make a JSONP request without JSONP support. To fix the problem, either add the \`withJsonpSupport()\` call (if \`provideHttpClient()\` is used) or import the \`HttpClientJsonpModule\` in the root NgModule.`,
      );
    }

    if (req.keepalive && ngDevMode) {
      console.warn(
        formatRuntimeError(
          RuntimeErrorCode.KEEPALIVE_NOT_SUPPORTED_WITH_XHR,
          `Angular detected that a \`HttpClient\` request with the \`keepalive\` option was sent using XHR, which does not support it. To use the \`keepalive\` option, enable Fetch API support by passing \`withFetch()\` as an argument to \`provideHttpClient()\`.`,
        ),
      );
    }

    // Check whether this factory has a special function to load an XHR implementation
    // for various non-browser environments. We currently limit it to only `ServerXhr`
    // class, which needs to load an XHR implementation.
    const xhrFactory: XhrFactory & {ɵloadImpl?: () => Promise<void>} = this.xhrFactory;
    const source: Observable<void | null> =
      // Note that `ɵloadImpl` is never defined in client bundles and can be
      // safely dropped whenever we're running in the browser.
      // This branching is redundant.
      // The `ngServerMode` guard also enables tree-shaking of the `from()`
      // function from the common bundle, as it's only used in server code.
      typeof ngServerMode !== 'undefined' && ngServerMode && xhrFactory.ɵloadImpl
        ? from(xhrFactory.ɵloadImpl())
        : of(null);

    return source.pipe(
      switchMap(() => {
        // Everything happens on Observable subscription.
        return new Observable((observer: Observer<HttpEvent<any>>) => {
          // Start by setting up the XHR object with request method, URL, and withCredentials
          // flag.
          const xhr = xhrFactory.build();
          xhr.open(req.method, req.urlWithParams);
          if (req.withCredentials) {
            xhr.withCredentials = true;
          }

          // Add all the requested headers.
          req.headers.forEach((name, values) => xhr.setRequestHeader(name, values.join(',')));

          // Add an Accept header if one isn't present already.
          if (!req.headers.has(ACCEPT_HEADER)) {
            xhr.setRequestHeader(ACCEPT_HEADER, ACCEPT_HEADER_VALUE);
          }

          // Auto-detect the Content-Type header if one isn't present already.
          if (!req.headers.has(CONTENT_TYPE_HEADER)) {
            const detectedType = req.detectContentTypeHeader();
            // Sometimes Content-Type detection fails.
            if (detectedType !== null) {
              xhr.setRequestHeader(CONTENT_TYPE_HEADER, detectedType);
            }
          }

          // Set the responseType if one was requested.
          if (req.responseType) {
            const responseType = req.responseType.toLowerCase();

            // JSON responses need to be processed as text. This is because if the server
            // returns an XSSI-prefixed JSON response, the browser will fail to parse it,
            // xhr.response will be null, and xhr.responseText cannot be accessed to
            // retrieve the prefixed JSON data in order to strip the prefix. Thus, all JSON
            // is parsed by first requesting text and then applying JSON.parse.
            xhr.responseType = (responseType !== 'json' ? responseType : 'text') as any;
          }

          // Serialize the request body if one is present. If not, this will be set to null.
          const reqBody = req.serializeBody();

          // If progress events are enabled, response headers will be delivered
          // in two events - the HttpHeaderResponse event and the full HttpResponse
          // event. However, since response headers don't change in between these
          // two events, it doesn't make sense to parse them twice. So headerResponse
          // caches the data extracted from the response whenever it's first parsed,
          // to ensure parsing isn't duplicated.
          let headerResponse: HttpHeaderResponse | null = null;

          // partialFromXhr extracts the HttpHeaderResponse from the current XMLHttpRequest
          // state, and memoizes it into headerResponse.
          const partialFromXhr = (): HttpHeaderResponse => {
            if (headerResponse !== null) {
              return headerResponse;
            }

            const statusText = xhr.statusText || 'OK';

            // Parse headers from XMLHttpRequest - this step is lazy.
            const headers = new HttpHeaders(xhr.getAllResponseHeaders());

            // Read the response URL from the XMLHttpResponse instance and fall back on the
            // request URL.
            const url = getResponseUrl(xhr) || req.url;

            // Construct the HttpHeaderResponse and memoize it.
            headerResponse = new HttpHeaderResponse({headers, status: xhr.status, statusText, url});
            return headerResponse;
          };

          // Next, a few closures are defined for the various events which XMLHttpRequest can
          // emit. This allows them to be unregistered as event listeners later.

          // First up is the load event, which represents a response being fully available.
          const onLoad = () => {
            // Read response state from the memoized partial data.
            let {headers, status, statusText, url} = partialFromXhr();

            // The body will be read out if present.
            let body: any | null = null;

            if (status !== HTTP_STATUS_CODE_NO_CONTENT) {
              // Use XMLHttpRequest.response if set, responseText otherwise.
              body = typeof xhr.response === 'undefined' ? xhr.responseText : xhr.response;
            }

            // Normalize another potential bug (this one comes from CORS).
            if (status === 0) {
              status = !!body ? HTTP_STATUS_CODE_OK : 0;
            }

            // ok determines whether the response will be transmitted on the event or
            // error channel. Unsuccessful status codes (not 2xx) will always be errors,
            // but a successful status code can still result in an error if the user
            // asked for JSON data and the body cannot be parsed as such.
            let ok = status >= 200 && status < 300;

            // Check whether the body needs to be parsed as JSON (in many cases the browser
            // will have done that already).
            if (req.responseType === 'json' && typeof body === 'string') {
              // Save the original body, before attempting XSSI prefix stripping.
              const originalBody = body;
              body = body.replace(XSSI_PREFIX, '');
              try {
                // Attempt the parse. If it fails, a parse error should be delivered to the
                // user.
                body = body !== '' ? JSON.parse(body) : null;
              } catch (error) {
                // Since the JSON.parse failed, it's reasonable to assume this might not have
                // been a JSON response. Restore the original body (including any XSSI prefix)
                // to deliver a better error response.
                body = originalBody;

                // If this was an error request to begin with, leave it as a string, it
                // probably just isn't JSON. Otherwise, deliver the parsing error to the user.
                if (ok) {
                  // Even though the response status was 2xx, this is still an error.
                  ok = false;
                  // The parse error contains the text of the body that failed to parse.
                  body = {error, text: body} as HttpJsonParseError;
                }
              }
            }

            if (ok) {
              // A successful response is delivered on the event stream.
              observer.next(
                new HttpResponse({
                  body,
                  headers,
                  status,
                  statusText,
                  url: url || undefined,
                }),
              );
              // The full body has been received and delivered, no further events
              // are possible. This request is complete.
              observer.complete();
            } else {
              // An unsuccessful request is delivered on the error channel.
              observer.error(
                new HttpErrorResponse({
                  // The error in this case is the response body (error from the server).
                  error: body,
                  headers,
                  status,
                  statusText,
                  url: url || undefined,
                }),
              );
            }
          };

          // The onError callback is called when something goes wrong at the network level.
          // Connection timeout, DNS error, offline, etc. These are actual errors, and are
          // transmitted on the error channel.
          const onError = (error: ProgressEvent) => {
            const {url} = partialFromXhr();
            const res = new HttpErrorResponse({
              error,
              status: xhr.status || 0,
              statusText: xhr.statusText || 'Unknown Error',
              url: url || undefined,
            });
            observer.error(res);
          };

          // The sentHeaders flag tracks whether the HttpResponseHeaders event
          // has been sent on the stream. This is necessary to track if progress
          // is enabled since the event will be sent on only the first download
          // progress event.
          let sentHeaders = false;

          // The download progress event handler, which is only registered if
          // progress events are enabled.
          const onDownProgress = (event: ProgressEvent) => {
            // Send the HttpResponseHeaders event if it hasn't been sent already.
            if (!sentHeaders) {
              observer.next(partialFromXhr());
              sentHeaders = true;
            }

            // Start building the download progress event to deliver on the response
            // event stream.
            let progressEvent: HttpDownloadProgressEvent = {
              type: HttpEventType.DownloadProgress,
              loaded: event.loaded,
            };

            // Set the total number of bytes in the event if it's available.
            if (event.lengthComputable) {
              progressEvent.total = event.total;
            }

            // If the request was for text content and a partial response is
            // available on XMLHttpRequest, include it in the progress event
            // to allow for streaming reads.
            if (req.responseType === 'text' && !!xhr.responseText) {
              progressEvent.partialText = xhr.responseText;
            }

            // Finally, fire the event.
            observer.next(progressEvent);
          };

          // The upload progress event handler, which is only registered if
          // progress events are enabled.
          const onUpProgress = (event: ProgressEvent) => {
            // Upload progress events are simpler. Begin building the progress
            // event.
            let progress: HttpUploadProgressEvent = {
              type: HttpEventType.UploadProgress,
              loaded: event.loaded,
            };

            // If the total number of bytes being uploaded is available, include
            // it.
            if (event.lengthComputable) {
              progress.total = event.total;
            }

            // Send the event.
            observer.next(progress);
          };

          // By default, register for load and error events.
          xhr.addEventListener('load', onLoad);
          xhr.addEventListener('error', onError);
          xhr.addEventListener('timeout', onError);
          xhr.addEventListener('abort', onError);

          // Progress events are only enabled if requested.
          if (req.reportProgress) {
            // Download progress is always enabled if requested.
            xhr.addEventListener('progress', onDownProgress);

            // Upload progress depends on whether there is a body to upload.
            if (reqBody !== null && xhr.upload) {
              xhr.upload.addEventListener('progress', onUpProgress);
            }
          }

          // Fire the request, and notify the event stream that it was fired.
          xhr.send(reqBody!);
          observer.next({type: HttpEventType.Sent});
          // This is the return from the Observable function, which is the
          // request cancellation handler.
          return () => {
            // On a cancellation, remove all registered event listeners.
            xhr.removeEventListener('error', onError);
            xhr.removeEventListener('abort', onError);
            xhr.removeEventListener('load', onLoad);
            xhr.removeEventListener('timeout', onError);

            if (req.reportProgress) {
              xhr.removeEventListener('progress', onDownProgress);
              if (reqBody !== null && xhr.upload) {
                xhr.upload.removeEventListener('progress', onUpProgress);
              }
            }

            // Finally, abort the in-flight request.
            if (xhr.readyState !== xhr.DONE) {
              xhr.abort();
            }
          };
        });
      }),
    );
  }
}
