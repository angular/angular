/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, createPlatformFactory} from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

// #docregion longform
@Component({selector: 'my-app', template: 'Hello World'})
class MyApp {
}

const myPlatformFactory = createPlatformFactory(platformBrowserDynamic, 'myPlatform');
myPlatformFactory().bootstrapModule(MyApp);
// #enddocregion
