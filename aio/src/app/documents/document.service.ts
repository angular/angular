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

@Injectable()
export class DocumentService {

  private cache = new Map<string, Observable<DocumentContents>>();
  private fileNotFoundPath = this.computePath(FILE_NOT_FOUND_URL);

  currentDocument: Observable<DocumentContents>;

  constructor(
    private logger: Logger,
    private http: Http,
    location: LocationService) {
    // Whenever the URL changes we try to get the appropriate doc
    this.currentDocument = location.currentUrl.switchMap(url => this.getDocument(url));
  }

  private getDocument(url: string) {
    this.logger.log('getting document', url);
    const path = this.computePath(url);
    if ( !this.cache.has(path)) {
      this.cache.set(path, this.fetchDocument(path));
    }
    return this.cache.get(path);
  }

  private fetchDocument(path: string) {
    this.logger.log('fetching document from', path);
    const subject = new AsyncSubject();
    this.http
      .get(path)
      .map(res => res.json())
      .catch((error: Response) => {
        if (error.status === 404) {
          if (path !== this.fileNotFoundPath) {
            this.logger.error(`Document file not found at '${path}'`);
            // using `getDocument` means that we can fetch the 404 doc contents from the server and cache it
            return this.getDocument(FILE_NOT_FOUND_URL);
          } else {
            return of({ title: 'Not Found', contents: 'Document not found' });
          }
        } else {
          this.logger.error('Error fetching document', error);
          return Observable.of({ title: 'Error fetching document', contents: 'Sorry we were not able to fetch that document.' });
        }
      })
      .subscribe(subject);
    return subject.asObservable();
  }

  private computePath(url: string) {
    url = url.match(/[^#?]*/)[0]; // strip off fragment and query
    url = url.replace(/\/$/, ''); // strip off trailing slash
    if (url === '') {
      // deal with root url
      url = 'index';
    }
    return 'content/docs/' + url + '.json';
  }
}
