// #docplaster
// #docregion
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/distinctUntilChanged';
import { Injectable } from '@angular/core';
import { Router, Event, RoutesRecognized, NavigationStart } from '@angular/router';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class LoadingService {
  loading$: Observable<boolean>;

  constructor(private router: Router) {
    this.loading$ = this.router.events.map((event: Event) => {
      if ( event instanceof NavigationStart || event instanceof RoutesRecognized ) {
        return true;
      } else {
        // return false for NavigationEnd, NavigationError and NavigationCancel events
        return false;
      }
    })
    .distinctUntilChanged();
  }
}
