import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

// #docregion

import { filter } from 'rxjs/operators/filter';
import { map } from 'rxjs/operators/map';

const squareOdd = Observable.of(1, 2, 3, 4, 5)
  .pipe(
    filter(n => n % 2),
    map(n => n * n)
  );

// Subscribe to get values
squareOdd.subscribe(x => console.log(x));

// #enddocregion
