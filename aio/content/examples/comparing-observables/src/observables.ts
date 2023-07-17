// #docplaster

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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

export function docRegionError() {
  const observable = new Observable<number>(() => {
    // Subscriber fn...
  });

  // #docregion error
  observable.subscribe(() => {
    throw new Error('my error');
  });
  // #enddocregion error
}

export function docRegionChain() {
  let observable = new Observable<number>(observer => {
    // Subscriber fn...
    observer.next(2);
  });

  observable =
  // #docregion chain

  observable.pipe(map(v => 2 * v));

  // #enddocregion chain
  return observable;
}
