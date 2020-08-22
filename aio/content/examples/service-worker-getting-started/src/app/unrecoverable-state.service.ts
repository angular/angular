import { Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';

function alertUser(message): boolean {
  return true;
}

// #docregion sw-unrecoverable-state
@Injectable()
export class HandleUnrecoverableStateService {
  constructor(updates: SwUpdate) {
    updates.unrecoverable.subscribe(event => {
      alertUser(
        `An error occurred that we cannot recover from:\n${event.reason}\n\n` +
        'Please reload the page.');
    });
  }
}
// #enddocregion sw-unrecoverable-state
