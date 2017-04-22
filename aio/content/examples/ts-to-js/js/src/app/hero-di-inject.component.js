(function(app) {

  var old = app.HeroComponent;

  // #docregion
  app.HeroComponent = HeroComponent;

  HeroComponent.annotations = [
    new ng.core.Component({
      selector: 'hero-di-inject',
      template: '<h1>Hero: {{name}}</h1>'
    })
  ];

  HeroComponent.parameters = [ 'heroName' ];

  function HeroComponent(name) {
    this.name = name;
  }
  // #enddocregion

  app.HeroDIInjectComponent = app.HeroComponent;
  app.HeroComponent = old;

})(window.app = window.app || {});

/////// DSL version ////////

(function(app) {

  var old = app.HeroComponent;

  // #docregion dsl
  app.HeroComponent = ng.core.Component({
    selector: 'hero-di-inject-dsl',
    template: '<h1>Hero: {{name}}</h1>'
  })
  .Class({
    constructor: [
      new ng.core.Inject('heroName'),
      function HeroComponent(name) {
        this.name = name;
      }
    ]
  });
  // #enddocregion dsl

  app.HeroDIInjectDslComponent = app.HeroComponent;
  app.HeroComponent = old;

})(window.app = window.app || {});
