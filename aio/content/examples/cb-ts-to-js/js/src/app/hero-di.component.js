(function(app) {

  var old = app.HeroComponent;

  // #docregion
  app.HeroComponent = HeroComponent;

  HeroComponent.annotations = [
    new ng.core.Component({
      selector: 'hero-di',
      template: '<h1>Hero: {{name}}</h1>'
    })
  ];

  HeroComponent.parameters = [ app.DataService ];

  function HeroComponent(dataService) {
    this.name = dataService.getHeroName();
  }
  // #enddocregion

  app.HeroDIComponent = app.HeroComponent;
  app.HeroComponent = old;

})(window.app = window.app || {});

////// DSL Version /////

(function(app) {

  var old = app.HeroComponent;

  // #docregion dsl
  app.HeroComponent = ng.core.Component({
    selector: 'hero-di-dsl',
    template: '<h1>Hero: {{name}}</h1>'
  })
  .Class({
    constructor: [
      app.DataService,
      function HeroComponent(service) {
        this.name = service.getHeroName();
      }
    ]
  });
  // #enddocregion dsl

  app.HeroDIDslComponent = app.HeroComponent;
  app.HeroComponent = old;

})(window.app = window.app || {});
