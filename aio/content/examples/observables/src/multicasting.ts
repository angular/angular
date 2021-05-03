// #docplaster

import { Observable } from 'rxjs';

export function docRegionDelaySequence(console) {
  // #docregion delay_sequence
  function sequenceSubscriber(observer) {
    const seq = [1, 2, 3];
    let timeoutId;

    // Will run through an array of numbers, emitting one value
    // per second until it gets to the end of the array.
    function doInSequence(arr, idx) {
      timeoutId = setTimeout(() => {
        observer.next(arr[idx]);
        if (idx === arr.length - 1) {
          observer.complete();
        } else {
          doInSequence(arr, ++idx);
        }
      }, 1000);
    }

    doInSequence(seq, 0);

    // Unsubscribe should clear the timeout to stop execution
    return {
      unsubscribe() {
        clearTimeout(timeoutId);
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

export function docRegionMulticastSequence(console) {
  // #docregion multicast_sequence
  function multicastSequenceSubscriber() {
    const seq = [1, 2, 3];
    // Keep track of each observer (one for every active subscription)
    const observers = [];
    // Still a single timeoutId because there will only ever be one
    // set of values being generated, multicasted to each subscriber
    let timeoutId;

    // Return the subscriber function (runs when subscribe()
    // function is invoked)
    return observer => {
      observers.push(observer);
      // When this is the first subscription, start the sequence
      if (observers.length === 1) {
        timeoutId = doSequence({
          next(val) {
            // Iterate through observers and notify all subscriptions
            observers.forEach(obs => obs.next(val));
          },
          complete() {
            // Notify all complete callbacks
            observers.slice(0).forEach(obs => obs.complete());
          }
        }, seq, 0);
      }

      return {
        unsubscribe() {
          // Remove from the observers array so it's no longer notified
          observers.splice(observers.indexOf(observer), 1);
          // If there's no more listeners, do cleanup
          if (observers.length === 0) {
            clearTimeout(timeoutId);
          }
        }
      };
    };
  }

  // Run through an array of numbers, emitting one value
  // per second until it gets to the end of the array.
  function doSequence(observer, arr, idx) {
    return setTimeout(() => {
      observer.next(arr[idx]);
      if (idx === arr.length - 1) {
        observer.complete();
      } else {
        doSequence(observer, arr, ++idx);
      }
    }, 1000);
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
  // (at 1 second): 1st subscribe: 1
  // (at 2 seconds): 1st subscribe: 2
  // (at 2 seconds): 2nd subscribe: 2
  // (at 3 seconds): 1st subscribe: 3
  // (at 3 seconds): 1st sequence finished
  // (at 3 seconds): 2nd subscribe: 3
  // (at 3 seconds): 2nd sequence finished

  // #enddocregion multicast_sequence
}
