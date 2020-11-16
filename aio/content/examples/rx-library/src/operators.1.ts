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

export function docRegionDefault(console) {
  // #docregion
  const nums = of(1, 2, 3, 4, 5);

  // 옵저버블을 처리하는 함수를 정의합니다.
  const squareOddVals = pipe(
    filter((n: number) => n % 2 !== 0),
    map(n => n * n)
  );

  // filter()와 map()을 실행하는 옵저버블을 생성합니다.
  const squareOdd = squareOddVals(nums);

  // 구독을 시작합니다.
  squareOdd.subscribe(x => console.log(x));

  // #enddocregion
}
