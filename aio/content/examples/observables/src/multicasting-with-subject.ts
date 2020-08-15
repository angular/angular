import { Subject } from 'rxjs';

// #docregion multicast_with_subject

const pagination = new Subject<number>();

pagination.subscribe({
  next: (index) => {
    // Value of next button
    console.log('Previous index: ' + (Number(index) - 1));
  }
});

pagination.subscribe({
  next: (index) => {
    console.log('Current index: ' + index);
  }
});

pagination.subscribe({
  next: (index) => {
    // Value of previous button
    console.log('Next index: ' + (Number(index) + 1));
  }
});

setTimeout(() => {
  pagination.next(1);
}, 1000);

/**
 * LOGS
 * Previous index: 0
 * Current index: 1
 * Next index: 2
 *
 */

// #enddocregion multicast_with_subject
