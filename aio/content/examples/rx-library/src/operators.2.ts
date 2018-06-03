import { Observable, of } from 'rxjs';

// #docregion

import { filter, map } from 'rxjs/operators';

const squareOdd = of(1, 2, 3, 4, 5)
  .pipe(
    filter(n => n % 2 !== 0),
    map(n => n * n)
  );

// 구독을 시작합니다.
squareOdd.subscribe(x => console.log(x));

// #enddocregion
