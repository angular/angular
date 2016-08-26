import {BrowserModule} from '@angular/platform-browser';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {Component, NgModule} from 'angular2/core';

@Component({selector: 'app', template: '<h1>Page Load Time</h1>'})
class App {
}

@NgModule({
  imports: [BrowserModule],
  bootstrap: [App],
})
class AppModule {
}

platformBrowserDynamic().bootstrapModule(App).then(() => {
  (<any>window).loadTime = Date.now() - performance.timing.navigationStart;
  (<any>window).someConstant = 1234567890;
});
