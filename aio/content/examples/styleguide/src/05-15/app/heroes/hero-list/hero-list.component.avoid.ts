// #docregion
/* avoid */
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/finally';

import { HttpClient } from '@angular/common/http';
import { OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { Hero } from '../shared/hero.model';

const heroesUrl = 'http://angular.io';

export class HeroListComponent implements OnInit {
  heroes: Hero[];
  constructor(private http: HttpClient) {}
  getHeroes() {
    this.heroes = [];
    this.http
      .get<Hero[]>(heroesUrl)
      .catch(this.catchBadResponse)
      .finally(() => this.hideSpinner())
      .subscribe(heroes => (this.heroes = heroes));
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
