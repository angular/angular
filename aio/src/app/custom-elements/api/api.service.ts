import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { Logger } from 'app/shared/logger.service';
import { DOC_CONTENT_URL_PREFIX } from 'app/documents/document.service';

export interface ApiItem {
  name: string;
  title: string;
  path: string;
  docType: string;
  stability: string;
  securityRisk: boolean;

  show?: boolean;
}

export interface ApiSection {
  name: string;
  title: string;
  items: ApiItem[];
}

@Injectable()
export class ApiService implements OnDestroy {

  private apiBase = DOC_CONTENT_URL_PREFIX + 'api/';
  private apiListJsonDefault = 'api-list.json';
  private firstTime = true;
  private onDestroy = new Subject();
  private sectionsSubject = new ReplaySubject<ApiSection[]>(1);
  private _sections = this.sectionsSubject.pipe(takeUntil(this.onDestroy));

  /**
  * Return a cached observable of API sections from a JSON file.
  * API sections is an array of Angular top modules and metadata about their API documents (items).
   */
  get sections() {

    if (this.firstTime) {
      this.firstTime = false;
      this.fetchSections(); // TODO: get URL for fetchSections by configuration?

      // makes sectionsSubject hot; subscribe ensures stays alive (always refCount > 0);
      this._sections.subscribe(sections => this.logger.log('ApiService got API sections') );
    }

    return this._sections;
  };

  constructor(private http: HttpClient, private logger: Logger) { }

  ngOnDestroy() {
    this.onDestroy.next();
  }

 /**
  * Fetch API sections from a JSON file.
  * API sections is an array of Angular top modules and metadata about their API documents (items).
  * Updates `sections` observable
  *
  * @param {string} [src] - Name of the api list JSON file
  */
  fetchSections(src?: string) {
    // TODO: get URL by configuration?
    const url = this.apiBase + (src || this.apiListJsonDefault);
    this.http.get<ApiSection[]>(url)
      .pipe(
        takeUntil(this.onDestroy),
        tap(() => this.logger.log(`Got API sections from ${url}`)),
      )
      .subscribe(
        sections => this.sectionsSubject.next(sections),
        (err: HttpErrorResponse) => {
          // Todo: handle error
          this.logger.error(err);
          throw err; // rethrow for now.
        }
      );
  }
}
