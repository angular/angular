/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, ReflectiveInjector, coreLoadAndBootstrap, createPlatform} from '@angular/core';
import {BROWSER_APP_PROVIDERS, BROWSER_PLATFORM_PROVIDERS} from '@angular/platform-browser';

var appProviders: any[] = [];

// #docregion longform
@Component({selector: 'my-app', template: 'Hello World'})
class MyApp {
}

var platform = createPlatform(ReflectiveInjector.resolveAndCreate(BROWSER_PLATFORM_PROVIDERS));
var appInjector =
    ReflectiveInjector.resolveAndCreate([BROWSER_APP_PROVIDERS, appProviders], platform.injector);
coreLoadAndBootstrap(MyApp, appInjector);
// #enddocregion
