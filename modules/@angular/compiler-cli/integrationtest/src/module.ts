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
import {MdButtonModule} from '@angular2-material/button';

import {MultipleComponentsMyComp, NextComp} from './a/multiple_components';
import {AnimateCmp} from './animate';
import {BasicComp} from './basic';
import {CompWithAnalyzeEntryComponentsProvider, CompWithEntryComponents} from './entry_components';
import {CompConsumingEvents, CompUsingPipes, CompWithProviders, CompWithReferences, DirPublishingEvents, ModuleUsingCustomElements} from './features';
import {CompUsingRootModuleDirectiveAndPipe, SomeDirectiveInRootModule, SomePipeInRootModule, SomeService, someLibModuleWithProviders} from './module_fixtures';
import {CompWithNgContent, ProjectingComp} from './projection';
import {CompForChildQuery, CompWithChildQuery, CompWithDirectiveChild, DirectiveForQuery} from './queries';

@NgModule({
  declarations: [
    SomeDirectiveInRootModule,
    SomePipeInRootModule,
    AnimateCmp,
    BasicComp,
    CompForChildQuery,
    CompWithEntryComponents,
    CompWithAnalyzeEntryComponentsProvider,
    ProjectingComp,
    CompWithChildQuery,
    CompWithDirectiveChild,
    CompWithNgContent,
    CompUsingRootModuleDirectiveAndPipe,
    CompWithProviders,
    CompWithReferences,
    CompUsingPipes,
    CompConsumingEvents,
    DirPublishingEvents,
    MultipleComponentsMyComp,
    DirectiveForQuery,
    NextComp,
  ],
  imports: [
    BrowserModule, FormsModule, someLibModuleWithProviders(), ModuleUsingCustomElements,
    MdButtonModule
  ],
  providers: [SomeService],
  entryComponents: [
    AnimateCmp, BasicComp, CompWithEntryComponents, CompWithAnalyzeEntryComponentsProvider,
    ProjectingComp, CompWithChildQuery, CompUsingRootModuleDirectiveAndPipe, CompWithReferences
  ]
})
export class MainModule {
  constructor(public appRef: ApplicationRef) {}

  ngDoBootstrap() {}
}
