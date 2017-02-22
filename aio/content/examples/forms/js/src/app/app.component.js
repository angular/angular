// #docregion
(function(app) {
  app.AppComponent = ng.core
    .Component({
      selector: 'my-app',
      template: '<hero-form></hero-form>'
    })
    .Class({
      constructor: function() {}
    });
})(window.app || (window.app = {}));
