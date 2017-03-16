import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { FileLoaderService, Response } from './file-loader.service';
export { Response }

declare const System: { import: (string) => Promise<Response> };

// tslint:disable-next-line:class-name
class Response_ implements Response {
    ok: boolean;
    url: string;
    status: number;
    statusText: string;
    json: () => any;
    text: () => string;

    constructor({url, status, statusText, body}: {
      url?: string,
      status?: number,
      statusText?: string,
      body?: any
    }) {
      this.url = url || '';
      this.status = status || 0;
      this.ok = this.status >= 200 && this.status < 300;
      this.statusText = statusText || (this.ok ? 'ok' : '');

      if (typeof body === 'string') {
        this.json = () => JSON.parse(body || '{}');
        this.text = () => body;
      } else {
        this.json = () => body;
        this.text = () => JSON.stringify(body);
      }
    }

    toString() {
      return `${this.status}: ${this.url}`;
    };
}

@Injectable()
export class WebpackFileLoaderService {

  load(path: string) {
    let url: string;

    return new Observable<Response>(observer => {
      try {
        if (!path) {
          observer.error(
            new Response_({url: path, status: 400, statusText: 'Bad Request', body: 'No url'})
          );
          return;
        }

        const jsonIx = path.lastIndexOf('.json');
        if (jsonIx > - 1) { path = path.substr(0, jsonIx); }
        url = 'content/' + path + '.json';

        // note: System.import arg must be literals exactly like the following.
        // The prefix must be relative to the app root folder.
        System.import('../../content/' + path + '.json').then(
          text => {
            observer.next(new Response_({url, body: text}));
            observer.complete();
          },
          errorHandler
        );
      } catch (err) {
        errorHandler(err);
      }

      function errorHandler(err: any) {
        const respArgs = (err && /Cannot find/.test(err.message)) ?
          { url, status: 404, statusText: 'Not Found' } :
          { url, status: 500, statusText: 'Server or application error', body: err };
          observer.error(new Response_(respArgs));
      }
    });

  }
}

export const FileLoaderProviders = [
  { provide: FileLoaderService, useClass: WebpackFileLoaderService }
];
