/*
* Mock async observables that return asynchronously.
* The observable either emits once and completes or errors.
*
* Must call `tick()` when test with `fakeAsync()`.
*
* THE FOLLOWING DON'T WORK
* Using `of().delay()` triggers TestBed errors;
* see https://github.com/angular/angular/issues/10127 .
*
* Using `asap` scheduler - as in `of(value, asap)` - doesn't work either.
*/
import { defer } from 'rxjs';

// #docregion async-data
/** JS 실행 싸이클이 한 번 실행된 뒤에 Observable을 보내고 바로 종료합니다. */
export function asyncData<T>(data: T) {
  return defer(() => Promise.resolve(data));
}
// #enddocregion async-data

// #docregion async-error
/** JS 실행 싸이클이 한 번 실행된 뒤에 에러 Observable을 보내고 바로 종료합니다. */
export function asyncError<T>(errorObject: any) {
  return defer(() => Promise.reject(errorObject));
}
// #enddocregion async-error
