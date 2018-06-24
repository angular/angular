// #docplaster
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
// #docregion http-options
import { HttpHeaders } from '@angular/common/http';

// #enddocregion http-options

import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Hero } from './hero';
import { HttpErrorHandler, HandleError } from '../http-error-handler.service';

// #docregion http-options
const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json',
    'Authorization': 'my-auth-token'
  })
};
// #enddocregion http-options

@Injectable()
export class HeroesService {
  heroesUrl = 'api/heroes';  // URL to web api
  private handleError: HandleError;

  constructor(
    private http: HttpClient,
    httpErrorHandler: HttpErrorHandler) {
    this.handleError = httpErrorHandler.createHandleError('HeroesService');
  }

  /** GET heroes from the server */
  getHeroes (): Observable<Hero[]> {
    return this.http.get<Hero[]>(this.heroesUrl)
      .pipe(
        catchError(this.handleError('getHeroes', []))
      );
  }

    // #docregion searchHeroes
  /* 입력된 단어가 포함된 히어로 목록을 GET 방식으로 요청합니다. */
  searchHeroes(term: string): Observable<Hero[]> {
    term = term.trim();

    // 전달된 인자로 HttpParams 객체를 생성합니다.
    const options = term ?
     { params: new HttpParams().set('name', term) } : {};

    return this.http.get<Hero[]>(this.heroesUrl, options)
      .pipe(
        catchError(this.handleError<Hero[]>('searchHeroes', []))
      );
  }
  // #enddocregion searchHeroes

  //////// Save methods //////////

  // #docregion addHero
  /** POST: DB에 새로운 히어로를 추가합니다. */
  addHero (hero: Hero): Observable<Hero> {
    return this.http.post<Hero>(this.heroesUrl, hero, httpOptions)
      .pipe(
        catchError(this.handleError('addHero', hero))
      );
  }
  // #enddocregion addHero

  // #docregion deleteHero
  /** DELETE: DB에서 히어로를 삭제합니다. */
  deleteHero (id: number): Observable<{}> {
    const url = `${this.heroesUrl}/${id}`; // DELETE api/heroes/42
    return this.http.delete(url, httpOptions)
      .pipe(
        catchError(this.handleError('deleteHero'))
      );
  }
  // #enddocregion deleteHero

  // #docregion updateHero
  /** PUT: DB 데이터를 수정합니다. HTTP 요청이 성공하면 새로운 히어로 데이터를 반환합니다. */
  updateHero (hero: Hero): Observable<Hero> {
    // #enddocregion updateHero
    // #docregion update-headers
    httpOptions.headers =
      httpOptions.headers.set('Authorization', 'my-new-auth-token');
    // #enddocregion update-headers

    // #docregion updateHero
    return this.http.put<Hero>(this.heroesUrl, hero, httpOptions)
      .pipe(
        catchError(this.handleError('updateHero', hero))
      );
  }
  // #enddocregion updateHero
}
