// #docplaster
/*
  Because of how the code is merged together using the doc regions,
  we need to indent the imports with the function below.
*/
// #docregion
  import { of, filter, map } from 'rxjs';

// #enddocregion

export function docRegionDefault(console: Console) {
  // #docregion
  const squareOdd = of(1, 2, 3, 4, 5)
    .pipe(
      filter(n => n % 2 === 1),
      map(n => n * n)
    );

  // Subscribe to get values
  squareOdd.subscribe(x => console.log(x));

  // #enddocregion
}
