import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import { AsyncSubject } from 'rxjs/AsyncSubject';
import { of } from 'rxjs/observable/of';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';

import { DocumentContents } from './document-contents';
export { DocumentContents } from './document-contents';

import { LocationService } from 'app/shared/location.service';
import { Logger } from 'app/shared/logger.service';

const CONTENT_URL_PREFIX = 'content/docs/';
const FILE_NOT_FOUND_ID = 'file-not-found';
const FETCHING_ERROR_ID = 'fetching-error';
const FETCHING_ERROR_CONTENTS = `
<div class="nf-container l-flex-wrap flex-center">
<div class="nf-icon material-icons">error_outline</div>
<div class="nf-response l-flex-wrap">
<h1>Request for document failed.</h1>
<p>We are unable to retrieve the "<current-location></current-location>" page at this time.
Please check your connection and try again later.</p>
</div></div>
`;

@Injectable()
export class DocumentService {

  private cache = new Map<string, Observable<DocumentContents>>();

  currentDocument: Observable<DocumentContents>;

  constructor(
    private logger: Logger,
    private http: Http,
    location: LocationService) {
    // Whenever the URL changes we try to get the appropriate doc
    this.currentDocument = location.currentPath.switchMap(path => this.getDocument(path));
  }

  private getDocument(url: string) {
    const id = url || 'index';
    this.logger.log('getting document', id);
    if ( !this.cache.has(id)) {
      this.cache.set(id, this.fetchDocument(id));
    }
    return this.cache.get(id);
  }

  private fetchDocument(id: string): Observable<DocumentContents> {
    const requestPath = `content/docs/${id}.json`;
    this.logger.log('fetching document from', requestPath);
    const subject = new AsyncSubject();
    this.http
      .get(requestPath)
      .map(response => response.json())
      .catch((error: Response) => {
        return error.status === 404 ? this.getFileNotFoundDoc(id) : this.getErrorDoc(id, error);
      })
      .subscribe(subject);
    return subject.asObservable();
  }

  private getFileNotFoundDoc(id: string): Observable<DocumentContents> {
    if (id !== FILE_NOT_FOUND_ID) {
      this.logger.error(`Document file not found at '${id}'`);
      // using `getDocument` means that we can fetch the 404 doc contents from the server and cache it
      return this.getDocument(FILE_NOT_FOUND_ID);
    } else {
      return of({
        title: 'Not Found',
        contents: 'Document not found',
        id: FILE_NOT_FOUND_ID
      });
    }
  }

  private getErrorDoc(id: string, error: Response): Observable<DocumentContents> {
    this.logger.error('Error fetching document', error);
    this.cache.delete(id);
    return Observable.of({
      title: 'Document retrieval error',
      contents: FETCHING_ERROR_CONTENTS,
      id: FETCHING_ERROR_ID
    });
  }
}
