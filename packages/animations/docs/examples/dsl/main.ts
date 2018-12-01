/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {platformBrowser} from '@angular/platform-browser';
import {AppModuleNgFactory} from './dsl_example.ngfactory';


// bootstrap
platformBrowser().bootstrapModuleFactory(AppModuleNgFactory);
