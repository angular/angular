import { Injectable, OnDestroy } from '@angular/core';
import { Http } from '@angular/http';

import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/takeUntil';

import { Logger } from 'app/shared/logger.service';

export interface ApiItem {
  title: string;
  path: string;
  docType: string;
  stability: string;
  secure: string;
  securityRisk: boolean;
  barrel: string;

  name?: string;
  show?: boolean;
}

export interface ApiSection {
  name: string;
  title: string;
  items: ApiItem[];
}

@Injectable()
export class ApiService implements OnDestroy {

  private apiBase = 'content/docs/api/';
  private apiListJsonDefault = 'api-list.json';
  private firstTime = true;
  private onDestroy = new Subject();
  private sectionsSubject = new ReplaySubject<ApiSection[]>(1);
  private _sections = this.sectionsSubject.takeUntil(this.onDestroy);

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

  constructor(private http: Http, private logger: Logger) { }

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
    this.http.get(url)
      .takeUntil(this.onDestroy)
      .map(response => {
        const sections = response.json();
        return Object.keys(sections).map(title => {
          const items = sections[title] as ApiItem[];
          items.forEach(normalizeItem);
          return { name: title.toLowerCase(), title, items };
        });
      })
      .do(() => this.logger.log(`Got API sections from ${url}`))
      .subscribe(
        sections => this.sectionsSubject.next(sections),
        err => {
          // Todo: handle error
          this.logger.error(err);
          throw err; // rethrow for now.
        }
      );

    function normalizeItem(item: ApiItem) {
      item.name = item.title.toLowerCase();
      // convert 'secure' property to boolean `securityRisk`
      item.securityRisk =  item.secure !== 'false';
      // 'let' and 'var' doc types should be treated as 'const'
      const docType = item.docType;
      if (docType === 'let' || docType === 'var') {
        item.docType = 'const';
      }
    }
  }
}
