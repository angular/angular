/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable, Optional} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Observer} from 'rxjs/Observer';

import {HttpHeaders} from './headers';
import {HttpBody, HttpRequest, HttpResponse} from './request_response';
import {ArrayBuffer, Blob, FormData} from './scope';
import {HttpUrlParams} from './url_params';

const XSSI_PREFIX = /^\)\]\}',?\n/;

export function getResponseURL(xhr: any): string {
  if ('responseURL' in xhr) {
    return xhr.responseURL;
  }
  if (/^X-Request-URL:/m.test(xhr.getAllResponseHeaders())) {
    return xhr.getResponseHeader('X-Request-URL');
  }
  return;
}

export abstract class HttpBackend { abstract handle(req: HttpRequest): Observable<HttpResponse>; }

@Injectable()
export class XhrAdapter {
  newXhr(): XMLHttpRequest { return new XMLHttpRequest(); }
}

function serializeBody(req: HttpRequest): ArrayBuffer|Blob|FormData|string|null {
  if (!req.body) {
    return null;
  }
  if (req.body instanceof ArrayBuffer || req.body instanceof Blob || req.body instanceof FormData) {
    return req.body as ArrayBuffer | Blob | FormData | string;
  }
  if (req.body instanceof HttpUrlParams) {
    return req.body.toString();
  }
  return req.text();
}

@Injectable()
export class XhrBackend implements HttpBackend {
  constructor(private xhrAdapter: XhrAdapter) {}

  handle(req: HttpRequest): Observable<HttpResponse> {
    return new Observable<HttpResponse>((observer: Observer<HttpResponse>) => {
      const _xhr: XMLHttpRequest = this.xhrAdapter.newXhr();
      _xhr.open(req.method.toUpperCase(), req.url);
      _xhr.withCredentials = req.withCredentials;

      // load event handler
      const onLoad = () => {
        // normalize IE9 bug (http://bugs.jquery.com/ticket/1450)
        let status: number = _xhr.status === 1223 ? 204 : _xhr.status;

        let body: any = null;

        // HTTP 204 means no content
        if (status !== 204) {
          // responseText is the old-school way of retrieving response (supported by IE8 & 9)
          // response/responseType properties were introduced in ResourceLoader Level2 spec
          // (supported by IE10)
          body = (typeof _xhr.response === 'undefined') ? _xhr.responseText : _xhr.response;

          // Implicitly strip a potential XSSI prefix.
          if (typeof body === 'string') {
            body = body.replace(XSSI_PREFIX, '');
          }
        }

        // fix status code when it is 0 (0 status is undocumented).
        // Occurs when accessing file resources or on Android 4.1 stock browser
        // while retrieving files from application cache.
        if (status === 0) {
          status = body ? 200 : 0;
        }

        const headers: HttpHeaders =
            HttpHeaders.fromResponseHeaderString(_xhr.getAllResponseHeaders());
        // IE 9 does not provide the way to get URL of response
        const statusText: string = _xhr.statusText || 'OK';

        const url = getResponseURL(_xhr) || req.url;
        const response = new HttpResponse({body, status, statusText, headers, url});

        if (response.ok) {
          observer.next(response);
          // TODO(gdi2290): defer complete if array buffer until done
          observer.complete();
          return;
        }
        observer.error(response);
      };

      // error event handler
      const onError = (err: ErrorEvent) => {
        observer.error(new HttpResponse({
          body: err.message,
          status: _xhr.status,
          statusText: _xhr.statusText,
        }));
      };

      Array.from(req.headers.keys())
          .forEach(name => _xhr.setRequestHeader(name, req.headers.getAll(name).join(',')));

      if (req.responseTypeHint !== 'unknown') {
        _xhr.responseType = req.responseTypeHint;
      }

      _xhr.addEventListener('load', onLoad);
      _xhr.addEventListener('error', onError);

      _xhr.send(serializeBody(req));

      return () => {
        _xhr.removeEventListener('load', onLoad);
        _xhr.removeEventListener('error', onError);
        _xhr.abort();
      };
    });
  }
}
