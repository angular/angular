(function(app) {

  // #docregion
  app.HeroTitleComponent = HeroTitleComponent;

  // #docregion templateUrl
  HeroTitleComponent.annotations = [
    new ng.core.Component({
      selector: 'hero-title',
      templateUrl: 'app/hero-title.component.html'
    })
  ];
  // #enddocregion templateUrl

  function HeroTitleComponent(titlePrefix, title) {
      this.titlePrefix = titlePrefix;
      this.title  = title;
      this.msg = '';
  }

  HeroTitleComponent.prototype.ok = function() {
    this.msg = 'OK!';
  }

  HeroTitleComponent.parameters = [
    [new ng.core.Optional(), new ng.core.Inject('titlePrefix')],
    [new ng.core.Attribute('title')]
  ];
  // #enddocregion

})(window.app = window.app || {});

////////// DSL version ////////////

(function(app) {

  var old = app.HeroTitleComponent;

  // #docregion dsl
  app.HeroTitleComponent = ng.core.Component({
    selector: 'hero-title-dsl',
    templateUrl: 'app/hero-title.component.html'
  })
  .Class({
    constructor: [
      [ new ng.core.Optional(), new ng.core.Inject('titlePrefix') ],
      new ng.core.Attribute('title'),
      function HeroTitleComponent(titlePrefix, title) {
        this.titlePrefix = titlePrefix;
        this.title  = title;
        this.msg = '';
      }
    ],

    ok: function() {
      this.msg = 'OK!';
    }
  });
  // #enddocregion dsl

  app.HeroTitleDslComponent = app.HeroTitleComponent;
  app.HeroTitleComponent = old;

})(window.app = window.app || {});
