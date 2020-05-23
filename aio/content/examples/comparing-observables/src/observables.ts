import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

// #docregion observable

// declare a publishing operation
const observable = new Observable<number>(observer => {
  // Subscriber fn...
});

// initiate execution
observable.subscribe(() => {
  // observer handles notifications
});

// #enddocregion observable

// #docregion unsubscribe

const subscription = observable.subscribe(() => {
  // observer handles notifications
});

subscription.unsubscribe();

// #enddocregion unsubscribe

// #docregion error

observable.subscribe(() => {
  throw Error('my error');
});

// #enddocregion error

// #docregion chain

observable.pipe(map(v => 2 * v));

// #enddocregion chain
