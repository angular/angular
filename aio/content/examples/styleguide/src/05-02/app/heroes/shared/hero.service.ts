import { Injectable } from '@angular/core';
import { Http }       from '@angular/http';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Hero }       from './hero.model';

@Injectable()
export class HeroService {

  constructor(private http: Http) {}

  getHeroes(): Observable<Hero[]> {
    return this.http.get('api/heroes').pipe(
      map(resp => resp.json().data as Hero[])
    );
  }
}
