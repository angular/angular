/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DOCUMENT} from '@angular/common';
import {
  ANIMATION_MODULE_TYPE,
  EnvironmentProviders,
  makeEnvironmentProviders,
  NgZone,
  RendererFactory2,
  ɵperformanceMarkFeature as performanceMarkFeature,
} from '@angular/core';
import {ɵDomRendererFactory2 as DomRendererFactory2} from '../../../index';

import {AsyncAnimationRendererFactory} from './async_animation_renderer';

/**
 * Returns the set of dependency-injection providers
 * to enable animations in an application. See [animations guide](guide/animations)
 * to learn more about animations in Angular.
 *
 * When you use this function instead of the eager `provideAnimations()`, animations won't be
 * rendered until the renderer is loaded.
 *
 * @usageNotes
 *
 * The function is useful when you want to enable animations in an application
 * bootstrapped using the `bootstrapApplication` function. In this scenario there
 * is no need to import the `BrowserAnimationsModule` NgModule at all, just add
 * providers returned by this function to the `providers` list as show below.
 *
 * ```ts
 * bootstrapApplication(RootComponent, {
 *   providers: [
 *     provideAnimationsAsync()
 *   ]
 * });
 * ```
 *
 * @param type pass `'noop'` as argument to disable animations.
 *
 * @publicApi
 */
export function provideAnimationsAsync(
  type: 'animations' | 'noop' = 'animations',
): EnvironmentProviders {
  performanceMarkFeature('NgAsyncAnimations');

  // Animations don't work on the server so we switch them over to no-op automatically.
  if (typeof ngServerMode !== 'undefined' && ngServerMode) {
    type = 'noop';
  }

  return makeEnvironmentProviders([
    {
      provide: RendererFactory2,
      useFactory: (doc: Document, renderer: DomRendererFactory2, zone: NgZone) => {
        return new AsyncAnimationRendererFactory(doc, renderer, zone, type);
      },
      deps: [DOCUMENT, DomRendererFactory2, NgZone],
    },
    {
      provide: ANIMATION_MODULE_TYPE,
      useValue: type === 'noop' ? 'NoopAnimations' : 'BrowserAnimations',
    },
  ]);
}
