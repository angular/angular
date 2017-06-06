import {Component, createPlatform, coreLoadAndBootstrap, ReflectiveInjector} from 'angular2/core';
import {BROWSER_PROVIDERS, BROWSER_APP_PROVIDERS} from 'angular2/platform/browser';

var appProviders: any[] = [];

// #docregion longform
@Component({selector: 'my-app', template: 'Hello World'})
class MyApp {
}

var platform = createPlatform(ReflectiveInjector.resolveAndCreate(BROWSER_PROVIDERS));
var appInjector =
    ReflectiveInjector.resolveAndCreate([BROWSER_APP_PROVIDERS, appProviders], platform.injector);
coreLoadAndBootstrap(appInjector, MyApp);
// #enddocregion
