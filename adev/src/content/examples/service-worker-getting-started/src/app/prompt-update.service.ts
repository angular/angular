// #docplaster
import {inject, Injectable} from '@angular/core';
// #docregion sw-replicate-available
import {filter, map} from 'rxjs/operators';
// #enddocregion sw-replicate-available
import {SwUpdate, VersionReadyEvent} from '@angular/service-worker';

function promptUser(event: VersionReadyEvent): boolean {
  return true;
}

// #docregion sw-version-ready
@Injectable({providedIn: 'root'})
export class PromptUpdateService {
  constructor() {
    const swUpdate = inject(SwUpdate);
    swUpdate.versionUpdates
      .pipe(filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'))
      .subscribe((evt) => {
        if (promptUser(evt)) {
          // Reload the page to update to the latest version.
          document.location.reload();
        }
      });
    // #enddocregion sw-version-ready
    // #docregion sw-replicate-available
    // ...
    const updatesAvailable = swUpdate.versionUpdates.pipe(
      filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'),
      map((evt) => ({
        type: 'UPDATE_AVAILABLE',
        current: evt.currentVersion,
        available: evt.latestVersion,
      })),
    );
    // #enddocregion sw-replicate-available
    // #docregion sw-version-ready
  }
}
// #enddocregion sw-version-ready
