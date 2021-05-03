/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function(_global) {
var testRunner = _global['__zone_symbol__testRunner'];
var mark = _global['__zone_symbol__mark'];
var measure = _global['__zone_symbol__measure'];
var zone = _global['__zone_symbol__callbackZone'];
var button;
var testTarget = {
  title: 'addEventListener',
  times: 10,
  before: function() {
    button = document.createElement('button');
    document.body.appendChild(button);
    _global['__zone_symbol__callbackContext'].measureName = 'addEventListener_callback';
    _global['__zone_symbol__callbackContext'].type = 'eventTask';
    _global['__zone_symbol__callbackContext'].source = 'addEventListener';
  },
  after: function() {
    document.body.removeChild(button);
    button = null;
  },
  apis: [
    {
      supportClear: true,
      method: 'addEventListener',
      nativeMethod: '__zone_symbol__addEventListener',
      clearMethod: 'removeEventListener',
      nativeClearMethod: '__zone_symbol__removeEventListener',
      run: function() {
        var listener = function() {};
        button.addEventListener('click', listener);
        return listener;
      },
      runClear: function(timerId) {
        return button.removeEventListener('click', timerId);
      },
      nativeRun: function() {
        var listener = function() {};
        button['__zone_symbol__addEventListener']('click', listener);
        return listener;
      },
      nativeRunClear: function(timerId) {
        return button['__zone_symbol__removeEventListener']('click', timerId);
      }
    },
    {
      isCallback: true,
      supportClear: false,
      method: 'addEventListener_callback',
      nativeMethod: 'native_addEventListener_callback',
      run: function() {
        var listener = function() {};
        zone.run(function() {
          button.addEventListener('click', listener);
        });
        var event = document.createEvent('Event');
        event.initEvent('click', true, true);
        button.dispatchEvent(event);
        button.removeEventListener('click', listener);
      },
      nativeRun: function() {
        var func = function() {};
        var listener = function() {
          mark('native_addEventListener_callback');
          func.apply(this, arguments);
          measure('native_addEventListener_callback', 'native_addEventListener_callback');
        };
        button['__zone_symbol__addEventListener']('click', listener);
        var event = document.createEvent('Event');
        event.initEvent('click', true, true);
        button.dispatchEvent(event);
        button['__zone_symbol__removeEventListener']('click', listener);
      }
    }
  ],
};
return testRunner(testTarget);
}(typeof window === 'undefined' ? global : window));
