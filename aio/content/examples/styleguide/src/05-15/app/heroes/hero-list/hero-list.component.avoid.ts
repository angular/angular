// #docregion
/* avoid */

import { OnInit } from '@angular/core';
import { Http, Response } from '@angular/http';

import { Observable } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';

import { Hero } from '../shared/hero.model';

const heroesUrl = 'http://angular.io';

export class HeroListComponent implements OnInit {
  heroes: Hero[];
  constructor(private http: Http) {}
  getHeroes() {
    this.heroes = [];
    this.http.get(heroesUrl).pipe(
      map((response: Response) => <Hero[]>response.json().data),
      catchError(this.catchBadResponse),
      finalize(() => this.hideSpinner())
    ).subscribe((heroes: Hero[]) => this.heroes = heroes);
  }
  ngOnInit() {
    this.getHeroes();
  }

  private catchBadResponse(err: any, source: Observable<any>) {
    // log and handle the exception
    return new Observable();
  }

  private hideSpinner() {
    // hide the spinner
  }
}
