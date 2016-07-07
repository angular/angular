/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AppModule, ApplicationRef} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AnimateCmp} from './animate';
import {BasicComp} from './basic';
import {CompWithAnalyzePrecompileProvider, CompWithPrecompile} from './precompile';
import {ProjectingComp} from './projection';
import {CompWithChildQuery} from './queries';

@AppModule({
  modules: [BrowserModule],
  precompile: [
    AnimateCmp, BasicComp, CompWithPrecompile, CompWithAnalyzePrecompileProvider, ProjectingComp,
    CompWithChildQuery
  ]
})
export class MainModule {
  constructor(public appRef: ApplicationRef) {}
}
