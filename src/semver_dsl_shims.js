// semver-dsl
(function (factory) {
  if (typeof module === 'object' && typeof module.exports === 'object') {
    var v = factory(require, exports);
    if (v !== undefined) module.exports = v;
  } else if (typeof define === 'function' && define.amd) {
    define('semver-dsl/index.js', ['exports', 'semver-dsl'], factory);
  }
})(function (exports, semverDsl) {
  'use strict';

  Object.keys(semverDsl).forEach(function (key) {
    exports[key] = semverDsl[key];
  });

  Object.defineProperty(exports, '__esModule', { value: true });
});
