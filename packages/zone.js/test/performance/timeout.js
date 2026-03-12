/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
(function (_global) {
  var mark = _global['__zone_symbol__mark'];
  var measure = _global['__zone_symbol__measure'];
  var testRunner = _global['__zone_symbol__testRunner'];
  var setTimeout = _global['setTimeout'];
  var clearTimeout = _global['clearTimeout'];
  var nativeSetTimeout = _global['__zone_symbol__setTimeout'];
  var nativeClearTimeout = _global['__zone_symbol__clearTimeout'];
  var zone = _global['__zone_symbol__callbackZone'];
  var testTarget = {
    title: 'timer',
    times: 10,
    before: function () {
      _global['__zone_symbol__callbackContext'].measureName = 'setTimeout_callback';
      _global['__zone_symbol__callbackContext'].type = 'macroTask';
      _global['__zone_symbol__callbackContext'].source = 'setTimeout';
    },
    apis: [
      {
        supportClear: true,
        method: 'setTimeout',
        nativeMethod: '__zone_symbol__setTimeout',
        clearMethod: 'clearTimeout',
        nativeClearMethod: '__zone_symbol__clearTimeout',
        run: function () {
          return setTimeout(function () {});
        },
        runClear: function (timerId) {
          return clearTimeout(timerId);
        },
        nativeRun: function () {
          return nativeSetTimeout(function () {});
        },
        nativeRunClear: function (timerId) {
          return nativeClearTimeout(timerId);
        },
      },
      {
        isCallback: true,
        supportClear: false,
        method: 'setTimeout_callback',
        nativeMethod: 'native_setTimeout_callback',
        run: function () {
          zone.run(function () {
            setTimeout(function () {});
          });
        },
        nativeRun: function () {
          var func = function () {};
          nativeSetTimeout(function () {
            mark('native_setTimeout_callback');
            func.apply(this, arguments);
            measure('native_setTimeout_callback', 'native_setTimeout_callback');
          });
        },
      },
    ],
  };
  return testRunner(testTarget);
})(typeof window === 'undefined' ? global : window);
