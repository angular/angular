// #docplaster
// #docregion
import { of, pipe, range, throwError, timer, zip } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import { map, mergeMap, retryWhen } from 'rxjs/operators';

export function backoff(maxTries, delay) {
  return pipe(
    retryWhen(attempts =>
      zip(range(1, maxTries + 1), attempts).pipe(
        mergeMap(([i, err]) => (i > maxTries) ? throwError(err) : of(i)),
        map(i => i * i),
        mergeMap(v => timer(v * delay)),
      ),
    ),
  );
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
