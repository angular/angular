import {inject, Injectable} from '@angular/core';
import {SwUpdate, VersionReadyEvent} from '@angular/service-worker';

// #docregion sw-update
@Injectable({providedIn: 'root'})
export class LogUpdateService {
  private updates = inject(SwUpdate);
  constructor() {
    this.updates.versionUpdates.subscribe((evt) => {
      switch (evt.type) {
        case 'VERSION_DETECTED':
          console.log(`Downloading new app version: ${evt.version.hash}`);
          break;
        case 'VERSION_READY':
          console.log(`Current app version: ${evt.currentVersion.hash}`);
          console.log(`New app version ready for use: ${evt.latestVersion.hash}`);
          break;
        case 'VERSION_INSTALLATION_FAILED':
          console.log(`Failed to install app version '${evt.version.hash}': ${evt.error}`);
          break;
        case 'VERSION_FAILED':
          console.log(`Version '${evt.version.hash}' failed with error: ${evt.error}`);
          break;
      }
    });
  }
}
// #enddocregion sw-update
