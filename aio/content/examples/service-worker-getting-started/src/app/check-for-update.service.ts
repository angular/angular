import { Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';


// #docregion sw-check-update
import { timer } from 'rxjs';

@Injectable()
export class CheckForUpdateService {

  constructor(updates: SwUpdate) {
    timer(1000, 1000 * 60 * 60).subscribe(() => updates.checkForUpdate());
  }
}
// #enddocregion sw-check-update
