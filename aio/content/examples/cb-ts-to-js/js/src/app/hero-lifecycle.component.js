// #docplaster
(function(app) {

  var old = app.HeroComponent;

  // #docregion
  app.HeroComponent = HeroComponent;

  HeroComponent.annotations = [
    new ng.core.Component({
      selector: 'hero-lifecycle',
      template: '<h1>Hero: {{name}}</h1>'
    })
  ];

  function HeroComponent() { }

  HeroComponent.prototype.ngOnInit = function() {
    // todo: fetch from server async
    setTimeout(() => this.name = 'Windstorm', 0);
  };
  // #enddocregion

  app.HeroLifecycleComponent = app.HeroComponent;
  app.HeroComponent = old;

})(window.app = window.app || {});

/////// DSL version ////

(function(app) {

  var old = app.HeroComponent;

  // #docregion dsl
  app.HeroComponent = ng.core.Component({
    selector: 'hero-lifecycle-dsl',
    template: '<h1>Hero: {{name}}</h1>'
  })
  .Class({
    constructor: function HeroComponent() { },
    ngOnInit: function() {
      // todo: fetch from server async
      setTimeout(() => this.name = 'Windstorm', 0);
    }
  });
  // #enddocregion dsl

  app.HeroLifecycleDslComponent = app.HeroComponent;
  app.HeroComponent = old;

})(window.app = window.app || {});
