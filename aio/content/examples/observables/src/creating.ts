// #docplaster

import { Observable } from 'rxjs';

export function docRegionSubscriber(console) {
  // #docregion subscriber
  // This function runs when subscribe() is called
  function sequenceSubscriber(observer) {
    // synchronously deliver 1, 2, and 3, then complete
    observer.next(1);
    observer.next(2);
    observer.next(3);
    observer.complete();

    // unsubscribe function doesn't need to do anything in this
    // because values are delivered synchronously
    return {unsubscribe() {}};
  }

  // Create a new Observable that will deliver the above sequence
  const sequence = new Observable(sequenceSubscriber);

  // execute the Observable and print the result of each notification
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

// #docregion fromevent

function fromEvent(target, eventName) {
  return new Observable((observer) => {
    const handler = (e) => observer.next(e);

    // Add the event handler to the target
    target.addEventListener(eventName, handler);

    return () => {
      // Detach the event handler from the target
      target.removeEventListener(eventName, handler);
    };
  });
}

// #enddocregion fromevent

export function docRegionFromEvent(document) {
  // #docregion fromevent_use

  const ESC_KEY = 27;
  const nameInput = document.getElementById('name') as HTMLInputElement;

  const subscription = fromEvent(nameInput, 'keydown').subscribe((e: KeyboardEvent) => {
    if (e.keyCode === ESC_KEY) {
      nameInput.value = '';
    }
  });
  // #enddocregion fromevent_use
  return subscription;
}

