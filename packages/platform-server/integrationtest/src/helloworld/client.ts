/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import 'zone.js/dist/zone.js';

import {enableProdMode} from '@angular/core';
import {platformBrowser} from '@angular/platform-browser';
import {HelloWorldModuleNgFactory} from './app.ngfactory';

window['doBootstrap'] = function() {
  platformBrowser().bootstrapModuleFactory(HelloWorldModuleNgFactory);
};
