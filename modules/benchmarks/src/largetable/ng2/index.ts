/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {enableProdMode} from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

import {init} from './init.js';
import {AppModule} from './table.js';

enableProdMode();
platformBrowserDynamic().bootstrapModule(AppModule).then(init);
