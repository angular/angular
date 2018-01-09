
import { ajax } from 'rxjs/observable/dom/ajax';
import { range } from 'rxjs/observable/range';
import { timer } from 'rxjs/observable/timer';
import { pipe } from 'rxjs/util/pipe';
import { retryWhen, zip, map, mergeMap } from 'rxjs/operators';

function backoff(maxTries, ms) {
 return pipe(
   retryWhen(attempts => range(1, maxTries)
     .pipe(
       zip(attempts, (i) => i),
       map(i => i * i),
       mergeMap(i =>  timer(i * ms))
     )
   )
 );
}

ajax('/api/endpoint')
  .pipe(backoff(3, 250))
  .subscribe(data => handleData(data));

function handleData(data) {
  // ...
}
