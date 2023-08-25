import { Observable, Observer } from 'rxjs';

export function docRegionSubscriber(console: Console) {
  // #docregion subscriber
  // This function runs when subscribe() is called
  function sequenceSubscriber(observer: Observer<number>) {
    // synchronously deliver 1, 2, and 3, then completes
    observer.next(1);
    observer.next(2);
    observer.next(3);
    observer.complete();

    // Return the unsubscribe function.
    // This one doesn't do anything
    // because values are delivered synchronously
    // and there is nothing to clean up.
    return {unsubscribe() {}};
  }

  // Create a new Observable that will deliver the above sequence
  const sequence = new Observable(sequenceSubscriber);

  // Execute the Observable and print the result of each notification
  sequence.subscribe({
    next(num) { console.log(num); },
    complete() { console.log('Finished sequence'); }
  });

  // Logs:
  // 1
  // 2
  // 3
  // Finished sequence
  // #enddocregion subscriber
}

