/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {enableProdMode} from '@angular/core';
import {platformBrowser} from '@angular/platform-browser';

import {init} from './init';
import {JsWebFrameworksModuleNgFactory} from './rows.ngfactory';

enableProdMode();
platformBrowser().bootstrapModuleFactory(JsWebFrameworksModuleNgFactory).then(init);
