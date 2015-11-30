import {Component, platform} from 'angular2/core';
import {BROWSER_PROVIDERS, BROWSER_APP_PROVIDERS} from 'angular2/platform/browser';

var appProviders: any[] = [];

// #docregion longform
@Component({selector: 'my-app', template: 'Hello World'})
class MyApp {
}

var app = platform(BROWSER_PROVIDERS).application([BROWSER_APP_PROVIDERS, appProviders]);
app.bootstrap(MyApp);
// #enddocregion
