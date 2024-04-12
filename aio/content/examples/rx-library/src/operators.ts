// #docplaster
/*
  Because of how the code is merged together using the doc regions,
  we need to indent the imports with the function below.
*/
// #docregion
  import { of, map } from 'rxjs';

  /** source observable of integers. */
  const nums = of(1, 2, 3);
// #enddocregion

export function docRegionDefault(console: Console) {
  // #docregion

  /** A new squares observable created by piping through the `map` operator. */
  const squares = nums.pipe(
    map(num => num * num) // `map` configured with a function that squares each value.
  );

  // subscribe to the new observable
  squares.subscribe(value => console.log(value));

  // Logs
  // 1
  // 4
  // 9
  // #enddocregion
}

// #region former examples that might be worth documenting

export function docRegionCustomOperator(console: Console) {
  /** A custom operator created by capturing the result of a configured operator */
  const squareValuesOperator = map((value: number) => value * value);

  // Use it like any other operator
  nums.pipe(squareValuesOperator).subscribe(
    value => console.log(value)
  );

  /** Squaring observable created by passing the source observable directly to the operator (rare) */
  const squaredNums = squareValuesOperator(nums);

  squaredNums.subscribe(console.log); // same as subscribe(value => console.log(value)
}

// #endregion former examples that might be worth documenting

