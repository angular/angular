import { Injectable, OnDestroy, Inject } from '@angular/core';
import { Location, LocationChangeEvent, APP_BASE_HREF } from '@angular/common';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';

import 'rxjs/add/operator/merge'
import 'rxjs/add/operator/mergeMap'
import 'rxjs/add/operator/concat'
import 'rxjs/add/operator/scan'
import 'rxjs/add/observable/from'
import 'rxjs/add/operator/publishReplay'

@Injectable()
export class NavEngine implements OnDestroy {
  private _navigationEvents:Subject<string> = new Subject<string>();
  private subscription: Subscription;

  currentUrl: Observable<string>;

  constructor(
    private location:Location,
    @Inject(APP_BASE_HREF) baseHref:string,
  ) {

    const currentUrl = this._navigationEvents
      .do(url => location.go(url))
      .merge(
        Observable.of(location.path()),
        Observable.create(obs => this.location.subscribe(e => obs.next(e.url)))

      )
      .map(p => location.normalize(p))
      .publishReplay(1);

    this.subscription = currentUrl.connect();

    this.currentUrl = currentUrl;
  }

  /**
   * Navigate pushes new doc for the given `id` into the `currentDoc` observable.
   * TODO: handle document retrieval error
   */
  navigate(docId: string) {
    this._navigationEvents.next(this.location.normalize(docId));
  }

  ngOnDestroy() {
    if (this.subscription) { this.subscription.unsubscribe(); }
  }
}


