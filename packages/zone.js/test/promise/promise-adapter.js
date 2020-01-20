require('../../build/lib/node/rollup-main');
Zone[Zone.__symbol__('ignoreConsoleErrorUncaughtError')] = true;
module.exports.deferred = function() {
  const p = {};
  p.promise = new Promise((resolve, reject) => {
    p.resolve = resolve;
    p.reject = reject;
  });
  return p;
};

module.exports.resolved = (val) => {
  return Promise.resolve(val);
};

module.exports.rejected = (reason) => {
  return Promise.reject(reason);
};
