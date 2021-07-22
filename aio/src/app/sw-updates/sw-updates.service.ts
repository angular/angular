import { ApplicationRef, ErrorHandler, Injectable, OnDestroy } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { concat, interval, Subject } from 'rxjs';
import { first, takeUntil, tap } from 'rxjs/operators';

import { LocationService } from 'app/shared/location.service';
import { Logger } from 'app/shared/logger.service';


/**
 * SwUpdatesService
 *
 * @description
 * 1. Checks for available ServiceWorker updates once instantiated.
 * 2. Re-checks every 6 hours.
 * 3. Whenever an update is available, it activates the update.
 */
@Injectable()
export class SwUpdatesService implements OnDestroy {
  private checkInterval = 1000 * 60 * 60 * 6;  // 6 hours
  private onDestroy = new Subject<void>();

  constructor(
      appRef: ApplicationRef, errorHandler: ErrorHandler, location: LocationService,
      private logger: Logger, private swu: SwUpdate) {
    if (!swu.isEnabled) {
      return;
    }

    // Periodically check for updates (after the app is stabilized).
    const appIsStable = appRef.isStable.pipe(first(v => v));
    concat(appIsStable, interval(this.checkInterval))
        .pipe(
            tap(() => this.log('Checking for update...')),
            takeUntil(this.onDestroy),
        )
        .subscribe(() => this.swu.checkForUpdate());

    // Activate available updates.
    this.swu.available
        .pipe(
            tap(evt => this.log(`Update available: ${JSON.stringify(evt)}`)),
            takeUntil(this.onDestroy),
        )
        .subscribe(() => this.swu.activateUpdate());

    // Request a full page navigation once an update has been activated.
    this.swu.activated
        .pipe(
            tap(evt => this.log(`Update activated: ${JSON.stringify(evt)}`)),
            takeUntil(this.onDestroy),
        )
        .subscribe(() => location.fullPageNavigationNeeded());

    // Request an immediate page reload once an unrecoverable state has been detected.
    this.swu.unrecoverable
        .pipe(
            tap(evt => {
              const errorMsg = `Unrecoverable state: ${evt.reason}`;
              errorHandler.handleError(errorMsg);
              this.log(`${errorMsg}\nReloading...`);
            }),
            takeUntil(this.onDestroy),
        )
        .subscribe(() => location.reloadPage());
  }

  ngOnDestroy() {
    this.onDestroy.next();
  }

  private log(message: string) {
    const timestamp = new Date().toISOString();
    this.logger.log(`[SwUpdates - ${timestamp}]: ${message}`);
  }
}
