
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

// #docregion

import { map } from 'rxjs/operators';

const nums = Observable.of(1, 2, 3);

const squareValues = map((val: number) => val * val);
const squaredNums = squareValues(nums);

squaredNums.subscribe(x => console.log(x));

// Logs
// 1
// 4
// 9

// #enddocregion
