import { Inject, Injectable, Optional } from '@angular/core';
import { APP_BASE_HREF } from '@angular/common';
import { HttpClient }    from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { Hero } from './hero';

// #docregion class
@Injectable()
export class HeroSearchService {

  private searchUrl = 'api/heroes/?name=';  // URL to web api

  constructor(
    private http: HttpClient,
    @Optional() @Inject(APP_BASE_HREF) origin: string) {
    this.searchUrl = (origin || '') + this.searchUrl;
  }

  search(term: string): Observable<Hero[]> {
    return this.http
    .get(this.searchUrl + term)
    .map((data: any) => data.data as Hero[]);
  }
}
// #enddocregion class
