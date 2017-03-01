import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/switchMap';

import { LocationService } from 'app/shared/location.service';
import { Logger } from 'app/shared/logger.service';

const FILE_NOT_FOUND_DOC = 'file-not-found';

export interface DocumentContents {
  title: string;
  contents: string;
}

@Injectable()
export class DocumentService {

  private cache = new Map<string, Observable<DocumentContents>>();

  currentDocument: Observable<DocumentContents>;

  constructor(private logger: Logger, private http: Http, location: LocationService) {
    // Whenever the URL changes we try to get the appropriate doc
    this.currentDocument = location.currentUrl.switchMap(url => this.getDocument(url));
  }

  private getDocument(url: string) {
    this.logger.log('getting document', url);
    if ( !this.cache.has(url)) {
      this.cache.set(url, this.fetchDocument(url));
    }
    return this.cache.get(url);
  }

  private fetchDocument(url: string) {
    const path = this.computePath(url);
    this.logger.log('fetching document from', path);
    return this.http
      .get(path)
      .map(res => res.json())
      .catch((error: Response) => {
        if (error.status === 404 && url !== FILE_NOT_FOUND_DOC) {
          this.logger.error(`Document file not found at '${url}'`);
          // using `getDocument` means that we can fetch the 404 doc contents from the server and cache it
          return this.getDocument(FILE_NOT_FOUND_DOC);
        } else {
          throw error;
        }
      });
  }

  private computePath(url) {
    url = url.startsWith('/') ? url : '/' + url;
    return 'content/docs' + url + '.json';
  }
}
