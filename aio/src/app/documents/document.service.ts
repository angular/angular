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
    url = this.cleanUrl(url);
    if ( !this.cache.has(url)) {
      this.cache.set(url, this.fetchDocument(url));
    }
    return this.cache.get(url);
  }

  private fetchDocument(url: string) {
    this.logger.log('fetching document from', url);
    const subject = new AsyncSubject();
    this.http
      .get(`content/docs/${url}.json`)
      // Add the document's url to the DocumentContents provided to the rest of the app
      .map(res => Object.assign(res.json(), { url }) as DocumentContents)
      .catch((error: Response) => {
        if (error.status === 404) {
          if (url !== FILE_NOT_FOUND_URL) {
            this.logger.error(`Document file not found at '${url}'`);
            // using `getDocument` means that we can fetch the 404 doc contents from the server and cache it
            return this.getDocument(FILE_NOT_FOUND_URL);
          } else {
            return of({ title: 'Not Found', contents: 'Document not found', url: FILE_NOT_FOUND_URL });
          }
        } else {
          this.logger.error('Error fetching document', error);
          return Observable.of({ title: 'Error fetching document', contents: 'Sorry we were not able to fetch that document.', url});
        }
      })
      .subscribe(subject);
    return subject.asObservable();
  }

  private cleanUrl(url: string) {
    url = url.match(/[^#?]*/)[0]; // strip off fragment and query
    url = url.replace(/\/$/, ''); // strip off trailing slash
    if (url === '') {
      // deal with root url
      url = 'index';
    }
    return url;
  }
}
