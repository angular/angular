
import { Observable, of } from 'rxjs';

// #docregion observer

// 3개의 값을 전달하도록 옵저버블을 간단하게 정의합니다.
const myObservable = Observable.of(1, 2, 3);

// 옵저버 객체를 정의합니다.
const myObserver = {
  next: x => console.log('Observer got a next value: ' + x),
  error: err => console.error('Observer got an error: ' + err),
  complete: () => console.log('Observer got a complete notification'),
};

// 옵저버 객체를 실행합니다.
myObservable.subscribe(myObserver);
// 로그:
// Observer got a next value: 1
// Observer got a next value: 2
// Observer got a next value: 3
// Observer got a complete notification

// #enddocregion observer

// #docregion sub_fn
myObservable.subscribe(
  x => console.log('Observer got a next value: ' + x),
  err => console.error('Observer got an error: ' + err),
  () => console.log('Observer got a complete notification')
);
// #enddocregion sub_fn
