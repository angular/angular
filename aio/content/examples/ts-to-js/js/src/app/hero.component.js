// #docplaster
(function(app) {

// #docregion
// #docregion appexport
// #docregion metadata
app.HeroComponent = HeroComponent; // "export"

HeroComponent.annotations = [
  new ng.core.Component({
    selector: 'hero-view',
    template: '<h1>{{title}}: {{getName()}}</h1>'
  })
];

// #docregion constructorproto
function HeroComponent() {
  this.title = "Hero Detail";
}

HeroComponent.prototype.getName = function() { return 'Windstorm'; };
// #enddocregion constructorproto

// #enddocregion metadata
// #enddocregion appexport
// #enddocregion

})(window.app = window.app || {});

//////////// DSL version ///////////

(function(app) {

  var old = app.HeroComponent;

  // #docregion dsl
  app.HeroComponent = ng.core.Component({
    selector: 'hero-view-dsl',
    template: '<h1>{{title}}: {{getName()}}</h1>',
  })
  .Class({
    constructor: function HeroComponent() {
      this.title = "Hero Detail";
    },

    getName: function() { return 'Windstorm'; }
  });
  // #enddocregion dsl

  app.HeroDslComponent = app.HeroComponent;
  app.HeroComponent = old;

})(window.app = window.app || {});
