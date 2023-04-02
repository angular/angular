import { ApplicationRef, ErrorHandler, Injectable, OnDestroy } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { concat, from, interval, Subject } from 'rxjs';
import { filter, first, switchMap, takeUntil, tap } from 'rxjs/operators';

import { LocationService } from 'app/shared/location.service';
import { Logger } from 'app/shared/logger.service';


/**
 * SwUpdatesService
 *
 * @description
 * While enabled, this service will:
 * 1. Check for available ServiceWorker updates every 6 hours.
 * 2. Activate an update as soon as one is available.
 */
@Injectable({providedIn: 'root'})
export class SwUpdatesService implements OnDestroy {
  private checkInterval = 1000 * 60 * 60 * 6;  // 6 hours
  private onDisable = new Subject<void>();

  constructor(
      private appRef: ApplicationRef, private errorHandler: ErrorHandler,
      private location: LocationService, private logger: Logger, private swu: SwUpdate) {}

  disable() {
    this.onDisable.next();
  }

  enable() {
    if (!this.swu.isEnabled) {
      return;
    }

    // Periodically check for updates (after the app is stabilized).
    const appIsStable = this.appRef.isStable.pipe(first(v => v));
    concat(appIsStable, interval(this.checkInterval))
        .pipe(
            tap(() => this.log('Checking for update...')),
            takeUntil(this.onDisable),
        )
        .subscribe(() => this.swu.checkForUpdate());

    // Activate available updates.
    this.swu.versionUpdates
        .pipe(
            filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'),
            tap(evt => this.log(`Update available: ${JSON.stringify(evt)}`)),
            takeUntil(this.onDisable),
            switchMap(() => from(this.swu.activateUpdate()))
        )
        .subscribe((isActivated) => {
          if(isActivated) {
            this.log('Update activated');
            this.location.fullPageNavigationNeeded();
          }
        });

    // Request an immediate page reload once an unrecoverable state has been detected.
    this.swu.unrecoverable
        .pipe(
            tap(evt => {
              const errorMsg = `Unrecoverable state: ${evt.reason}`;
              this.errorHandler.handleError(errorMsg);
              this.log(`${errorMsg}\nReloading...`);
            }),
            takeUntil(this.onDisable),
        )
        .subscribe(() => this.location.reloadPage());
  }

  ngOnDestroy() {
    this.disable();
  }

  private log(message: string) {
    const timestamp = new Date().toISOString();
    this.logger.log(`[SwUpdates - ${timestamp}]: ${message}`);
  }
}
