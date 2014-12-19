var Q = require('q');

module.exports = function retry(fn, timeout, checkInterval) {
  var defer = Q.defer();
  var start = Date.now();
  check();
  return defer.promise;

  function check() {
    fn().then(function(result) {
      defer.resolve(result);
    }, function(error) {
      if (Date.now() - start > timeout) {
        return defer.reject('Timeout after '+timeout);
      }
      setTimeout(check, checkInterval);
    });
  }
}