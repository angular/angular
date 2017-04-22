(function(app) {

  var old = app.HeroComponent

  app.HeroComponent = HeroComponent;

  HeroComponent.annotations = [
    new ng.core.Component({
      selector: 'hero-io',
      templateUrl: 'app/hero-io.component.html'
    })
  ];

  function HeroComponent() { }

  HeroComponent.prototype.onOk = function() {
    this.okClicked = true;
  }

  HeroComponent.prototype.onCancel = function() {
    this.cancelClicked = true;
  }

  app.HeroIOComponent = app.HeroComponent;
  app.HeroComponent = old;

})(window.app = window.app || {});

///// DSL Version ////

(function(app) {

  var old = app.HeroComponent

  app.HeroComponent = ng.core.Component({
    selector: 'hero-io-dsl',
    templateUrl: 'app/hero-io-dsl.component.html'
  })
  .Class({
    constructor: function HeroComponent() { },
    onOk: function() {
      this.okClicked = true;
    },
    onCancel: function() {
      this.cancelClicked = true;
    }
  });

  app.HeroIODslComponent = app.HeroComponent;
  app.HeroComponent = old;

})(window.app = window.app || {});
