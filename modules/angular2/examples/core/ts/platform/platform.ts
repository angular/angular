import {Component, basicLoadAndBootstrap, ReflectiveInjector} from 'angular2/core';
import {BROWSER_PROVIDERS, BROWSER_APP_PROVIDERS} from 'angular2/platform/browser';

var appProviders: any[] = [];

// #docregion longform
@Component({selector: 'my-app', template: 'Hello World'})
class MyApp {
}

var platformInjector = ReflectiveInjector.resolveAndCreate(BROWSER_PROVIDERS);
var appInjector = platformInjector.resolveAndCreateChild([BROWSER_APP_PROVIDERS, appProviders]);
basicLoadAndBootstrap(appInjector, MyApp);
// #enddocregion
