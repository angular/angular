/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import 'zone.js/lib/browser/rollup-main';

import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

import {TestsAppModule} from './test_module';

platformBrowserDynamic().bootstrapModule(TestsAppModule);
