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
  promise
    .then(value => 2 * value)
    .then(value => -value);
  // #enddocregion chain

  return promise;
}

export function docRegionError(console = window.console) {
  // #docregion error
  const promise = Promise.reject('my error') // promise that errors
    .catch(error => 42) // recover from error
    .then(() => { throw new Error('another error'); }) // oops
    .then(null, error => { throw new Error('revised error'); }) // modify and rethrow
    .catch(error => {
      console.error(error.toString()); // report error ...
      throw error; // and rethrow so promise remains "rejected"
    });

  // #enddocregion error
  return promise;
}
