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
  var nativePromise = _global['__zone_symbol__Promise'];
  var resolved = Promise.resolve(1);
  var nativeResolved = nativePromise.resolve(1);
  var testTarget = {
    title: 'Promise',
    times: 10,
    before: function () {
      _global['__zone_symbol__callbackContext'].measureName = 'Promise_callback';
      _global['__zone_symbol__callbackContext'].type = 'microTask';
      _global['__zone_symbol__callbackContext'].source = 'Promise.then';
    },
    apis: [
      {
        supportClear: false,
        isAsync: true,
        method: 'Promise',
        nativeMethod: 'native_Promise',
        run: function () {
          return resolved.then(function () {});
        },
        nativeRun: function () {
          return nativeResolved['__zone_symbol__then'](function () {});
        },
      },
      {
        isCallback: true,
        isAsync: true,
        supportClear: false,
        method: 'Promise_callback',
        nativeMethod: 'native_Promise_callback',
        run: function () {
          return zone.run(function () {
            return Promise.resolve(1).then(function (v) {
              return v;
            });
          });
        },
        nativeRun: function () {
          var func = function () {};
          return _global['__zone_symbol__Promise'].resolve(1)['__zone_symbol__then'](function () {
            mark('native_Promise_callback');
            var result = func.apply(this, arguments);
            measure('native_Promise_callback', 'native_Promise_callback');
            return result;
          });
        },
      },
    ],
  };
  return testRunner(testTarget);
})(typeof window === 'undefined' ? global : window);
