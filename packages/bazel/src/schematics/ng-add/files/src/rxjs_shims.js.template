/**
 * @fileoverview Provides named UMD shims for `rxjs/operators` and `rxjs/testing`.
 * This file should be included in the "scripts" of a "ts_devserver"
 * rule and the "deps" of a "karma_web_test_suite" rule.
 */
// rxjs/operators
(function(factory) {
  if (typeof module === 'object' && typeof module.exports === 'object') {
    var v = factory(require, exports);
    if (v !== undefined) module.exports = v;
  } else if (typeof define === 'function' && define.amd) {
    define('rxjs/operators', ['exports', 'rxjs'], factory);
  }
})(function(exports, rxjs) {
  'use strict';
  Object.keys(rxjs.operators).forEach(function(key) { exports[key] = rxjs.operators[key]; });
  Object.defineProperty(exports, '__esModule', {value: true});
});

// rxjs/testing
(function(factory) {
  if (typeof module === 'object' && typeof module.exports === 'object') {
    var v = factory(require, exports);
    if (v !== undefined) module.exports = v;
  } else if (typeof define === 'function' && define.amd) {
    define('rxjs/testing', ['exports', 'rxjs'], factory);
  }
})(function(exports, rxjs) {
  'use strict';
  Object.keys(rxjs.testing).forEach(function(key) { exports[key] = rxjs.testing[key]; });
  Object.defineProperty(exports, '__esModule', {value: true});
});
