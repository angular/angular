// #docplaster
// #docregion
// #docregion iife
(function(app) {
  // #enddocregion iife
  // #docregion ng-namespace-funcs, export
  app.AppComponent =
    // #enddocregion export
    // #docregion component
    ng.core.Component({
      // #enddocregion ng-namespace-funcs
      selector: 'my-app',
      template: '<h1>Hello Angular</h1>'
    // #docregion ng-namespace-funcs
    })
    // #enddocregion component
    // #docregion class
    .Class({
      // #enddocregion ng-namespace-funcs
      constructor: function() {}
      // #docregion ng-namespace-funcs
    });
    // #enddocregion class
    // #enddocregion ng-namespace-funcs
// #docregion iife
})(window.app || (window.app = {}));
// #enddocregion iife
