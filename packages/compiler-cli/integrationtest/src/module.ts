/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ɵAnimationEngine} from '@angular/animations/browser';
import {ApplicationRef, NgModule, NgZone, Provider, RendererFactory2} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {NoopAnimationsModule, ɵAnimationRendererFactory} from '@angular/platform-browser/animations';
import {ServerModule, ɵServerRendererFactory2} from '@angular/platform-server';
import {MdButtonModule} from '@angular2-material/button';
// Note: don't refer to third_party_src as we want to test that
// we can compile components from node_modules!
import {ThirdpartyModule} from 'third_party/module';

import {MultipleComponentsMyComp, NextComp} from './a/multiple_components';
import {AnimateCmp} from './animate';
import {BasicComp} from './basic';
import {ComponentUsingThirdParty} from './comp_using_3rdp';
import {CUSTOM, Named} from './custom_token';
import {CompWithAnalyzeEntryComponentsProvider, CompWithEntryComponents} from './entry_components';
import {CompConsumingEvents, CompUsingPipes, CompWithProviders, CompWithReferences, DirPublishingEvents, ModuleUsingCustomElements} from './features';
import {CompUsingRootModuleDirectiveAndPipe, SomeDirectiveInRootModule, SomeLibModule, SomePipeInRootModule, SomeService} from './module_fixtures';
import {CompWithNgContent, ProjectingComp} from './projection';
import {CompForChildQuery, CompWithChildQuery, CompWithDirectiveChild, DirectiveForQuery} from './queries';

export function instantiateServerRendererFactory(
    renderer: RendererFactory2, engine: ɵAnimationEngine, zone: NgZone) {
  return new ɵAnimationRendererFactory(renderer, engine, zone);
}

// TODO(matsko): create a server module for animations and use
// that instead of these manual providers here.
export const SERVER_ANIMATIONS_PROVIDERS: Provider[] = [{
  provide: RendererFactory2,
  useFactory: instantiateServerRendererFactory,
  deps: [ɵServerRendererFactory2, ɵAnimationEngine, NgZone]
}];

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
    ComponentUsingThirdParty,
  ],
  imports: [
    NoopAnimationsModule,
    ServerModule,
    FormsModule,
    MdButtonModule,
    ModuleUsingCustomElements,
    SomeLibModule.withProviders(),
    ThirdpartyModule,
  ],
  providers: [
    SomeService,
    SERVER_ANIMATIONS_PROVIDERS,
    {provide: CUSTOM, useValue: {name: 'some name'}},
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
  ]
})
export class MainModule {
  constructor(public appRef: ApplicationRef) {}

  ngDoBootstrap() {}
}
