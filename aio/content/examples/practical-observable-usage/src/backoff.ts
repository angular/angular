
import { iif, of, pipe, throwError } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import { concatMap, delay, retryWhen } from 'rxjs/operators';

function backoff(maxTries, ms) {
  return pipe(
    retryWhen(errors => errors.pipe(
      // retry in order
      concatMap((err, n) => iif(
        () => n < maxTries,
        // add delay to error with random jitter
        of(err).pipe(delay((2 + Math.random()) ** n * ms)),
        throwError(err)
      ))
    ))
  );
}

ajax('/api/endpoint')
  .pipe(backoff(3, 250))
  .subscribe(data => handleData(data), err => handleError(err));

function handleData(data) {
  // ...
}

function handleError(data) {
  // ...
}
