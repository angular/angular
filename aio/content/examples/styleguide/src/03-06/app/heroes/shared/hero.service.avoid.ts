// #docregion
// #docregion example
/* avoid */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { ExceptionService, SpinnerService, ToastService } from '../../core';
import { Hero } from './hero.model';

// #enddocregion example

@Injectable()
export class HeroService {
  constructor(
    private exceptionService: ExceptionService,
    private spinnerService: SpinnerService,
    private toastService: ToastService,
    private http: HttpClient
  ) {}

  getHero(id: number): Observable<Hero> {
    return this.http.get<Hero>(`api/heroes/${id}`);
  }

  getHeroes(): Observable<Hero[]> {
    return this.http.get<Hero[]>('api/heroes');
  }
}
