/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {PlatformRef, PlatformRef_, createPlatformFactory} from './application_ref';
import {PLATFORM_ID} from './application_tokens';
import {Console} from './console';
import {Provider} from './di';
import {Reflector, reflector} from './reflection/reflection';
import {ReflectorReader} from './reflection/reflector_reader';
import {TestabilityRegistry} from './testability/testability';

function _reflector(): Reflector {
  return reflector;
}

const _CORE_PLATFORM_PROVIDERS: Provider[] = [
  // Set a default platform name for platforms that don't set it explicitly.
  {provide: PLATFORM_ID, useValue: 'unknown'},
  PlatformRef_,
  {provide: PlatformRef, useExisting: PlatformRef_},
  {provide: Reflector, useFactory: _reflector, deps: []},
  {provide: ReflectorReader, useExisting: Reflector},
  TestabilityRegistry,
  Console,
];

/**
 * This platform has to be included in any other platform
 *
 * @experimental
 */
export const platformCore = createPlatformFactory(null, 'core', _CORE_PLATFORM_PROVIDERS);
