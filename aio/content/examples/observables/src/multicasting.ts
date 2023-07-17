// #docplaster

import { Observable, Observer } from 'rxjs';

export function docRegionDelaySequence(console: Console) {
  // #docregion delay_sequence
  function sequenceSubscriber(observer: Observer<number>) {
    const seq = [1, 2, 3];
    let clearTimer: VoidFunction | undefined;

    // Will run through an array of numbers, emitting one value
    // per second until it gets to the end of the array.
    function doInSequence(arr: number[], idx: number) {
      const timeout = setTimeout(() => {
        observer.next(arr[idx]);
        if (idx === arr.length - 1) {
          observer.complete();
        } else {
          doInSequence(arr, ++idx);
        }
      }, 1000);
      clearTimer = () => clearTimeout(timeout);
    }

    doInSequence(seq, 0);

    // Unsubscribe should clear the timeout to stop execution
    return {
      unsubscribe() {
        clearTimer?.();
      }
    };
  }

  // Create a new Observable that will deliver the above sequence
  const sequence = new Observable(sequenceSubscriber);

  sequence.subscribe({
    next(num) { console.log(num); },
    complete() { console.log('Finished sequence'); }
  });

  // Logs:
  // (at 1 second): 1
  // (at 2 seconds): 2
  // (at 3 seconds): 3
  // (at 3 seconds): Finished sequence

  // #enddocregion delay_sequence

  // #docregion subscribe_twice

  // Subscribe starts the clock, and will emit after 1 second
  sequence.subscribe({
    next(num) { console.log('1st subscribe: ' + num); },
    complete() { console.log('1st sequence finished.'); }
  });

  // After 1/2 second, subscribe again.
  setTimeout(() => {
    sequence.subscribe({
      next(num) { console.log('2nd subscribe: ' + num); },
      complete() { console.log('2nd sequence finished.'); }
    });
  }, 500);

  // Logs:
  // (at 1 second): 1st subscribe: 1
  // (at 1.5 seconds): 2nd subscribe: 1
  // (at 2 seconds): 1st subscribe: 2
  // (at 2.5 seconds): 2nd subscribe: 2
  // (at 3 seconds): 1st subscribe: 3
  // (at 3 seconds): 1st sequence finished
  // (at 3.5 seconds): 2nd subscribe: 3
  // (at 3.5 seconds): 2nd sequence finished

  // #enddocregion subscribe_twice
}

export function docRegionMulticastSequence(console: Console, runSequence: boolean) {
  if (!runSequence) {
    return multicastSequenceSubscriber;
  }
  // #docregion multicast_sequence
  function multicastSequenceSubscriber() {
    const seq = [1, 2, 3];
    // Keep track of each observer (one for every active subscription)
    const observers: Observer<unknown>[] = [];
    // Still a single timer because there will only ever be one
    // set of values being generated, multicasted to each subscriber
    let clearTimer: VoidFunction | undefined;

    // Return the subscriber function (runs when subscribe()
    // function is invoked)
    return (observer: Observer<unknown>) => {
      observers.push(observer);
      // When this is the first subscription, start the sequence
      if (observers.length === 1) {
        const multicastObserver: Observer<number> = {
          next(val) {
            // Iterate through observers and notify all subscriptions
            observers.forEach(obs => obs.next(val));
          },
          error() { /* Handle the error... */ },
          complete() {
            // Notify all complete callbacks
            observers.slice(0).forEach(obs => obs.complete());
          }
        };
        doSequence(multicastObserver, seq, 0);
      }

      return {
        unsubscribe() {
          // Remove from the observers array so it's no longer notified
          observers.splice(observers.indexOf(observer), 1);
          // If there's no more listeners, do cleanup
          if (observers.length === 0) {
            clearTimer?.();
          }
        }
      };

      // Run through an array of numbers, emitting one value
      // per second until it gets to the end of the array.
      function doSequence(sequenceObserver: Observer<number>, arr: number[], idx: number) {
        const timeout = setTimeout(() => {
          console.log('Emitting ' + arr[idx]);
          sequenceObserver.next(arr[idx]);
          if (idx === arr.length - 1) {
            sequenceObserver.complete();
          } else {
            doSequence(sequenceObserver, arr, ++idx);
          }
        }, 1000);
        clearTimer = () => clearTimeout(timeout);
      }
    };
  }

  // Create a new Observable that will deliver the above sequence
  const multicastSequence = new Observable(multicastSequenceSubscriber());

  // Subscribe starts the clock, and begins to emit after 1 second
  multicastSequence.subscribe({
    next(num) { console.log('1st subscribe: ' + num); },
    complete() { console.log('1st sequence finished.'); }
  });

  // After 1 1/2 seconds, subscribe again (should "miss" the first value).
  setTimeout(() => {
    multicastSequence.subscribe({
      next(num) { console.log('2nd subscribe: ' + num); },
      complete() { console.log('2nd sequence finished.'); }
    });
  }, 1500);

  // Logs:
  // (at 1 second): Emitting 1
  // (at 1 second): 1st subscribe: 1
  // (at 2 seconds): Emitting 2
  // (at 2 seconds): 1st subscribe: 2
  // (at 2 seconds): 2nd subscribe: 2
  // (at 3 seconds): Emitting 3
  // (at 3 seconds): 1st subscribe: 3
  // (at 3 seconds): 2nd subscribe: 3
  // (at 3 seconds): 1st sequence finished
  // (at 3 seconds): 2nd sequence finished

  // #enddocregion multicast_sequence

  return multicastSequenceSubscriber;
}
