/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ApplicationRef, forwardRef, NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {ServerModule} from '@angular/platform-server';
import {FlatModule} from 'flat_module';
// Note: don't refer to third_party_src as we want to test that
// we can compile components from node_modules!
import {ThirdpartyModule} from 'third_party/module';

import {MultipleComponentsMyComp, NextComp} from './a/multiple_components.js';
import {AnimateCmp} from './animate.js';
import {BasicComp} from './basic.js';
import {ComponentUsingThirdParty} from './comp_using_3rdp.js';
import {ComponentUsingFlatModule} from './comp_using_flat_module.js';
import {CUSTOM} from './custom_token.js';
import {CompWithAnalyzeEntryComponentsProvider, CompWithEntryComponents} from './entry_components.js';
import {BindingErrorComp} from './errors.js';
import {CompConsumingEvents, CompUsingPipes, CompWithProviders, CompWithReferences, DirPublishingEvents, ModuleUsingCustomElements} from './features.js';
import {CompUsingRootModuleDirectiveAndPipe, SomeDirectiveInRootModule, SomeLibModule, SomePipeInRootModule, SomeService} from './module_fixtures.js';
import {CompWithNgContent, ProjectingComp} from './projection.js';
import {CompForChildQuery, CompWithChildQuery, CompWithDirectiveChild, DirectiveForQuery} from './queries.js';

// Adding an export here so that TypeScript compiles the file as well
export {SomeModule as JitSummariesSomeModule} from './jit_summaries.js';

@NgModule({
  declarations: [
    AnimateCmp,
    BasicComp,
    CompConsumingEvents,
    CompForChildQuery,
    CompUsingPipes,
    CompUsingRootModuleDirectiveAndPipe,
    CompWithAnalyzeEntryComponentsProvider,
    CompWithChildQuery,
    CompWithDirectiveChild,
    CompWithEntryComponents,
    CompWithNgContent,
    CompWithProviders,
    CompWithReferences,
    DirectiveForQuery,
    DirPublishingEvents,
    MultipleComponentsMyComp,
    NextComp,
    ProjectingComp,
    SomeDirectiveInRootModule,
    SomePipeInRootModule,
    ComponentUsingFlatModule,
    ComponentUsingThirdParty,
    BindingErrorComp,
  ],
  imports: [
    ServerModule,
    FormsModule,
    ModuleUsingCustomElements,
    SomeLibModule.withProviders(),
    ThirdpartyModule,
    FlatModule,
  ],
  providers: [
    SomeService,
    {provide: CUSTOM, useValue: forwardRef(() => ({name: 'some name'}))},
  ],
  entryComponents: [
    AnimateCmp,
    BasicComp,
    CompUsingRootModuleDirectiveAndPipe,
    CompWithAnalyzeEntryComponentsProvider,
    CompWithChildQuery,
    CompWithEntryComponents,
    CompWithReferences,
    ProjectingComp,
    ComponentUsingThirdParty,
    ComponentUsingFlatModule,
    BindingErrorComp,
  ]
})
export class MainModule {
  constructor(public appRef: ApplicationRef) {}

  ngDoBootstrap() {}
}
