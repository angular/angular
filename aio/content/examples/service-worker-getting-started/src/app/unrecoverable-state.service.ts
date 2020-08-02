import { Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';

// #docregion sw-unrecoverable-state
@Injectable()
export class UnrecoverableStateService {

  constructor(updates: SwUpdate) {
    updates.unrecoverable.subscribe(event => {
        document.location.reload();
    });
  }
}
// #enddocregion sw-unrecoverable-state
