// #docplaster

export function docRegionPromise(console: Console, inputValue: number) {
  // #docregion promise
  // initiate execution
  let promise = new Promise<number>(resolve => {
    // Executer fn...
    // #enddocregion promise
    // The below is used in the unit tests.
    resolve(inputValue);
    // #docregion promise
  });
  // #enddocregion promise
  promise =
  // #docregion promise
  promise.then(value => {
    // handle result here
    // #enddocregion promise
    // The below is used in the unit tests.
    console.log(value);
    return value;
    // #docregion promise
  });
  // #enddocregion promise
  promise =
  // #docregion chain
  promise.then(v => 2 * v);
  // #enddocregion chain

  return promise;
}

export function docRegionError() {
  let promise = Promise.resolve();
  promise =
  // #docregion error

  promise.then(() => {
    throw new Error('my error');
  });

  // #enddocregion error
  return promise;
}
