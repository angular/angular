// #docplaster
/*
  Because of how the code is merged together using the doc regions,
  we need to indent the imports with the function below.
*/
/* tslint:disable:align */
// #docregion interval
  import { interval } from 'rxjs';

// #enddocregion interval

export function docRegionInterval(console: Console) {
  // #docregion interval
  // Create an Observable that will publish a value on an interval
  const secondsCounter = interval(1000);
  // Subscribe to begin publishing values
  const subscription = secondsCounter.subscribe(n =>
    console.log(`It's been ${n + 1} seconds since subscribing!`));

  // #enddocregion interval
  return subscription;
}
