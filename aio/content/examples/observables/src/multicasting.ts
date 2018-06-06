
import { Observable } from 'rxjs';

// #docregion delay_sequence

function sequenceSubscriber(observer) {
  const seq = [1, 2, 3];
  let timeoutId;

  // 배열을 순회하면서 배열의 항목을 1초마다 하나씩 발행합니다.
  function doSequence(arr, idx) {
    timeoutId = setTimeout(() => {
      observer.next(arr[idx]);
      if (idx === arr.length - 1) {
        observer.complete();
      } else {
        doSequence(arr, idx++);
      }
    }, 1000);
  }

  doSequence(seq, 0);

  // 구독이 해지되면 타이머를 중지합니다.
  return {unsubscribe() {
    clearTimeout(timeoutId);
  }};
}

// 위에서 정의한 데이터 스트림을 발생하는 옵저버블을 생성합니다.
const sequence = new Observable(sequenceSubscriber);

sequence.subscribe({
  next(num) { console.log(num); },
  complete() { console.log('Finished sequence'); }
});

// 로그:
// (1초 후): 1
// (2초 후): 2
// (3초 후): 3
// (3초 후): Finished sequence

// #enddocregion delay_sequence

// #docregion subscribe_twice

// 구독을 시작하면 타이머가 시작되면서, 1초마다 데이터가 전달됩니다.
sequence.subscribe({
  next(num) { console.log('1st subscribe: ' + num); },
  complete() { console.log('1st sequence finished.'); }
});

// 0.5초 후에 새로운 구독을 시작합니다.
setTimeout(() => {
  sequence.subscribe({
    next(num) { console.log('2nd subscribe: ' + num); },
    complete() { console.log('2nd sequence finished.'); }
  });
}, 500);

// 로그:
// (1초 후): 1st subscribe: 1
// (1.5초 후): 2nd subscribe: 1
// (2초 후): 1st subscribe: 2
// (2.5초 후): 2nd subscribe: 2
// (3초 후): 1st subscribe: 3
// (3초 후): 1st sequence finished
// (3.5초 후): 2nd subscribe: 3
// (3.5초 후): 2nd sequence finished

// #enddocregion subscribe_twice

// #docregion multicast_sequence

function multicastSequenceSubscriber() {
  const seq = [1, 2, 3];
  // 구독중인 옵저버를 추적합니다.
  const observers = [];
  // 한 번 생성된 데이터는 모든 구독자에게 멀티캐스팅되기 때문에
  // 타이머 id는 하나로 관리합니다.
  let timeoutId;

  // 구독자 함수를 반환합니다.
  // 이 함수는 subscribe()가 실행될 때 함께 실행됩니다.
  return (observer) => {
    observers.push(observer);
    // 구독이 처음 실행되면 스트림을 발생하기 시작합니다.
    if (observers.length === 1) {
      timeoutId = doSequence({
        next(val) {
          // 모든 구독에 대해 스트림을 발행합니다.
          observers.forEach(obs => obs.next(val));
        },
        complete() {
          // 모든 구독에 종료 스트림을 전달합니다.
          observers.forEach(obs => obs.complete());
        }
      }, seq, 0);
    }

    return {
      unsubscribe() {
        // 구독을 해지한 옵저버는 배열에서 제거합니다.
        observers.splice(observers.indexOf(observer), 1);
        // 구독자가 없으면 타이머를 종료합니다.
        if (observers.length === 0) {
          clearTimeout(timeoutId);
        }
      }
    };
  };
}

// 배열을 순회하면서 1초마다 하나씩 스트림을 발행합니다.
function doSequence(observer, arr, idx) {
  return setTimeout(() => {
    observer.next(arr[idx]);
    if (idx === arr.length - 1) {
      observer.complete();
    } else {
      doSequence(observer, arr, idx++);
    }
  }, 1000);
}

// doSequence()에 정의된 스트림을 발행하는 옵저버블을 생성합니다.
const multicastSequence = new Observable(multicastSequenceSubscriber);

// 옵저버블을 구독하면 타이머를 시작하고 1초마다 스트림을 받습니다.
multicastSequence.subscribe({
  next(num) { console.log('1st subscribe: ' + num); },
  complete() { console.log('1st sequence finished.'); }
});

// 0.5초 후에 또 다른 구독을 시작합니다.
// (첫번째 값은 다시 받지 않습니다.)
setTimeout(() => {
  multicastSequence.subscribe({
    next(num) { console.log('2nd subscribe: ' + num); },
    complete() { console.log('2nd sequence finished.'); }
  });
}, 1500);

// 로그:
// (1초 후): 1st subscribe: 1
// (2초 후): 1st subscribe: 2
// (2초 후): 2nd subscribe: 2
// (3초 후): 1st subscribe: 3
// (3초 후): 1st sequence finished
// (3초 후): 2nd subscribe: 3
// (3초 후): 2nd sequence finished

// #enddocregion multicast_sequence
