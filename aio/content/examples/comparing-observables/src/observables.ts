// #docplaster

import {
  Observable, concat, interval, of,
  catchError, delay, map, take,
} from 'rxjs';

export function docRegionObservable(console: Console) {
  // #docregion observable

  // declare a publishing operation
  const observable = new Observable<number>(observer => {
    // Subscriber fn...
    // #enddocregion observable
    // The below code is used for unit testing only
    observer.next(2);
    // #docregion observable
  });

  // initiate execution
  observable.subscribe(value => {
    // observer handles notifications
    // #enddocregion observable
    // The below code is used for unit testing only
    console.log(value);
    // #docregion observable
  });

  // #enddocregion observable
  return observable;
}

export function docRegionUnsubscribe() {
  const observable = new Observable<number>(() => {
    // Subscriber fn...
  });
  // #docregion unsubscribe

  const subscription = observable.subscribe(() => {
    // observer handles notifications
  });

  subscription.unsubscribe();

  // #enddocregion unsubscribe
  return subscription;
}

export function docRegionError(console = window.console) {
  // #docregion error
  const observable = new Observable<number>(() => {
    throw new Error('my error');
  });

  observable.pipe(
    catchError(error => of(42)), // recover within the operator
    map(() => { throw new Error('another error'); }), // oops
    catchError(error => { throw new Error('revised error'); }) // modify and rethrow
  ).subscribe({
    error: err => console.error(err) // report error in subscribe
  });
  // #enddocregion error
}

export function docRegionOperators() {
  // #docregion operators
  /** Emit 0, 2, 4 every 10ms */
  const observable1$ = interval(10).pipe(
    map(value  => 2 * value), // double the interval values: 0, 1, 2, ...
    take(3) // take only the first 3 emitted values
  );

  /** Emit 'Ta Da!' after 10ms */
  const observable2$ = of('Ta Da!').pipe(delay(10));

  /** Observable processes all of observable1 first, then all of observable2.
   * Emits 0, 2, 4, 'Ta Da! after about 40ms' */
  const combined$ = concat(observable1$, observable2$);
  // #enddocregion operators

  return combined$;
}
