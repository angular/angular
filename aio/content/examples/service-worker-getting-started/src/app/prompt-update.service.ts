// #docplaster
import { Injectable } from '@angular/core';
import { filter, map } from 'rxjs/operators';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';

function promptUser(event: VersionReadyEvent): boolean {
  return true;
}

// #docregion sw-version-ready
@Injectable({providedIn: 'root'})
export class PromptUpdateService {

  constructor(swUpdate: SwUpdate) {
    swUpdate.versionUpdates
        .pipe(filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'))
        .subscribe(evt => {
          if (promptUser(evt)) {
            // Reload the page to update to the latest version.
            document.location.reload();
          }
        });
    // #enddocregion sw-version-ready
    // ...
    const updatesAvailable = swUpdate.versionUpdates.pipe(
        filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'),
        map(evt => ({
          type: 'UPDATE_AVAILABLE',
          current: evt.currentVersion,
          available: evt.latestVersion,
        })));
    // #docregion sw-version-ready
  }

}
// #enddocregion sw-version-ready
