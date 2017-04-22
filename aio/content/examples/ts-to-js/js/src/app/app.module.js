(function(app) {

app.AppModule = AppModule;
function AppModule() { }

AppModule.annotations = [
  new ng.core.NgModule({
    imports: [ ng.platformBrowser.BrowserModule ],
    declarations: [
      app.AppComponent,
      app.ConfirmComponent, app.ConfirmDslComponent,
      app.HeroComponent, app.HeroDslComponent,
      app.HeroDIComponent, app.HeroDIDslComponent,
      app.HeroDIInjectComponent, app.HeroDIInjectDslComponent,
      app.HeroDIInjectAdditionalComponent, app.HeroDIInjectAdditionalDslComponent,
      app.HeroHostComponent, app.HeroHostDslComponent,
      app.HeroIOComponent, app.HeroIODslComponent,
      app.HeroLifecycleComponent, app.HeroLifecycleDslComponent,
      app.heroQueries.HeroQueriesComponent, app.heroQueries.ViewChildComponent, app.heroQueries.ContentChildComponent,
      app.HeroTitleComponent, app.HeroTitleDslComponent
    ],
    providers: [
      app.DataService,
      { provide: 'heroName', useValue: 'Windstorm' }
    ],
    bootstrap: [ app.AppComponent ],

    // schemas: [ ng.core.NO_ERRORS_SCHEMA ] // helpful for debugging!
  })
]

})(window.app = window.app || {});


///// For documentation only /////
(function () {
  // #docregion appimport
  var HeroComponent = app.HeroComponent;
  // #enddocregion appimport

  // #docregion ng2import
  var platformBrowserDynamic = ng.platformBrowserDynamic.platformBrowserDynamic;
  var LocationStrategy = ng.common.LocationStrategy;
  var HashLocationStrategy = ng.common.HashLocationStrategy;
  // #enddocregion ng2import
})
