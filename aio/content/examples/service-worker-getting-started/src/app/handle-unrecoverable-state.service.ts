import { Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';

function notifyUser(message: string): void { }

// #docregion sw-unrecoverable-state
@Injectable()
export class HandleUnrecoverableStateService {
  constructor(updates: SwUpdate) {
    updates.unrecoverable.subscribe(event => {
      notifyUser(
        'An error occurred that we cannot recover from:\n' +
        event.reason +
        '\n\nPlease reload the page.'
      );
    });
  }
}
// #enddocregion sw-unrecoverable-state
