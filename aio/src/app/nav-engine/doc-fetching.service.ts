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

  private base = 'content/';

  constructor(
    private http: Http,
    private logger: Logger) { }

  getPath(docId: string) {
    return this.base + addPathExtension(docId);
  }

  /**
   * Fetch document from server.
   * NB: pass 404 response to caller as Doc with empty string content
   * Other errors and non-OK status responses are thrown errors.
   * TODO: add timeout and retry for lost connection
   */
  getDocFile(docId: string): Observable<Doc> {

    if (!docId) {
      const emsg = 'getFile: no document id';
      this.logger.error(emsg);
      throw new Error(emsg);
    }

    // TODO: Metadata will be updated from file
    const metadata: DocMetadata = { docId, title: docId };
    const url = this.getPath(docId);

    this.logger.log(`Fetching document file at '${url}'`);

    return this.http.get(url)
      .map(res =>  <Doc> { metadata, content: res.text() }) // TODO: It will come as JSON soon
      .do(content => this.logger.log(`Fetched document file at '${url}'`) )
      .catch((error: Response) => {
        if (error.status === 404) {
          this.logger.error(`Document file not found at '${url}'`);
          return of({metadata, content: ''} as Doc);
        } else {
          throw error;
        }
      });
  }
}

function addPathExtension(path: string) {
  if (path) {
    if (path.endsWith('/')) {
      return path + 'index.html';
    } else if (!path.endsWith('.html')) {
      return path + '.html';
    }
  }
  return path;
}

// function removePathExtension(path: string) {
//   if (path) {
//     if (path.endsWith('/index.html')) {
//       return path.substring(0, path.length - 10);
//     } else if (path.endsWith('.html')) {
//       return path.substring(0, path.length - 5);
//     }
//   }
//   return path;
// }
