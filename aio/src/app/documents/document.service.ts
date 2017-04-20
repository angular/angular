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

const FILE_NOT_FOUND_URL = 'file-not-found';
const FETCHING_ERROR_URL = 'fetching-error';

@Injectable()
export class DocumentService {

  private cache = new Map<string, Observable<DocumentContents>>();

  currentDocument: Observable<DocumentContents>;

  constructor(
    private logger: Logger,
    private http: Http,
    location: LocationService) {
    // Whenever the URL changes we try to get the appropriate doc
    this.currentDocument = location.currentUrl.switchMap(() => this.getDocument(location.path()));
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
        return error.status === 404 ? this.getFileNotFoundDoc(id) : this.getErrorDoc(error);
      })
      .subscribe(subject);
    return subject.asObservable();
  }

  private getFileNotFoundDoc(url: string): Observable<DocumentContents> {
    if (url !== FILE_NOT_FOUND_URL) {
      this.logger.error(`Document file not found at '${url}'`);
      // using `getDocument` means that we can fetch the 404 doc contents from the server and cache it
      return this.getDocument(FILE_NOT_FOUND_URL);
    } else {
      return of({
        title: 'Not Found',
        contents: 'Document not found',
        id: FILE_NOT_FOUND_URL
      });
    }
  }

  private getErrorDoc(error: Response): Observable<DocumentContents> {
    this.logger.error('Error fetching document', error);
    return Observable.of({
      title: 'Error fetching document',
      contents: 'Sorry we were not able to fetch that document.',
      id: FETCHING_ERROR_URL
    });
  }
}
