// #docplaster
import { Injectable } from '@angular/core';
import { filter } from 'rxjs/operators';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';

function promptUser(event: VersionReadyEvent): boolean {
  return true;
}

// #docregion sw-version-ready
@Injectable()
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
  }

}
// #enddocregion sw-version-ready
