/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DOCUMENT} from '@angular/common';
import {
  ANIMATION_MODULE_TYPE,
  EnvironmentProviders,
  InjectionToken,
  makeEnvironmentProviders,
  NgZone,
  RendererFactory2,
  ɵperformanceMarkFeature as performanceMarkFeature,
} from '@angular/core';
import {ɵDomRendererFactory2 as DomRendererFactory2} from '@angular/platform-browser';

import {AsyncAnimationRendererFactory} from './async_animation_renderer';

type AnimationsTypes = 'animations' | 'noop';
const ANIMATIONS_TYPE_TOKEN = new InjectionToken<AnimationsTypes>('ANIMATIONS_TYPE');

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
 * ```typescript
 * bootstrapApplication(RootComponent, {
 *   providers: [
 *     provideAnimationsAsync()
 *   ]
 * });
 * ```
 *
 * You can also pass a function that returns the type of animations to use. This is useful if you want to
 * dynamically set the animations type based on the current environment.
 *
 * ```typescript
 * bootstrapApplication(RootComponent, {
 *   providers: [
 *     provideAnimationsAsync(() => {
 *       const document = inject(DOCUMENT);
 *       const disableAnimations = !('animate' in document.documentElement)
 *         || (navigator && /iPhone OS (8|9|10|11|12|13)_/.test(navigator.userAgent));
 *       return disableAnimations ? 'noop' : 'animations';
 *     })
 *   ]
 * });
 * ```
 *
 * @param type pass `'noop'` as argument to disable animations.
 *
 * @publicApi
 */
export function provideAnimationsAsync(
  type: AnimationsTypes | (() => AnimationsTypes) = 'animations',
): EnvironmentProviders {
  performanceMarkFeature('NgAsyncAnimations');
  return makeEnvironmentProviders([
    {
      provide: ANIMATIONS_TYPE_TOKEN,
      useFactory: () => {
        if (typeof type === 'function') {
          return type();
        }
        return type;
      },
    },
    {
      provide: ANIMATION_MODULE_TYPE,
      useFactory: (type: string) => (type === 'noop' ? 'NoopAnimations' : 'BrowserAnimations'),
      deps: [ANIMATIONS_TYPE_TOKEN],
    },
    {
      provide: RendererFactory2,
      useFactory: (
        doc: Document,
        renderer: DomRendererFactory2,
        zone: NgZone,
        type: AnimationsTypes,
      ) => {
        return new AsyncAnimationRendererFactory(doc, renderer, zone, type);
      },
      deps: [DOCUMENT, DomRendererFactory2, NgZone, ANIMATIONS_TYPE_TOKEN],
    },
  ]);
}
