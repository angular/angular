import {HttpClient} from '@angular/common/http';
import {Injectable, inject, signal} from '@angular/core';
import {rxResource} from '@angular/core/rxjs-interop';
import {catchError, delay, of} from 'rxjs';

export interface Movie {
  id: string;
  title: string;
  description: string;
  director: string;
}

@Injectable({
  providedIn: 'root',
})
export class Movie {
  private readonly httpClient = inject(HttpClient);
  private limit = signal(5);

  readonly movies = rxResource<Movie[], number>({
    params: () => this.limit(),
    stream: ({params}) => {
      return this.httpClient
        .get<Movie[]>(`https://ghibliapi.vercel.app/films?limit=${params}`)
        .pipe(
          delay(500), // Simulate network latency
          catchError((e) => {
            console.error('Failed to fetch movies:', e);
            return of([]); // On error, return an empty array
          }),
        );
    },
    defaultValue: [],
  });

  updateLimit(newLimit: number) {
    this.limit.set(newLimit);
  }
}
