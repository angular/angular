// #docregion
// #docregion example
import { Injectable } from '@angular/core';
import { Http }       from '@angular/http';

import { Hero } from './hero.model';
import { ExceptionService, SpinnerService, ToastService } from '../../core';
// #enddocregion example

@Injectable()
export class HeroService {
  cachedHeroes: Hero[];

  constructor(
    private exceptionService: ExceptionService,
    private spinnerService: SpinnerService,
    private toastService: ToastService,
    private http: Http
  ) { }

  getHero(id: number) {
    return this.http.get(`api/heroes/${id}`)
      .map(response => response.json().data as Hero);
  }

  getHeroes() {
    return this.http.get(`api/heroes`)
      .map(response => response.json().data as Hero[]);
  }

}

