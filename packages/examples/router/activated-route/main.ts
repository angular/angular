/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {AppModuleNgFactory} from './module.ngfactory';

platformBrowserDynamic().bootstrapModuleFactory(AppModuleNgFactory);
