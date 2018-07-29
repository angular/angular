// #docplaster
// #docregion , proto
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// #enddocregion proto
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';

// #docregion rxjs-imports
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
// #enddocregion rxjs-imports

// #docregion config-interface
export interface Config {
  heroesUrl: string;
  textfile: string;
}
// #enddocregion config-interface
// #docregion proto

@Injectable()
export class ConfigService {
  // #enddocregion proto
  // #docregion getConfig_1
  configUrl = 'assets/config.json';

  // #enddocregion getConfig_1
  // #docregion proto
  constructor(private http: HttpClient) { }
  // #enddocregion proto

  // #docregion getConfig, getConfig_1, getConfig_2, getConfig_3
  getConfig() {
  // #enddocregion getConfig_1, getConfig_2, getConfig_3
    return this.http.get<Config>(this.configUrl)
      .pipe(
        retry(3), // HTTP 요청이 실패하면 3번 더 시도합니다.
        catchError(this.handleError) // 재시도한 후에도 발생한 에러를 처리합니다.
      );
  }
  // #enddocregion getConfig

  getConfig_1() {
  // #docregion getConfig_1
    return this.http.get(this.configUrl);
  }
  // #enddocregion getConfig_1

  getConfig_2() {
    // #docregion getConfig_2
    // 이제 HTTP 요청 결과는 Config 타입의 Observable로 반환합니다.
    return this.http.get<Config>(this.configUrl);
  }
  // #enddocregion getConfig_2

  getConfig_3() {
    // #docregion getConfig_3
    return this.http.get<Config>(this.configUrl)
      .pipe(
        catchError(this.handleError)
      );
  }
  // #enddocregion getConfig_3

  // #docregion getConfigResponse
  getConfigResponse(): Observable<HttpResponse<Config>> {
    return this.http.get<Config>(
      this.configUrl, { observe: 'response' });
  }
  // #enddocregion getConfigResponse

  // #docregion handleError
  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // 클라이언트나 네트워크 문제로 발생한 에러.
      console.error('An error occurred:', error.error.message);
    } else {
      // 백엔드에서 실패한 것으로 보낸 에러.
      // 요청으로 받은 에러 객체를 확인하면 원인을 확인할 수 있습니다.
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    // 사용자가 이해할 수 있는 에러 메시지를 반환합니다.
    return throwError(
      'Something bad happened; please try again later.');
  };
  // #enddocregion handleError

  makeIntentionalError() {
    return this.http.get('not/a/real/url')
      .pipe(
        catchError(this.handleError)
      );
  }

// #docregion proto
}
// #enddocregion proto
