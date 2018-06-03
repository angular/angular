
// #docregion promise

import { fromPromise } from 'rxjs';

// Promise를 옵저버블로 변환합니다.
const data = fromPromise(fetch('/api/endpoint'));
// 구독을 시작하고 Promise가 반환하는 객체를 처리합니다.
data.subscribe({
 next(response) { console.log(response); },
 error(err) { console.error('Error: ' + err); },
 complete() { console.log('Completed'); }
});

// #enddocregion promise

// #docregion interval

import { interval } from 'rxjs';

// 타이머를 옵저버블로 변환합니다.
const secondsCounter = interval(1000);
// 구독을 시작하고 타이머가 반환하는 값을 처리합니다.
secondsCounter.subscribe(n =>
  console.log(`It's been ${n} seconds since subscribing!`));

// #enddocregion interval


// #docregion event

import { fromEvent } from 'rxjs';

const el = document.getElementById('my-element');

// 마우스가 움직이는 이벤트를 옵저버블로 변환합니다.
const mouseMoves = fromEvent(el, 'mousemove');

// 구독을 시작하고 마우스가 움직이는 이벤트를 처리합니다.
const subscription = mouseMoves.subscribe((evt: MouseEvent) => {
  // 마우스의 위치를 로그로 출력합니다.
  console.log(`Coords: ${evt.clientX} X ${evt.clientY}`);

  // 마우스가 화면 왼쪽 위로 움직이면 구독을 해지합니다.
  if (evt.clientX < 40 && evt.clientY < 40) {
    subscription.unsubscribe();
  }
});

// #enddocregion event


// #docregion ajax

import { ajax } from 'rxjs/ajax';

// AJAX 요청을 옵저버블로 변환합니다.
const apiData = ajax('/api/data');
// 구독을 시작하고 AJAX 요청을 보냅니다.
apiData.subscribe(res => console.log(res.status, res.response));

// #enddocregion ajax


