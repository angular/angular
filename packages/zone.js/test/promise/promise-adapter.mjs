import '../../build/zone.umd.js';

Zone[Zone.__symbol__('ignoreConsoleErrorUncaughtError')] = true;
const deferred = function () {
  const p = {};
  p.promise = new Promise((resolve, reject) => {
    p.resolve = resolve;
    p.reject = reject;
  });
  return p;
};

const resolved = (val) => {
  return Promise.resolve(val);
};

const rejected = (reason) => {
  return Promise.reject(reason);
};

process.on('unhandledRejection', (error) => {
  console.log('unhandled', error);
});

export default {deferred, resolved, rejected};
