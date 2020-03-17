// #docregion promise
// 실행 준비
const promise = new Promise<number>((resolve, reject) => {
  // 실행 함수
});

promise.then(value => {
  // 데이터 처리
});

// #enddocregion promise

// #docregion chain

promise.then(v => 2 * v);

// #enddocregion chain

// #docregion error

promise.then(() => {
  throw Error('my error');
});

// #enddocregion error
