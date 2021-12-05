// #docplaster
/*
  Because of how the code is merged together using the doc regions,
  we need to indent the imports with the function below.
*/
// #docregion
  import { of } from 'rxjs';
  import { filter, map } from 'rxjs/operators';

// #enddocregion

export function docRegionDefault(console: Console) {
  // #docregion
  const squareOdd = of(1, 2, 3, 4, 5)
    .pipe(
      filter(n => n % 2 !== 0),
      map(n => n * n)
    );

  // Subscribe to get values
  squareOdd.subscribe(x => console.log(x));

  // #enddocregion
}
