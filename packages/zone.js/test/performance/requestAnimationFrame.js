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
  var zone = _global['__zone_symbol__callbackZone'];
  var testRunner = _global['__zone_symbol__testRunner'];
  var raf = _global['requestAnimationFrame'];
  var cancel = _global['cancelAnimationFrame'];
  var nativeRaf = _global['__zone_symbol__requestAnimationFrame'];
  var nativeCancel = _global['__zone_symbol__cancelAnimationFrame'];
  var testTarget = {
    title: 'requestAnimationFrame',
    times: 10,
    before: function () {
      _global['__zone_symbol__callbackContext'].measureName = 'requestAnimationFrame_callback';
      _global['__zone_symbol__callbackContext'].type = 'macroTask';
      _global['__zone_symbol__callbackContext'].source = 'requestAnimationFrame';
    },
    apis: [
      {
        supportClear: true,
        method: 'requestAnimationFrame',
        nativeMethod: '__zone_symbol__requestAnimationFrame',
        clearMethod: 'cancelAnimationFrame',
        nativeClearMethod: '__zone_symbol__cancelAnimationFrame',
        run: function () {
          return raf(function () {});
        },
        runClear: function (timerId) {
          return cancel(timerId);
        },
        nativeRun: function () {
          return nativeRaf(function () {});
        },
        nativeRunClear: function (timerId) {
          return nativeCancel(timerId);
        },
      },
      {
        isCallback: true,
        supportClear: false,
        method: 'requestAnimationFrame_callback',
        nativeMethod: 'native_requestAnimationFrame_callback',
        run: function () {
          zone.run(function () {
            raf(function () {});
          });
        },
        nativeRun: function () {
          var func = function () {};
          nativeRaf(function () {
            mark('native_requestAnimationFrame_callback');
            func.apply(this, arguments);
            measure(
              'native_requestAnimationFrame_callback',
              'native_requestAnimationFrame_callback',
            );
          });
        },
      },
    ],
  };
  return testRunner(testTarget);
})(typeof window === 'undefined' ? global : window);
