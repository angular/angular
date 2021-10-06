/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// Load `$localize` for examples using it.
import '@angular/localize/init';

import {platformBrowser} from '@angular/platform-browser';
import {MainModule} from './main-module';

platformBrowser().bootstrapModule(MainModule);
