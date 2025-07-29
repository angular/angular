/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import 'zone.js';

import {platformBrowser} from '@angular/platform-browser';

import {TestsAppModule} from './test_module';

platformBrowser().bootstrapModule(TestsAppModule);
