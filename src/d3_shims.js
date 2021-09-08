// d3
(function (factory) {
  if (typeof module === 'object' && typeof module.exports === 'object') {
    var v = factory(require, exports);
    if (v !== undefined) module.exports = v;
  } else if (typeof define === 'function' && define.amd) {
    define('d3/dist/d3.js', ['exports', 'd3'], factory);
  }
})(function (exports, d3) {
  'use strict';

  Object.keys(d3).forEach(function (key) {
    exports[key] = d3[key];
  });

  Object.defineProperty(exports, '__esModule', { value: true });
});
