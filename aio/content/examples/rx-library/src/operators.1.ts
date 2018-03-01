import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

// #docregion

import { pipe } from 'rxjs/util/pipe';
import { filter, map } from 'rxjs/operators';

const nums = Observable.of(1, 2, 3, 4, 5);

// Create a function that accepts an Observable.
const squareOddVals = pipe(
  filter(n => n % 2),
  map(n => n * n)
);

// Create an Observable that will run the filter and map functions
const squareOdd = squareOddVals(nums);

// Suscribe to run the combined functions
squareOdd.subscribe(x => console.log(x));

// #enddocregion


