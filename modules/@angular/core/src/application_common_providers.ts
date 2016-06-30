/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Type} from '../src/facade/lang';

import {APPLICATION_CORE_PROVIDERS} from './application_ref';
import {APP_ID_RANDOM_PROVIDER} from './application_tokens';
import {IterableDiffers, KeyValueDiffers, defaultIterableDiffers, defaultKeyValueDiffers} from './change_detection/change_detection';
import {ComponentFactoryResolver} from './linker/component_factory_resolver';
import {ComponentResolver, ReflectorComponentResolver} from './linker/component_resolver';
import {DynamicComponentLoader, DynamicComponentLoader_} from './linker/dynamic_component_loader';
import {ViewUtils} from './linker/view_utils';

let __unused: Type;  // avoid unused import when Type union types are erased

export function _componentFactoryResolverFactory() {
  return ComponentFactoryResolver.NULL;
}

export function _iterableDiffersFactory() {
  return defaultIterableDiffers;
}

export function _keyValueDiffersFactory() {
  return defaultKeyValueDiffers;
}

/**
 * A default set of providers which should be included in any Angular
 * application, regardless of the platform it runs onto.
 * @stable
 */
export const APPLICATION_COMMON_PROVIDERS: Array<Type|{[k: string]: any}|any[]> =
    /*@ts2dart_const*/[
      APPLICATION_CORE_PROVIDERS,
      /* @ts2dart_Provider */ {provide: ComponentResolver, useClass: ReflectorComponentResolver},
      {provide: ComponentFactoryResolver, useFactory: _componentFactoryResolverFactory, deps: []},
      APP_ID_RANDOM_PROVIDER,
      ViewUtils,
      /* @ts2dart_Provider */ {
        provide: IterableDiffers,
        useFactory: _iterableDiffersFactory,
        deps: []
      },
      /* @ts2dart_Provider */ {
        provide: KeyValueDiffers,
        useFactory: _keyValueDiffersFactory,
        deps: []
      },
      /* @ts2dart_Provider */ {provide: DynamicComponentLoader, useClass: DynamicComponentLoader_},
    ];
