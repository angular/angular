import { Inject, Injectable, OnDestroy } from '@angular/core';
import { NgServiceWorker } from '@angular/service-worker';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/concat';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/takeUntil';

import { Logger } from 'app/shared/logger.service';


/**
 * SwUpdatesService
 *
 * @description
 * 1. Checks for available ServiceWorker updates once instantiated.
 * 2. As long as there is no update available, re-checks every 6 hours.
 * 3. As soon as an update is detected, it activates the update and notifies interested parties.
 * 4. It continues to check for available updates.
 *
 * @property
 * `updateActivated` {Observable<string>} - Emit the version hash whenever an update is activated.
 */
@Injectable()
export class SwUpdatesService implements OnDestroy {
  private checkInterval = 1000 * 60 * 60 * 6;   // 6 hours
  private onDestroy = new Subject();
  private checkForUpdateSubj = new Subject();
  updateActivated = this.sw.updates
      .takeUntil(this.onDestroy)
      .do(evt => this.log(`Update event: ${JSON.stringify(evt)}`))
      .filter(({type}) => type === 'activation')
      .map(({version}) => version);

  constructor(private logger: Logger, private sw: NgServiceWorker) {
    this.checkForUpdateSubj
        .debounceTime(this.checkInterval)
        .startWith(null)
        .takeUntil(this.onDestroy)
        .subscribe(() => this.checkForUpdate());
  }

  ngOnDestroy() {
    this.onDestroy.next();
  }

  private activateUpdate() {
    this.log('Activating update...');
    this.sw.activateUpdate(null)
        .subscribe(() => this.scheduleCheckForUpdate());
  }

  private checkForUpdate() {
    this.log('Checking for update...');
    this.sw.checkForUpdate()
        // Temp workaround for https://github.com/angular/mobile-toolkit/pull/137.
        // TODO (gkalpak): Remove once #137 is fixed.
        .concat(Observable.of(false)).take(1)
        .do(v => this.log(`Update available: ${v}`))
        .subscribe(v => v ? this.activateUpdate() : this.scheduleCheckForUpdate());
  }

  private log(message: string) {
    const timestamp = (new Date).toISOString();
    this.logger.log(`[SwUpdates - ${timestamp}]: ${message}`);
  }

  private scheduleCheckForUpdate() {
    this.checkForUpdateSubj.next();
  }
}
