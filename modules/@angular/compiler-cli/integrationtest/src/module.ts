/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ApplicationRef, NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';

import {AnimateCmp} from './animate';
import {BasicComp} from './basic';
import {CompWithProviders, CompWithReferences} from './features';
import {CompUsingRootModuleDirectiveAndPipe, SomeDirectiveInRootModule, SomeLibModule, SomePipeInRootModule, SomeService} from './module_fixtures';
import {CompWithAnalyzePrecompileProvider, CompWithPrecompile} from './precompile';
import {ProjectingComp} from './projection';
import {CompWithChildQuery, CompWithDirectiveChild} from './queries';

@NgModule({
  declarations: [
    SomeDirectiveInRootModule, SomePipeInRootModule, AnimateCmp, BasicComp, CompWithPrecompile,
    CompWithAnalyzePrecompileProvider, ProjectingComp, CompWithChildQuery, CompWithDirectiveChild,
    CompUsingRootModuleDirectiveAndPipe, CompWithProviders, CompWithReferences
  ],
  imports: [BrowserModule, FormsModule, SomeLibModule],
  providers: [SomeService],
  precompile: [
    AnimateCmp, BasicComp, CompWithPrecompile, CompWithAnalyzePrecompileProvider, ProjectingComp,
    CompWithChildQuery, CompUsingRootModuleDirectiveAndPipe
  ]
})
export class MainModule {
  constructor(public appRef: ApplicationRef) {}
}
