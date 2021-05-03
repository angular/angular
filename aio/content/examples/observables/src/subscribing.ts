// #docplaster
import { of } from 'rxjs';

export function docRegionObserver(console) {
  // #docregion observer

  // Create simple observable that emits three values
  const myObservable = of(1, 2, 3);

  // Create observer object
  const myObserver = {
    next: x => console.log('Observer got a next value: ' + x),
    error: err => console.error('Observer got an error: ' + err),
    complete: () => console.log('Observer got a complete notification'),
  };

  // Execute with the observer object
  myObservable.subscribe(myObserver);

  // Logs:
  // Observer got a next value: 1
  // Observer got a next value: 2
  // Observer got a next value: 3
  // Observer got a complete notification

  // #enddocregion observer

  // #docregion sub_fn
  myObservable.subscribe(
    x => console.log('Observer got a next value: ' + x),
    err => console.error('Observer got an error: ' + err),
    () => console.log('Observer got a complete notification')
  );
  // #enddocregion sub_fn
}
