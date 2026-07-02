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
  var zone = _global['__zone_symbol__callbackZone'];
  var testTarget = {
    title: 'xhr',
    times: 3,
    count: 1000,
    before: function () {
      _global['__zone_symbol__callbackContext'].measureName = 'xhr_callback';
      _global['__zone_symbol__callbackContext'].type = 'macroTask';
      _global['__zone_symbol__callbackContext'].source = 'send';
    },
    apis: [
      {
        supportClear: true,
        method: 'XHR.send',
        nativeMethod: 'native.XHR.send',
        clearMethod: 'XHR.abort',
        nativeClearMethod: 'native.XHR.abort',
        run: function () {
          var xhr = new XMLHttpRequest();
          xhr.open('get', 'http://localhost:8080', true);
          xhr.send();
          return xhr;
        },
        runClear: function (xhr) {
          xhr.abort();
        },
        nativeRun: function () {
          var xhr = new XMLHttpRequest();
          xhr['__zone_symbol__open']('get', 'http://localhost:8080', true);
          xhr['__zone_symbol__send']();
          return xhr;
        },
        nativeRunClear: function (xhr) {
          xhr['__zone_symbol__abort']();
        },
      },
    ],
  };
  return testRunner(testTarget);
})(typeof window === 'undefined' ? global : window);
