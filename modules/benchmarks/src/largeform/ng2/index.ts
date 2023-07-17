/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// BEGIN-EXTERNAL
import 'zone.js/lib/browser/rollup-main';

// END-EXTERNAL

import {enableProdMode} from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

import {AppModule} from './app';
import {init} from './init';

enableProdMode();
platformBrowserDynamic().bootstrapModule(AppModule).then(init);
