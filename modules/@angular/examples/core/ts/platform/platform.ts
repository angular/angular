/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, ReflectiveInjector, createPlatformFactory} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

// #docregion longform
@Component({selector: 'my-app', template: 'Hello World'})
class MyApp {
}

var myPlatformFactory = createPlatformFactory(platformBrowserDynamic, 'myPlatform');
myPlatformFactory().bootstrapModule(MyApp);
// #enddocregion
