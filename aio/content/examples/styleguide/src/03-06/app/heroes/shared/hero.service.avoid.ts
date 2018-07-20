// #docregion
// #docregion example
/* avoid */

import { ExceptionService, SpinnerService, ToastService } from '../../core';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Hero } from './hero.model';
// #enddocregion example

@Injectable()
export class HeroService {

  constructor(
    private exceptionService: ExceptionService,
    private spinnerService: SpinnerService,
    private toastService: ToastService,
    private http: HttpClient
  ) { }

  getHero(id: number) {
    return this.http.get<Hero>(`api/heroes/${id}`).pipe(
      map(response => response.data as Hero));
  }

  getHeroes() {
    return this.http.get<Hero[]>(`api/heroes`).pipe(
      map(response => response.data as Hero[]));
  }

}

