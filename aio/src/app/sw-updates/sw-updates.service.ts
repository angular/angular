import { Injectable, OnDestroy } from '@angular/core';
import { NgServiceWorker } from '@angular/service-worker';
import { concat, of, Subject } from 'rxjs';
import { debounceTime, filter, map, startWith, take, takeUntil, tap } from 'rxjs/operators';
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
  updateActivated = this.sw.updates.pipe(
      takeUntil(this.onDestroy),
      tap(evt => this.log(`Update event: ${JSON.stringify(evt)}`)),
      filter(({type}) => type === 'activation'),
      map(({version}) => version),
  );

  constructor(private logger: Logger, private sw: NgServiceWorker) {
    this.checkForUpdateSubj
        .pipe(
            debounceTime(this.checkInterval),
            startWith<void>(undefined),
            takeUntil(this.onDestroy),
        )
        .subscribe(() => this.checkForUpdate());
  }

  ngOnDestroy() {
    this.onDestroy.next();
  }

  private activateUpdate() {
    this.log('Activating update...');
    this.sw.activateUpdate(null as any) // expects a non-null string
        .subscribe(() => this.scheduleCheckForUpdate());
  }

  private checkForUpdate() {
    this.log('Checking for update...');
    // Temp workaround for https://github.com/angular/mobile-toolkit/pull/137.
    // TODO (gkalpak): Remove once #137 is fixed.
    concat(this.sw.checkForUpdate(), of(false))
        .pipe(
            take(1),
            tap(v => this.log(`Update available: ${v}`)),
        )
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
