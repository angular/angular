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
  date: any;
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
        retry(3), // retry a failed request up to 3 times
        catchError(this.handleError) // then handle the error
      );
  }
  // #enddocregion getConfig

  getConfig_1() {
  // #docregion getConfig_1
    return this.http.get<Config>(this.configUrl);
  }
  // #enddocregion getConfig_1

  getConfig_2() {
    // #docregion getConfig_2
    // now returns an Observable of Config
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
    if (error.status === 0) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      console.error(
        `Backend returned code ${error.status}, body was: `, error.error);
    }
    // Return an observable with a user-facing error message.
    return throwError(
      'Something bad happened; please try again later.');
  }
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
