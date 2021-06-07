import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { AsyncSubject, Observable, of, throwError } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';

import { DocumentContents } from './document-contents';
export { DocumentContents } from './document-contents';

import { LocationService } from 'app/shared/location.service';
import { Logger } from 'app/shared/logger.service';

export const FILE_NOT_FOUND_ID = 'file-not-found';
export const FETCHING_ERROR_ID = 'fetching-error';

export const CONTENT_URL_PREFIX = 'generated/';
export const DOC_CONTENT_URL_PREFIX = CONTENT_URL_PREFIX + 'docs/';
const FETCHING_ERROR_CONTENTS = (path: string) => `
  <div class="nf-container l-flex-wrap flex-center">
    <div class="nf-icon material-icons">error_outline</div>
    <div class="nf-response l-flex-wrap">
      <h1 class="no-toc">Request for document failed.</h1>
      <p>
        We are unable to retrieve the "${path}" page at this time.
        Please check your connection and try again later.
      </p>
    </div>
  </div>
`;

@Injectable()
export class DocumentService {

  private cache = new Map<string, Observable<DocumentContents>>();

  currentDocument: Observable<DocumentContents>;

  constructor(
    private logger: Logger,
    private http: HttpClient,
    location: LocationService) {
    // Whenever the URL changes we try to get the appropriate doc
    this.currentDocument = location.currentPath.pipe(switchMap(path => this.getDocument(path)));
  }

  private getDocument(url: string) {
    const id = url || 'index';
    this.logger.log('getting document', id);
    if (!this.cache.has(id)) {
      this.cache.set(id, this.fetchDocument(id));
    }
    return this.cache.get(id) as Observable<DocumentContents>;
  }

  private fetchDocument(id: string): Observable<DocumentContents> {
    const requestPath = `${DOC_CONTENT_URL_PREFIX}${id}.json`;
    const subject = new AsyncSubject<DocumentContents>();

    this.logger.log('fetching document from', requestPath);
    this.http
      .get<DocumentContents>(requestPath, {responseType: 'json'})
      .pipe(
        tap(data => {
          if (!data || typeof data !== 'object') {
            this.logger.log('received invalid data:', data);
            throw Error('Invalid data');
          }
        }),
        // HACK: PREPARE FOR CHANGING TO CASE-INSENSITIVE URLS
        catchError((error: HttpErrorResponse) => {
          const encodedPath = encodeToLowercase(requestPath);
          return error.status === 404 && encodedPath !== requestPath ?
              this.http.get<DocumentContents>(encodedPath) :
              throwError(error);
        }),
        catchError((error: HttpErrorResponse) => {
          const disambiguatedPath = convertDisambiguatedPath(requestPath);
          return error.status === 404 && disambiguatedPath !== requestPath ?
              this.http.get<DocumentContents>(disambiguatedPath) :
              throwError(error);
        }),
        // END HACK: PREPARE FOR CHANGING TO CASE-INSENSITIVE URLS
        catchError((error: HttpErrorResponse) => {
          return error.status === 404 ? this.getFileNotFoundDoc(id) : this.getErrorDoc(id, error);
        }),
      )
      .subscribe(subject);

    return subject.asObservable();
  }

  private getFileNotFoundDoc(id: string): Observable<DocumentContents> {
    if (id !== FILE_NOT_FOUND_ID) {
      this.logger.error(new Error(`Document file not found at '${id}'`));
      // using `getDocument` means that we can fetch the 404 doc contents from the server and cache it
      return this.getDocument(FILE_NOT_FOUND_ID);
    } else {
      return of({
        id: FILE_NOT_FOUND_ID,
        contents: 'Document not found'
      });
    }
  }

  private getErrorDoc(id: string, error: HttpErrorResponse): Observable<DocumentContents> {
    this.logger.error(new Error(`Error fetching document '${id}': (${error.message})`));
    this.cache.delete(id);
    return of({
      id: FETCHING_ERROR_ID,
      contents: FETCHING_ERROR_CONTENTS(id),
    });
  }
}

/**
 * Encode the path to the content in a deterministic, reversible, case-insensitive form.
 *
 * This avoids collisions on case-insensitive file-systems.
 *
 * - Escape underscores (_) to double underscores (__).
 * - Convert all uppercase letters to lowercase followed by an underscore.
 */
function encodeToLowercase(str: string): string {
  return str.replace(/[A-Z_]/g, char => char.toLowerCase() + '_');
}

/**
 * A temporary function to deal with a future change to URL disambiguation.
 *
 * Currently there are disambiguated URLs such as `INJECTOR-0` and `Injector-1`, which
 * will attempt to load their document contents from `injector-0.json` and `injector-1.json`
 * respectively. In a future version of the AIO app, the disambiguation will be changed to
 * escape the upper-case characters instead.
 *
 * This function will be called if the current AIO is trying to request documents from a
 * server that has been updated to use the new disambiguated URLs.
 */
function convertDisambiguatedPath(str: string): string {
  return encodeToLowercase(str.replace(/-\d+\.json$/, '.json'));
}
