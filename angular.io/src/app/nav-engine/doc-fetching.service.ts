import { Http, Response } from '@angular/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';

import { Logger } from '../logger.service';

@Injectable()
export class DocFetchingService {

  constructor(private http: Http, private logger: Logger) { }

  /**
   * Fetch document from server.
   * NB: pass 404 response to caller as empty string content
   * Other errors and non-OK status responses are thrown errors.
   * TODO: add timeout and retry for lost connection
   */
  getFile(url: string): Observable<string> {

    if (!url) {
      const emsg = 'getFile: no URL';
      this.logger.error(emsg);
      throw new Error(emsg);
    }

    this.logger.log('fetching document file at ', url);

    return this.http.get(url)
      .map(res => res.text())
      .do(content => this.logger.log('fetched document file at ', url) )
      .catch((error: Response) => {
        if (error.status === 404) {
          this.logger.error(`Document file not found at '$(url)'`);
          return of('');
        } else {
          throw error;
        }
      });
  }
}
