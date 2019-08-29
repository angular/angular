import { Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';

// #docregion sw-update
@Injectable()
export class LogUpdateService {

  constructor(updates: SwUpdate) {
    updates.available.subscribe(event => {
      console.log('current version is', event.current);
      console.log('available version is', event.available);
    });
    updates.activated.subscribe(event => {
      console.log('old version was', event.previous);
      console.log('new version is', event.current);
    });
  }
}
// #enddocregion sw-update
