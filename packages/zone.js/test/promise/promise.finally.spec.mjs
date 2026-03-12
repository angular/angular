'use strict';

import assert from 'assert';
import adapter from './promise-adapter.mjs';

var P = global[Zone.__symbol__('Promise')];

var someRejectionReason = {message: 'some rejection reason'};
var anotherReason = {message: 'another rejection reason'};
process.on('unhandledRejection', function (reason, promise) {
  console.log('unhandledRejection', reason);
});

describe('mocha promise sanity check', () => {
  it('passes with a resolved promise', () => {
    return P.resolve(3);
  });

  it('passes with a rejected then resolved promise', () => {
    return P.reject(someRejectionReason).catch((x) => 'this should be resolved');
  });

  var ifPromiseIt = P === Promise ? it : it.skip;
  ifPromiseIt('is the native Promise', () => {
    assert.equal(P, Promise);
  });
});

describe('onFinally', () => {
  describe('no callback', () => {
    specify('from resolved', (done) => {
      adapter
        .resolved(3)
        .then((x) => {
          assert.strictEqual(x, 3);
          return x;
        })
        .finally()
        .then(
          function onFulfilled(x) {
            assert.strictEqual(x, 3);
            done();
          },
          function onRejected() {
            done(new Error('should not be called'));
          },
        );
    });

    specify('from rejected', (done) => {
      adapter
        .rejected(someRejectionReason)
        .catch((e) => {
          assert.strictEqual(e, someRejectionReason);
          throw e;
        })
        .finally()
        .then(
          function onFulfilled() {
            done(new Error('should not be called'));
          },
          function onRejected(reason) {
            assert.strictEqual(reason, someRejectionReason);
            done();
          },
        );
    });
  });

  describe('throws an exception', () => {
    specify('from resolved', (done) => {
      adapter
        .resolved(3)
        .then((x) => {
          assert.strictEqual(x, 3);
          return x;
        })
        .finally(function onFinally() {
          assert(arguments.length === 0);
          throw someRejectionReason;
        })
        .then(
          function onFulfilled() {
            done(new Error('should not be called'));
          },
          function onRejected(reason) {
            assert.strictEqual(reason, someRejectionReason);
            done();
          },
        );
    });

    specify('from rejected', (done) => {
      adapter
        .rejected(anotherReason)
        .finally(function onFinally() {
          assert(arguments.length === 0);
          throw someRejectionReason;
        })
        .then(
          function onFulfilled() {
            done(new Error('should not be called'));
          },
          function onRejected(reason) {
            assert.strictEqual(reason, someRejectionReason);
            done();
          },
        );
    });
  });

  describe('returns a non-promise', () => {
    specify('from resolved', (done) => {
      adapter
        .resolved(3)
        .then((x) => {
          assert.strictEqual(x, 3);
          return x;
        })
        .finally(function onFinally() {
          assert(arguments.length === 0);
          return 4;
        })
        .then(
          function onFulfilled(x) {
            assert.strictEqual(x, 3);
            done();
          },
          function onRejected() {
            done(new Error('should not be called'));
          },
        );
    });

    specify('from rejected', (done) => {
      adapter
        .rejected(anotherReason)
        .catch((e) => {
          assert.strictEqual(e, anotherReason);
          throw e;
        })
        .finally(function onFinally() {
          assert(arguments.length === 0);
          throw someRejectionReason;
        })
        .then(
          function onFulfilled() {
            done(new Error('should not be called'));
          },
          function onRejected(e) {
            assert.strictEqual(e, someRejectionReason);
            done();
          },
        );
    });
  });

  describe('returns a pending-forever promise', () => {
    specify('from resolved', (done) => {
      var timeout;
      adapter
        .resolved(3)
        .then((x) => {
          assert.strictEqual(x, 3);
          return x;
        })
        .finally(function onFinally() {
          assert(arguments.length === 0);
          timeout = setTimeout(done, 0.1e3);
          return new P(() => {}); // forever pending
        })
        .then(
          function onFulfilled(x) {
            clearTimeout(timeout);
            done(new Error('should not be called'));
          },
          function onRejected() {
            clearTimeout(timeout);
            done(new Error('should not be called'));
          },
        );
    });

    specify('from rejected', (done) => {
      var timeout;
      adapter
        .rejected(someRejectionReason)
        .catch((e) => {
          assert.strictEqual(e, someRejectionReason);
          throw e;
        })
        .finally(function onFinally() {
          assert(arguments.length === 0);
          timeout = setTimeout(done, 0.1e3);
          return new P(() => {}); // forever pending
        })
        .then(
          function onFulfilled(x) {
            clearTimeout(timeout);
            done(new Error('should not be called'));
          },
          function onRejected() {
            clearTimeout(timeout);
            done(new Error('should not be called'));
          },
        );
    });
  });

  describe('returns an immediately-fulfilled promise', () => {
    specify('from resolved', (done) => {
      adapter
        .resolved(3)
        .then((x) => {
          assert.strictEqual(x, 3);
          return x;
        })
        .finally(function onFinally() {
          assert(arguments.length === 0);
          return adapter.resolved(4);
        })
        .then(
          function onFulfilled(x) {
            assert.strictEqual(x, 3);
            done();
          },
          function onRejected() {
            done(new Error('should not be called'));
          },
        );
    });

    specify('from rejected', (done) => {
      adapter
        .rejected(someRejectionReason)
        .catch((e) => {
          assert.strictEqual(e, someRejectionReason);
          throw e;
        })
        .finally(function onFinally() {
          assert(arguments.length === 0);
          return adapter.resolved(4);
        })
        .then(
          function onFulfilled() {
            done(new Error('should not be called'));
          },
          function onRejected(e) {
            assert.strictEqual(e, someRejectionReason);
            done();
          },
        );
    });
  });

  describe('returns an immediately-rejected promise', () => {
    specify('from resolved ', (done) => {
      adapter
        .resolved(3)
        .then((x) => {
          assert.strictEqual(x, 3);
          return x;
        })
        .finally(function onFinally() {
          assert(arguments.length === 0);
          return adapter.rejected(4);
        })
        .then(
          function onFulfilled(x) {
            done(new Error('should not be called'));
          },
          function onRejected(e) {
            assert.strictEqual(e, 4);
            done();
          },
        );
    });

    specify('from rejected', (done) => {
      const newReason = {};
      adapter
        .rejected(someRejectionReason)
        .catch((e) => {
          assert.strictEqual(e, someRejectionReason);
          throw e;
        })
        .finally(function onFinally() {
          assert(arguments.length === 0);
          return adapter.rejected(newReason);
        })
        .then(
          function onFulfilled(x) {
            done(new Error('should not be called'));
          },
          function onRejected(e) {
            assert.strictEqual(e, newReason);
            done();
          },
        );
    });
  });

  describe('returns a fulfilled-after-a-second promise', () => {
    specify('from resolved', (done) => {
      var timeout;
      adapter
        .resolved(3)
        .then((x) => {
          assert.strictEqual(x, 3);
          return x;
        })
        .finally(function onFinally() {
          assert(arguments.length === 0);
          timeout = setTimeout(done, 1.5e3);
          return new P((resolve) => {
            setTimeout(() => resolve(4), 1e3);
          });
        })
        .then(
          function onFulfilled(x) {
            clearTimeout(timeout);
            assert.strictEqual(x, 3);
            done();
          },
          function onRejected() {
            clearTimeout(timeout);
            done(new Error('should not be called'));
          },
        );
    });

    specify('from rejected', (done) => {
      var timeout;
      adapter
        .rejected(3)
        .catch((e) => {
          assert.strictEqual(e, 3);
          throw e;
        })
        .finally(function onFinally() {
          assert(arguments.length === 0);
          timeout = setTimeout(done, 1.5e3);
          return new P((resolve) => {
            setTimeout(() => resolve(4), 1e3);
          });
        })
        .then(
          function onFulfilled() {
            clearTimeout(timeout);
            done(new Error('should not be called'));
          },
          function onRejected(e) {
            clearTimeout(timeout);
            assert.strictEqual(e, 3);
            done();
          },
        );
    });
  });

  describe('returns a rejected-after-a-second promise', () => {
    specify('from resolved', (done) => {
      var timeout;
      adapter
        .resolved(3)
        .then((x) => {
          assert.strictEqual(x, 3);
          return x;
        })
        .finally(function onFinally() {
          assert(arguments.length === 0);
          timeout = setTimeout(done, 1.5e3);
          return new P((resolve, reject) => {
            setTimeout(() => reject(4), 1e3);
          });
        })
        .then(
          function onFulfilled() {
            clearTimeout(timeout);
            done(new Error('should not be called'));
          },
          function onRejected(e) {
            clearTimeout(timeout);
            assert.strictEqual(e, 4);
            done();
          },
        );
    });

    specify('from rejected', (done) => {
      var timeout;
      adapter
        .rejected(someRejectionReason)
        .catch((e) => {
          assert.strictEqual(e, someRejectionReason);
          throw e;
        })
        .finally(function onFinally() {
          assert(arguments.length === 0);
          timeout = setTimeout(done, 1.5e3);
          return new P((resolve, reject) => {
            setTimeout(() => reject(anotherReason), 1e3);
          });
        })
        .then(
          function onFulfilled() {
            clearTimeout(timeout);
            done(new Error('should not be called'));
          },
          function onRejected(e) {
            clearTimeout(timeout);
            assert.strictEqual(e, anotherReason);
            done();
          },
        );
    });
  });

  specify('has the correct property descriptor', () => {
    var descriptor = Object.getOwnPropertyDescriptor(Promise.prototype, 'finally');

    assert.strictEqual(descriptor.writable, true);
    assert.strictEqual(descriptor.configurable, true);
  });
});
