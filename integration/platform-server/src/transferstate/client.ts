/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import 'zone.js/bundles/zone.umd';

import {platformBrowser} from '@angular/platform-browser';
import {TransferStateModule} from './app';

window['doBootstrap'] = function() {
  platformBrowser().bootstrapModule(TransferStateModule);
};
