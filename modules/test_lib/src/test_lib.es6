export var describe = window.describe;
export var xdescribe = window.xdescribe;
export var ddescribe = window.ddescribe;
export var it = window.it;
export var xit = window.xit;
export var iit = window.iit;
export var beforeEach = window.beforeEach;
export var afterEach = window.afterEach;
export var expect = window.expect;

// To make testing consistent between dart and js
window.print = function(msg) {
  if (window.dump) {
    window.dump(msg);
  } else {
    window.console.log(msg);
  }
};

window.beforeEach(function() {
  jasmine.addMatchers({
    toBePromise: function() {
      return {
        compare: function (actual, expectedClass) {
          var pass = typeof actual === 'object' && typeof actual.then === 'function';
          return {
            pass: pass,
            get message() {
              return 'Expected ' + actual + ' to be a promise';
            }
          };
        }
      };
    },

    toBeAnInstanceOf: function() {
      return {
        compare: function(actual, expectedClass) {
          var pass = typeof actual === 'object' && actual instanceof expectedClass;
          return {
            pass: pass,
            get message() {
              return 'Expected ' + actual + ' to be an instance of ' + expectedClass;
            }
          };
        }
      };
    }
  });
});
