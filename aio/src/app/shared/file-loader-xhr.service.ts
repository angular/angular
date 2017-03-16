import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { FileLoaderService, Response } from './file-loader.service';
export { Response }

/**
 * All possible states in which a connection can be, based on
 * [States](http://www.w3.org/TR/XMLHttpRequest/#states) from the `XMLHttpRequest` spec
 */
enum ReadyState {
    Unsent = 0,
    Open = 1,
    HeadersReceived = 2,
    Loading = 3,
    Done = 4
}

// tslint:disable-next-line:class-name
class Response_ implements Response {
    ok: boolean;
    url: string;
    status: number;
    statusText: string;
    private _body: string;

    json(): any {
      return JSON.parse(this._body || '{}');
    };

    text(): string { return (this._body || '').toString(); }

    constructor({url, status, statusText, body}: {
      url?: string,
      status?: number,
      statusText?: string,
      body?: any
    }) {
      this.url = url || '';
      this.status = status || 0;
      this._body = body;
      this.ok = this.status >= 200 && this.status < 300;
      this.statusText = statusText || (this.ok ? 'ok' : '');
    }

    toString() {
      return `${this.status}: ${this.url}`;
    };
}

@Injectable()
export class XhrFileLoaderService {
  load(path: string) {
    return new Observable<Response>(observer => {
      if (!path) {
        observer.error(
          new Response_({url: path, status: 400, statusText: 'Bad Request', body: 'No url'})
        );
        return;
      }

      let xhr = new XMLHttpRequest();
      xhr.onload = complete;
      xhr.onerror = failed;
      xhr.open('GET', 'content/' + path);
      xhr.send();

      function complete (evt) {
        const { responseURL, status, statusText, responseText: body } = evt.srcElement;
        const resp: Response = new Response_({url: responseURL, status, statusText, body});
        if (resp.ok) {
          observer.next(resp);
          observer.complete();
        } else {
          observer.error(resp);
        }
      }

      function failed(evt) {
        // Todo: learn about error events, what causes them, and whether this is right.
        const { responseURL, status, statusText, responseText: body } = evt.srcElement;
        const resp: Response = new Response_({url: responseURL, status, statusText, body});
        observer.error(resp);
      }

      function unsubscribe() {
          if (xhr && xhr.readyState < 4) {
            xhr.abort();
          }
          xhr = undefined;
      }

      return { unsubscribe };
    });
  }
}

export const FileLoaderProviders = [
  { provide: FileLoaderService, useClass: XhrFileLoaderService }
];
