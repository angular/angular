// #docregion
// #docregion example
/* avoid */

import { ExceptionService, SpinnerService, ToastService } from '../../core';
import { Http } from '@angular/http';
import { Injectable } from '@angular/core';
import { Hero } from './hero.model';
// #enddocregion example

@Injectable()
export class HeroService {

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

