// #docplaster
/*
  Because of how the code is merged together using the doc regions,
  we need to indent the imports with the function below.
*/
/* tslint:disable:align */
// #docregion
  import { of, pipe } from 'rxjs';
  import { filter, map } from 'rxjs/operators';

// #enddocregion

export function docRegionDefault(console: Console) {
  // #docregion
  const nums = of(1, 2, 3, 4, 5);

  // Create a function that accepts an Observable.
  const squareOddVals = pipe(
    filter((n: number) => n % 2 !== 0),
    map(n => n * n)
  );

  // Create an Observable that will run the filter and map functions
  const squareOdd = squareOddVals(nums);

  // Subscribe to run the combined functions
  squareOdd.subscribe(x => console.log(x));

  // #enddocregion
}
