// #docplaster
// #docregion
// #docregion imports
import 'rxjs/add/operator/scan';
import { Injectable }       from '@angular/core';
import { BehaviorSubject }  from 'rxjs/BehaviorSubject';
// #enddocregion imports

// #docregion event-interface
export interface AppEvent {
  type: string;
  message: string;
}
// #enddocregion event-interface

@Injectable()
export class EventAggregatorService {
  _events$: BehaviorSubject<AppEvent[]> = new BehaviorSubject<AppEvent[]>([]);
  events$ = this._events$
   .scan((events, event) => events.concat(event), []);

  add(event: AppEvent) {
    this._events$.next([event]);
  }
}
