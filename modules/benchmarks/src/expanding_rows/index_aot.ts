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
import {ExpandingRowBenchmarkModuleNgFactory} from './benchmark.ngfactory';

setMode(ExpandingRowBenchmarkModule.hasOwnProperty('ɵmod') ? 'Ivy' : 'ViewEngine');
enableProdMode();
platformBrowser().bootstrapModuleFactory(ExpandingRowBenchmarkModuleNgFactory);

function setMode(name: string): void {
  document.querySelector('#rendererMode')!.textContent = `Render Mode: ${name}`;
}
