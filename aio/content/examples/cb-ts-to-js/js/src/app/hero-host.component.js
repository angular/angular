(function(app) {

  var old = app.HeroComponent

  // #docregion
  app.HeroComponent = HeroComponent;

  HeroComponent.annotations = [
    new ng.core.Component({
      selector: 'hero-host',
      template:
        '<h1 [class.active]="active">Hero Host</h1>' +
        '<div>Heading clicks: {{clicks}}</div>',
      host: {
        // HostBindings to the <hero-host> element
        '[title]': 'title',
        '[class.heading]': 'headingClass',
        '(click)': 'clicked()',

        // HostListeners on the entire <hero-host> element
        '(mouseenter)': 'enter($event)',
        '(mouseleave)': 'leave($event)'
      },
      // Styles within (but excluding) the <hero-host> element
      styles: ['.active {background-color: yellow;}']
    })
  ];

  function HeroComponent() {
    this.clicks = 0;
    this.headingClass = true;
    this.title = 'Hero Host Tooltip content';
  }

  HeroComponent.prototype.clicked = function() {
    this.clicks += 1;
  }

  HeroComponent.prototype.enter = function(event) {
    this.active = true;
    this.headingClass = false;
  }

  HeroComponent.prototype.leave = function(event) {
    this.active = false;
    this.headingClass = true;
  }
  // #enddocregion

  app.HeroHostComponent = app.HeroComponent;
  app.HeroComponent = old;

})(window.app = window.app || {});

//// DSL Version ////

(function(app) {

  var old = app.HeroComponent;

  // #docregion dsl
  app.HeroComponent = ng.core.Component({
    selector: 'hero-host-dsl',
    template: `
      <h1 [class.active]="active">Hero Host (DSL)</h1>
      <div>Heading clicks: {{clicks}}</div>
    `,
    host: {
      // HostBindings to the <hero-host-dsl> element
      '[title]': 'title',
      '[class.heading]': 'headingClass',
      '(click)': 'clicked()',

      // HostListeners on the entire <hero-host-dsl> element
      '(mouseenter)': 'enter($event)',
      '(mouseleave)': 'leave($event)'
    },
    // Styles within (but excluding) the <hero-host-dsl> element
    styles: ['.active {background-color: coral;}']
  })
  .Class({
    constructor: function HeroComponent() {
      this.clicks = 0;
      this.headingClass = true;
      this.title = 'Hero Host Tooltip DSL content';
    },

    clicked() {
      this.clicks += 1;
    },

    enter(event) {
      this.active = true;
      this.headingClass = false;
    },

    leave(event) {
      this.active = false;
      this.headingClass = true;
    }
  });
  // #enddocregion dsl

  app.HeroHostDslComponent = app.HeroComponent;
  app.HeroComponent = old;

})(window.app = window.app || {});
