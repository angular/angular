// Mark Twain Quote service gets quotes from server
import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';

import {Observable, of, throwError, Observer} from 'rxjs';
import {concat, map, retryWhen, switchMap, take, tap} from 'rxjs/operators';

import {Quote} from './quote';

@Injectable()
export class TwainService {
  private http = inject(HttpClient);

  private nextId = 1;

  getQuote(): Observable<string> {
    return Observable.create((observer: Observer<number>) => observer.next(this.nextId++)).pipe(
      // tap((id: number) => console.log(id)),
      // tap((id: number) => { throw new Error('Simulated server error'); }),

      switchMap((id: number) => this.http.get<Quote>(`api/quotes/${id}`)),
      // tap((q : Quote) => console.log(q)),
      map((q: Quote) => q.quote),

      // `errors` is observable of http.get errors
      retryWhen((errors) =>
        errors.pipe(
          switchMap((error: HttpErrorResponse) => {
            if (error.status === 404) {
              // Queried for quote that doesn't exist.
              this.nextId = 1; // retry with quote id:1
              return of(null); // signal OK to retry
            }
            // Some other HTTP error.
            console.error(error);
            return throwError('Cannot get Twain quotes from the server');
          }),
          take(2),
          // If a second retry value, then didn't find id:1 and triggers the following error
          concat(throwError('There are no Twain quotes')), // didn't find id:1
        ),
      ),
    );
  }
}
