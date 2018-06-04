import { Injectable, OnDestroy } from '@angular/core';

import { Observable, of } from 'rxjs';
import { delay }      from 'rxjs/operators';

export class Crisis {
  constructor(public id: number, public name: string) { }
}

const CRISES: Crisis[] = [
  new Crisis(1, 'Dragon Burning Cities'),
  new Crisis(2, 'Sky Rains Great White Sharks'),
  new Crisis(3, 'Giant Asteroid Heading For Earth'),
  new Crisis(4, 'Procrastinators Meeting Delayed Again'),
];

const FETCH_LATENCY = 500;

/** Simulate a data service that retrieves crises from a server */
@Injectable()
export class CrisisService implements OnDestroy {
  constructor() { console.log('CrisisService instance created.'); }
  ngOnDestroy() { console.log('CrisisService instance destroyed.'); }

  getCrises(): Observable<Crisis[]> {
    return of(CRISES).pipe(delay(FETCH_LATENCY));
  }

  getCrisis(id: number | string): Observable<Crisis> {
    return of(CRISES.find(crisis => crisis.id === +id))
      .pipe(delay(FETCH_LATENCY));
  }
}
