// #docplaster
// #docregion
import { Injectable } from '@angular/core';
// #docregion import-httpclient
import { HttpClient, HttpHeaders } from '@angular/common/http';
// #enddocregion import-httpclient

import { Observable, of } from 'rxjs';
// #docregion import-rxjs-operators
import { catchError, map, tap } from 'rxjs/operators';
// #enddocregion import-rxjs-operators

import { Hero } from './hero';
import { MessageService } from './message.service';

// #docregion http-options
const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};
// #enddocregion http-options

@Injectable({ providedIn: 'root' })
export class HeroService {

  // #docregion heroesUrl
  private heroesUrl = 'api/heroes';  // 웹 API 형식의 URL로 사용
  // #enddocregion heroesUrl

  // #docregion ctor
  constructor(
    private http: HttpClient,
    private messageService: MessageService) { }
  // #enddocregion ctor

  // #docregion getHeroes, getHeroes-1
  /** GET: 서버에서 히어로 목록 가져오기 */
  // #docregion getHeroes-2
  getHeroes (): Observable<Hero[]> {
    return this.http.get<Hero[]>(this.heroesUrl)
  // #enddocregion getHeroes-1
      .pipe(
        // #enddocregion getHeroes-2
        tap(_ => this.log('fetched heroes')),
        // #docregion getHeroes-2
        catchError(this.handleError<Hero[]>('getHeroes', []))
      );
  // #docregion getHeroes-1
  }
  // #enddocregion getHeroes, getHeroes-1, getHeroes-2

  // #docregion getHeroNo404
  /** GET: id에 해당하는 히어로 데이터를 가져옵니다. 존재하지 않으면 `undefined`를 반환합니다. */
  getHeroNo404<Hero>(id: number): Observable<Hero> {
    const url = `${this.heroesUrl}/?id=${id}`;
    return this.http.get<Hero[]>(url)
      .pipe(
        map(heroes => heroes[0]), // 배열에 있는 항목 중 하나만 반환합니다.
        // #enddocregion getHeroNo404
        tap(h => {
          const outcome = h ? `fetched` : `did not find`;
          this.log(`${outcome} hero id=${id}`);
        }),
        catchError(this.handleError<Hero>(`getHero id=${id}`))
        // #docregion getHeroNo404
      );
  }
  // #enddocregion getHeroNo404

  // #docregion getHero
  /** GET: id에 해당하는 히어로 데이터 가져오기. 존재하지 않으면 404를 반환합니다. */
  getHero(id: number): Observable<Hero> {
    const url = `${this.heroesUrl}/${id}`;
    return this.http.get<Hero>(url).pipe(
      tap(_ => this.log(`fetched hero id=${id}`)),
      catchError(this.handleError<Hero>(`getHero id=${id}`))
    );
  }
  // #enddocregion getHero

  // #docregion searchHeroes
  /* GET: 입력된 문구가 이름에 포함된 히어로 목록을 반환합니다. */
  searchHeroes(term: string): Observable<Hero[]> {
    if (!term.trim()) {
      // 입력된 내용이 없으면 빈 배열을 반환합니다.
      return of([]);
    }
    return this.http.get<Hero[]>(`${this.heroesUrl}/?name=${term}`).pipe(
      tap(_ => this.log(`found heroes matching "${term}"`)),
      catchError(this.handleError<Hero[]>('searchHeroes', []))
    );
  }
  // #enddocregion searchHeroes

  //////// 저장 기능 //////////

  // #docregion addHero
  /** POST: 서버에 새로운 히어로를 추가합니다. */
  addHero (hero: Hero): Observable<Hero> {
    return this.http.post<Hero>(this.heroesUrl, hero, httpOptions).pipe(
      tap((newHero: Hero) => this.log(`added hero w/ id=${newHero.id}`)),
      catchError(this.handleError<Hero>('addHero'))
    );
  }
  // #enddocregion addHero

  // #docregion deleteHero
  /** DELETE: 서버에서 히어로를 제거합니다. */
  deleteHero (hero: Hero | number): Observable<Hero> {
    const id = typeof hero === 'number' ? hero : hero.id;
    const url = `${this.heroesUrl}/${id}`;

    return this.http.delete<Hero>(url, httpOptions).pipe(
      tap(_ => this.log(`deleted hero id=${id}`)),
      catchError(this.handleError<Hero>('deleteHero'))
    );
  }
  // #enddocregion deleteHero

  // #docregion updateHero
  /** PUT: 서버에 저장된 히어로 데이터를 변경합니다. */
  updateHero (hero: Hero): Observable<any> {
    return this.http.put(this.heroesUrl, hero, httpOptions).pipe(
      tap(_ => this.log(`updated hero id=${hero.id}`)),
      catchError(this.handleError<any>('updateHero'))
    );
  }
  // #enddocregion updateHero

  // #docregion handleError
  /**
   * HTTP 요청이 실패한 경우를 처리합니다.
   * 애플리케이션 로직 흐름은 그대로 유지됩니다.
   * @param operation - 실패한 동작의 이름
   * @param result - 기본값으로 반환할 객체
   */
  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: 리모트 서버로 에러 메시지 보내기
      console.error(error); // 지금은 콘솔에 로그를 출력합니다.

      // TODO: 사용자가 이해할 수 있는 형태로 변환하기
      this.log(`${operation} failed: ${error.message}`);

      // 애플리케이션 로직이 끊기지 않도록 기본값으로 받은 객체를 반환합니다.
      return of(result as T);
    };
  }
  // #enddocregion handleError

  // #docregion log
  /** HeroService에서 보내는 메시지는 MessageService가 화면에 표시합니다. */
  private log(message: string) {
    this.messageService.add(`HeroService: ${message}`);
  }
  // #enddocregion log
}
