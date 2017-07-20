import { Injectable, OnDestroy } from '@angular/core';
import { NgServiceWorker } from '@angular/service-worker';
import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/concat';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/toPromise';


/**
 * SwUpdatesService
 *
 * @description
 * 1. Checks for available ServiceWorker updates once instantiated.
 * 2. As long as there is no update available, re-checks every 6 hours.
 * 3. As soon as an update is detected, it waits until the update is activated, then starts checking
 *    again (every 6 hours).
 *
 * @property
 * `isUpdateAvailable` {Observable<boolean>} - Emit `true`/`false` to indicate updates being
 * available or not. Remembers the last emitted value. Will only emit a new value if it is different
 * than the last one.
 *
 * @method
 * `activateUpdate()` {() => Promise<boolean>} - Activate the latest available update. The returned
 * promise resolves to `true` if an update was activated successfully and `false` if the activation
 * failed (e.g. if there was no update to activate).
 */
@Injectable()
export class SwUpdatesService implements OnDestroy {
  private checkInterval = 1000 * 60 * 60 * 6;   // 6 hours
  private onDestroy = new Subject();
  private checkForUpdateSubj = new Subject();
  private isUpdateAvailableSubj = new ReplaySubject<boolean>(1);
  isUpdateAvailable = this.isUpdateAvailableSubj.distinctUntilChanged();

  constructor(private sw: NgServiceWorker) {
    this.checkForUpdateSubj
        .debounceTime(this.checkInterval)
        .takeUntil(this.onDestroy)
        .startWith(null)
        .subscribe(() => this.checkForUpdate());

    this.isUpdateAvailableSubj
        .filter(v => !v)
        .takeUntil(this.onDestroy)
        .subscribe(() => this.checkForUpdateSubj.next());
  }

  ngOnDestroy() {
    this.onDestroy.next();
  }

  activateUpdate(): Promise<boolean> {
    return new Promise(resolve => {
      this.sw.activateUpdate(null)
          // Temp workaround for https://github.com/angular/mobile-toolkit/pull/137.
          // TODO (gkalpak): Remove once #137 is fixed.
          .concat(Observable.of(false)).take(1)
          .do(() => this.isUpdateAvailableSubj.next(false))
          .subscribe(resolve);
    });
  }

  private checkForUpdate() {
    this.sw.checkForUpdate()
        // Temp workaround for https://github.com/angular/mobile-toolkit/pull/137.
        // TODO (gkalpak): Remove once #137 is fixed.
        .concat(Observable.of(false)).take(1)
        .subscribe(v => this.isUpdateAvailableSubj.next(v));
  }
}
