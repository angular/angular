import {Component, createPlatform, coreLoadAndBootstrap, ReflectiveInjector} from '@angular/core';
import {BROWSER_PLATFORM_PROVIDERS, BROWSER_APP_PROVIDERS} from '@angular/platform-browser';

var appProviders: any[] = [];

// #docregion longform
@Component({selector: 'my-app', template: 'Hello World'})
class MyApp {
}

var platform = createPlatform(ReflectiveInjector.resolveAndCreate(BROWSER_PLATFORM_PROVIDERS));
var appInjector = ReflectiveInjector.resolveAndCreate([BROWSER_APP_PROVIDERS, appProviders], platform.injector);
coreLoadAndBootstrap(MyApp, appInjector);
// #enddocregion
