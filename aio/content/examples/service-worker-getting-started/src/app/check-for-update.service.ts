import { Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';


// #docregion sw-check-update
import { interval } from 'rxjs';

@Injectable()
export class CheckForUpdateService {

  constructor(updates: SwUpdate) {
    interval(6 * 60 * 60).subscribe(() => updates.checkForUpdate());
  }
}
// #enddocregion sw-check-update
