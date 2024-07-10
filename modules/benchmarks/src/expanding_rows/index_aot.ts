/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
// This benchmark uses i18n in its `ExpandingRowSummary` component so `$localize` must be loaded.
import '@angular/localize/init';

import {enableProdMode} from '@angular/core';
import {platformBrowser} from '@angular/platform-browser';

import {ExpandingRowBenchmarkModule} from './benchmark';

enableProdMode();
platformBrowser().bootstrapModule(ExpandingRowBenchmarkModule);
