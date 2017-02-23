/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {NgModule, NgZone, RendererFactoryV2} from '@angular/core';
import {BrowserModule, ɵDomRendererFactoryV2} from '@angular/platform-browser';

import {AnimationEngine} from './animation_engine';
import {AnimationRendererFactory} from './render/animation_renderer';
import {NoopAnimationEngine} from './render/noop_animation_engine';

export function instantiateRendererFactory(
    renderer: ɵDomRendererFactoryV2, engine: AnimationEngine, zone: NgZone) {
  return new AnimationRendererFactory(renderer, engine, zone);
}

/**
 * @experimental Animation support is experimental.
 */
@NgModule({
  imports: [BrowserModule],
  providers: [
    {provide: AnimationEngine, useClass: NoopAnimationEngine}, {
      provide: RendererFactoryV2,
      useFactory: instantiateRendererFactory,
      deps: [ɵDomRendererFactoryV2, AnimationEngine, NgZone]
    }
  ]
})
export class NoopBrowserAnimationModule {
}
