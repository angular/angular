/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import 'zone.js/lib/browser/rollup-main';

import {platformBrowser} from '@angular/platform-browser';

import {AppModule} from './module';

platformBrowser().bootstrapModule(AppModule);
