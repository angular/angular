/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ApplicationInitStatus} from './application_init';
import {ApplicationRef, ApplicationRef_} from './application_ref';
import {APP_ID_RANDOM_PROVIDER} from './application_tokens';
import {IterableDiffers, KeyValueDiffers, defaultIterableDiffers, defaultKeyValueDiffers} from './change_detection/change_detection';
import {LOCALE_ID} from './i18n/tokens';
import {Compiler} from './linker/compiler';
import {ComponentResolver} from './linker/component_resolver';
import {DynamicComponentLoader, DynamicComponentLoader_} from './linker/dynamic_component_loader';
import {ViewUtils} from './linker/view_utils';
import {NgModule} from './metadata';
import {Type} from './type';

export function _iterableDiffersFactory() {
  return defaultIterableDiffers;
}

export function _keyValueDiffersFactory() {
  return defaultKeyValueDiffers;
}

/**
 * A default set of providers which should be included in any Angular
 * application, regardless of the platform it runs onto.
 *
 * @deprecated Include `ApplicationModule` instead.
 */
export const APPLICATION_COMMON_PROVIDERS: Array<Type<any>|{[k: string]: any}|any[]> = [];

/**
 * This module includes the providers of @angular/core that are needed
 * to bootstrap components via `ApplicationRef`.
 *
 * @experimental
 */
@NgModule({
  providers: [
    ApplicationRef_,
    {provide: ApplicationRef, useExisting: ApplicationRef_},
    ApplicationInitStatus,
    Compiler,
    {provide: ComponentResolver, useExisting: Compiler},
    APP_ID_RANDOM_PROVIDER,
    ViewUtils,
    {provide: IterableDiffers, useFactory: _iterableDiffersFactory},
    {provide: KeyValueDiffers, useFactory: _keyValueDiffersFactory},
    {provide: DynamicComponentLoader, useClass: DynamicComponentLoader_},
    {provide: LOCALE_ID, useValue: 'en_US'},
  ]
})
export class ApplicationModule {
}
