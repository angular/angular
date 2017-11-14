/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * This is the main entry-point for the AOT compilation. File will be used to test AOT support.
 */

import {platformBrowser} from '@angular/platform-browser';
import {DemoAppModuleNgFactory} from './demo-app-module.ngfactory';

platformBrowser().bootstrapModuleFactory(DemoAppModuleNgFactory);
