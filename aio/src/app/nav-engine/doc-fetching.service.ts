import { Http, Response } from '@angular/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';

import { Doc, DocMetadata } from './doc.model';
import { Logger } from '../logger.service';

@Injectable()
export class DocFetchingService {

  private base = 'content/docs/';

  constructor(
    private http: Http,
    private logger: Logger) { }

  getPathFor(docId: string) {
    return this.base + addPathExtension(docId);
  }

  /**
   * Fetch document from server.
   * NB: pass 404 response to caller as Doc with empty string content
   * Other errors and non-OK status responses are thrown errors.
   * TODO: add timeout and retry for lost connection
   */
  fetchDoc(docId: string): Observable<Doc> {

    if (!docId) {
      const emsg = 'getFile: no document id';
      this.logger.error(emsg);
      throw new Error(emsg);
    }

    const url = this.getPathFor(docId);

    this.logger.log(`Fetching document file at '${url}'`);

    return this.http.get(url)
      .map(res => JSON.parse(res.text()))
      .map(json => <Doc> { metadata: { docId, title: json.title }, content: json.content })
      .do(content => this.logger.log(`Fetched document '${docId}' at '${url}'`) )
      .catch((error: Response) => {
        if (error.status === 404) {
          this.logger.error(`Document file not found at '${url}'`);
          return of({metadata: {docId: docId, title: ''}, content: ''} as Doc);
        } else {
          throw error;
        }
      });
  }
}

function addPathExtension(path: string) {
  return path && path.endsWith('.html') ? path : path.endsWith('/') ? (path + 'index.json') : (path + '.json');
}

