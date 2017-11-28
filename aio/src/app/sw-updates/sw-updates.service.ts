import { ApplicationRef, Injectable, OnDestroy } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { concat, NEVER, Observable, Subject } from 'rxjs';
import { debounceTime, first, map, startWith, takeUntil, tap } from 'rxjs/operators';

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
  private onDestroy = new Subject<void>();
  private checkForUpdateSubj = new Subject<void>();
  updateActivated: Observable<string>;

  constructor(appRef: ApplicationRef, private logger: Logger, private sw: SwUpdate) {
    if (!sw.isEnabled) {
      this.updateActivated = NEVER.takeUntil(this.onDestroy);
      return;
    }
    
    this.updateActivated = this.sw.activated.pipe(
       takeUntil(this.onDestroy),
       tap(evt => this.log(`Update event: ${JSON.stringify(evt)}`)),
       map(evt => evt.current.hash),
    );

    const appIsStable$ = appRef.isStable.pipe(first(v => v));
    const checkForUpdates$ = this.checkForUpdateSubj.pipe(debounceTime(this.checkInterval), startWith<void>(undefined));

    concat(appIsStable$, checkForUpdates$)
        .pipe(takeUntil(this.onDestroy))
        .subscribe(() => this.checkForUpdate());

    this.sw.available
      .takeUntil(this.onDestroy)
      .subscribe(() => this.activateUpdate());
  }

  ngOnDestroy() {
    this.onDestroy.next();
  }

  private activateUpdate() {
    this.log('Activating update...');
    this.sw.activateUpdate();
  }

  private checkForUpdate() {
    this.log('Checking for update...');
    this.sw.checkForUpdate().then(() => this.scheduleCheckForUpdate());
  }

  private log(message: string) {
    const timestamp = (new Date).toISOString();
    this.logger.log(`[SwUpdates - ${timestamp}]: ${message}`);
  }

  private scheduleCheckForUpdate() {
    this.checkForUpdateSubj.next();
  }
}
