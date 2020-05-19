/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// @ts-ignore Cannot find module
import {enableProdMode} from '@angular/core';

// @ts-ignore Cannot find module
import {platformBrowser} from '@angular/platform-browser';

// @ts-ignore Cannot find module
import {AppModuleNgFactory} from './app.module.ngfactory';

enableProdMode();
platformBrowser().bootstrapModuleFactory(AppModuleNgFactory);
