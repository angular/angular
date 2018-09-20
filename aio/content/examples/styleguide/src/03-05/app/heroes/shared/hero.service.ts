// #docregion
// #docregion example
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { ExceptionService, SpinnerService, ToastService } from '../../core';
import { Hero } from './hero.model';

// #enddocregion example

@Injectable()
export class HeroService {
  cachedHeroes: Hero[];

  constructor(
    private exceptionService: ExceptionService,
    private spinnerService: SpinnerService,
    private toastService: ToastService,
    private http: HttpClient
  ) { }

  getHero(id: number) {
    return this.http.get<Hero>(`api/heroes/${id}`);
  }

  getHeroes() {
    return this.http.get<Hero[]>(`api/heroes`);
  }

}
