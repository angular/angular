(function(app) {

// #docregion
// #docregion class-w-annotations
app.AppComponent =
    // #docregion component
    ng.core.Component({
      selector: 'my-app',
    // #enddocregion
    // #docregion view
      template: '<h1 id="output">My First Angular App</h1>'
    })
    // #enddocregion
    // #docregion class
    .Class({
      constructor: function () { }
    });
    // #enddocregion
// #enddocregion

// #docregion bootstrap
app.AppModule =
  ng.core.NgModule({
    imports: [ ng.platformBrowser.BrowserModule ],
    declarations: [ app.AppComponent ],
    bootstrap: [ app.AppComponent ]
  })
  .Class({
    constructor: function() {}
  });

document.addEventListener('DOMContentLoaded', function() {
  ng.platformBrowserDynamic
    .platformBrowserDynamic()
    .bootstrapModule(app.AppModule);
});
// #enddocregion
// #enddocregion

})(window.app || (window.app = {}));

/* Non DSL Approach */
(function(app) {

// #docregion no-dsl
app.AppComponent = function  AppComponent () {}

app.AppComponent.annotations = [
  new ng.core.Component({
    selector: 'my-app',
    template: '<h1 id="output">My First Angular App</h1>'
  })
];
// #enddocregion
})(window.app || (window.app = {}));
