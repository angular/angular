/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {enableProdMode} from '@angular/core';
import {platformBrowser} from '@angular/platform-browser';

import {AppModule} from './app';
import {init} from './init';

enableProdMode();
platformBrowser().bootstrapModule(AppModule).then(init);
