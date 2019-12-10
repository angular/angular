// #docregion promise
// initiate execution
const promise = new Promise<number>((resolve, reject) => {
  // Executer fn...
});

promise.then(value => {
  // handle result here
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
