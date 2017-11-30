import { SwUpdate } from '@angular/service-worker';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/interval';

function promptUser(event): boolean {
  return true;
}

// #docregion sw-check-update
export class CheckForUpdateService {

  constructor(updates: SwUpdate) {
    Observable.interval(6 * 60 * 60).subscribe(() => updates.checkForUpdate());
  }
}
// #enddocregion sw-check-update