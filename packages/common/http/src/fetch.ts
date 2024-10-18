/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {inject, Injectable, NgZone} from '@angular/core';
import {Observable, Observer} from 'rxjs';

import {HttpBackend} from './backend';
import {HttpHeaders} from './headers';
import {HttpRequest} from './request';
import {
  HTTP_STATUS_CODE_OK,
  HttpDownloadProgressEvent,
  HttpErrorResponse,
  HttpEvent,
  HttpEventType,
  HttpHeaderResponse,
  HttpResponse,
} from './response';

const XSSI_PREFIX = /^\)\]\}',?\n/;

const REQUEST_URL_HEADER = `X-Request-URL`;

/**
 * Determine an appropriate URL for the response, by checking either
 * response url or the X-Request-URL header.
 */
function getResponseUrl(response: Response): string | null {
  if (response.url) {
    return response.url;
  }
  // stored as lowercase in the map
  const xRequestUrl = REQUEST_URL_HEADER.toLocaleLowerCase();
  return response.headers.get(xRequestUrl);
}

/**
 * Uses `fetch` to send requests to a backend server.
 *
 * This `FetchBackend` requires the support of the
 * [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) which is available on all
 * supported browsers and on Node.js v18 or later.
 *
 * @see {@link HttpHandler}
 *
 * @publicApi
 */
@Injectable()
export class FetchBackend implements HttpBackend {
  // We use an arrow function to always reference the current global implementation of `fetch`.
  // This is helpful for cases when the global `fetch` implementation is modified by external code,
  // see https://github.com/angular/angular/issues/57527.
  private readonly fetchImpl =
    inject(FetchFactory, {optional: true})?.fetch ?? ((...args) => globalThis.fetch(...args));
  private readonly ngZone = inject(NgZone);

  handle(request: HttpRequest<any>): Observable<HttpEvent<any>> {
    return new Observable((observer) => {
      const aborter = new AbortController();

      this.doRequest(request, aborter.signal, observer).then(noop, (error) =>
        observer.error(new HttpErrorResponse({error})),
      );

      if (request.timeout) {
        this.ngZone.runOutsideAngular(() => {
          setTimeout(() => {
            if (!aborter.signal.aborted) {
              aborter.abort(new DOMException('signal timed out', 'TimeoutError'));
            }
          }, request.timeout);
        });
      }

      return () => aborter.abort();
    });
  }

  private async doRequest(
    request: HttpRequest<any>,
    signal: AbortSignal,
    observer: Observer<HttpEvent<any>>,
  ): Promise<void> {
    const init = this.createRequestInit(request);
    let response;

    try {
      // Run fetch outside of Angular zone.
      // This is due to Node.js fetch implementation (Undici) which uses a number of setTimeouts to check if
      // the response should eventually timeout which causes extra CD cycles every 500ms
      const fetchPromise = this.ngZone.runOutsideAngular(() =>
        this.fetchImpl(request.urlWithParams, {signal, ...init}),
      );

      // Make sure Zone.js doesn't trigger false-positive unhandled promise
      // error in case the Promise is rejected synchronously. See function
      // description for additional information.
      silenceSuperfluousUnhandledPromiseRejection(fetchPromise);

      // Send the `Sent` event before awaiting the response.
      observer.next({type: HttpEventType.Sent});

      response = await fetchPromise;
    } catch (error: any) {
      observer.error(
        new HttpErrorResponse({
          error,
          status: error.status ?? 0,
          statusText: error.statusText,
          url: request.urlWithParams,
          headers: error.headers,
        }),
      );
      return;
    }

    const headers = new HttpHeaders(response.headers);
    const statusText = response.statusText;
    const url = getResponseUrl(response) ?? request.urlWithParams;

    let status = response.status;
    let body: string | ArrayBuffer | Blob | object | null = null;

    if (request.reportProgress) {
      observer.next(new HttpHeaderResponse({headers, status, statusText, url}));
    }

    if (response.body) {
      // Read Progress
      const contentLength = response.headers.get('content-length');
      const chunks: Uint8Array[] = [];
      const reader = response.body.getReader();
      let receivedLength = 0;

      let decoder: TextDecoder;
      let partialText: string | undefined;

      // We have to check whether the Zone is defined in the global scope because this may be called
      // when the zone is nooped.
      const reqZone = typeof Zone !== 'undefined' && Zone.current;

      // Perform response processing outside of Angular zone to
      // ensure no excessive change detection runs are executed
      // Here calling the async ReadableStreamDefaultReader.read() is responsible for triggering CD
      await this.ngZone.runOutsideAngular(async () => {
        while (true) {
          const {done, value} = await reader.read();

          if (done) {
            break;
          }

          chunks.push(value);
          receivedLength += value.length;

          if (request.reportProgress) {
            partialText =
              request.responseType === 'text'
                ? (partialText ?? '') +
                  (decoder ??= new TextDecoder()).decode(value, {stream: true})
                : undefined;

            const reportProgress = () =>
              observer.next({
                type: HttpEventType.DownloadProgress,
                total: contentLength ? +contentLength : undefined,
                loaded: receivedLength,
                partialText,
              } as HttpDownloadProgressEvent);
            reqZone ? reqZone.run(reportProgress) : reportProgress();
          }
        }
      });

      // Combine all chunks.
      const chunksAll = this.concatChunks(chunks, receivedLength);
      try {
        const contentType = response.headers.get('Content-Type') ?? '';
        body = this.parseBody(request, chunksAll, contentType);
      } catch (error) {
        // Body loading or parsing failed
        observer.error(
          new HttpErrorResponse({
            error,
            headers: new HttpHeaders(response.headers),
            status: response.status,
            statusText: response.statusText,
            url: getResponseUrl(response) ?? request.urlWithParams,
          }),
        );
        return;
      }
    }

    // Same behavior as the XhrBackend
    if (status === 0) {
      status = body ? HTTP_STATUS_CODE_OK : 0;
    }

    // ok determines whether the response will be transmitted on the event or
    // error channel. Unsuccessful status codes (not 2xx) will always be errors,
    // but a successful status code can still result in an error if the user
    // asked for JSON data and the body cannot be parsed as such.
    const ok = status >= 200 && status < 300;

    if (ok) {
      observer.next(
        new HttpResponse({
          body,
          headers,
          status,
          statusText,
          url,
        }),
      );

      // The full body has been received and delivered, no further events
      // are possible. This request is complete.
      observer.complete();
    } else {
      observer.error(
        new HttpErrorResponse({
          error: body,
          headers,
          status,
          statusText,
          url,
        }),
      );
    }
  }

  private parseBody(
    request: HttpRequest<any>,
    binContent: Uint8Array,
    contentType: string,
  ): string | ArrayBuffer | Blob | object | null {
    switch (request.responseType) {
      case 'json':
        // stripping the XSSI when present
        const text = new TextDecoder().decode(binContent).replace(XSSI_PREFIX, '');
        return text === '' ? null : (JSON.parse(text) as object);
      case 'text':
        return new TextDecoder().decode(binContent);
      case 'blob':
        return new Blob([binContent], {type: contentType});
      case 'arraybuffer':
        return binContent.buffer;
    }
  }

  private createRequestInit(req: HttpRequest<any>): RequestInit {
    // We could share some of this logic with the XhrBackend

    const headers: Record<string, string> = {};
    const credentials: RequestCredentials | undefined = req.withCredentials ? 'include' : undefined;

    // Setting all the requested headers.
    req.headers.forEach((name, values) => (headers[name] = values.join(',')));

    // Add an Accept header if one isn't present already.
    if (!req.headers.has('Accept')) {
      headers['Accept'] = 'application/json, text/plain, */*';
    }

    // Auto-detect the Content-Type header if one isn't present already.
    if (!req.headers.has('Content-Type')) {
      const detectedType = req.detectContentTypeHeader();
      // Sometimes Content-Type detection fails.
      if (detectedType !== null) {
        headers['Content-Type'] = detectedType;
      }
    }

    return {
      body: req.serializeBody(),
      method: req.method,
      headers,
      credentials,
    };
  }

  private concatChunks(chunks: Uint8Array[], totalLength: number): Uint8Array {
    const chunksAll = new Uint8Array(totalLength);
    let position = 0;
    for (const chunk of chunks) {
      chunksAll.set(chunk, position);
      position += chunk.length;
    }

    return chunksAll;
  }
}

/**
 * Abstract class to provide a mocked implementation of `fetch()`
 */
export abstract class FetchFactory {
  abstract fetch: typeof fetch;
}

function noop(): void {}

/**
 * Zone.js treats a rejected promise that has not yet been awaited
 * as an unhandled error. This function adds a noop `.then` to make
 * sure that Zone.js doesn't throw an error if the Promise is rejected
 * synchronously.
 */
function silenceSuperfluousUnhandledPromiseRejection(promise: Promise<unknown>) {
  promise.then(noop, noop);
}
