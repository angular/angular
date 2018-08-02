import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Hero }       from './hero.model';

@Injectable()
export class HeroService {

  constructor(private http: HttpClient) {}

  getHeroes(): Observable<Hero[]> {
    return this.http.get<Hero[]>('api/heroes').pipe(
      map(resp => resp.data as Hero[])
    );
  }
}
