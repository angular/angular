// #docplaster
// #docregion
import { timer } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import { retry } from 'rxjs/operators';

export function backoff(maxTries: number, initialDelay: number) {
    return retry({
        count: maxTries,
        delay: (error, retryCount) => timer(initialDelay * retryCount ** 2),
      });
  }

// #enddocregion
/*
  This function declaration is necessary to ensure that it does not get called
  when running the unit tests. It will not get rendered into the docs.
  The indentation needs to start in the leftmost level position as well because of how
  the docplaster combines the different regions together.
*/
function docRegionAjaxCall() {
// #docregion
ajax('/api/endpoint')
  .pipe(backoff(3, 250))
  .subscribe(function handleData(data) { /* ... */ });
// #enddocregion
}
