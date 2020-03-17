import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

// #docregion observable

// 실행 준비
const observable = new Observable<number>(observer => {
  // 구독자 함수
});

// 옵저버블을 구독합니다.
observable.subscribe(() => {
  // 데이터 처리
});

// #enddocregion observable

// #docregion unsubscribe

const subscription = observable.subscribe(() => {
  // 옵저버가 데이터를 처리하는 로직
});

subscription.unsubscribe();

// #enddocregion unsubscribe

// #docregion error

observable.subscribe(() => {
  throw Error('my error');
});

// #enddocregion error

// #docregion chain

observable.pipe(map(v => 2 * v));

// #enddocregion chain
