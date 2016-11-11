/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CompilerFactory, PlatformRef, Provider, createPlatformFactory} from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

import {CapturedContentSelectors, RuntimeCompilerCapturingFactory} from './compiler-capture';
import {NG2_CAPTURED_CONTENT_SELECTORS} from './constants';

const INTERNAL_UPGRADE_PLATFORM_PROVIDERS: Provider[] = [
  {provide: NG2_CAPTURED_CONTENT_SELECTORS, useClass: CapturedContentSelectors},
  {provide: CompilerFactory, useClass: RuntimeCompilerCapturingFactory}
];

/**
 * Platform extending platformBrowserDynamic for applications running both Angular 1 and Angular 2.
 *
 * This platform is used by the JiT UpgradeAdapter, but is made public for testing purposes,
 * should you need access to the platform itself.
 *
 * @experimental
 */
export const platformUpgrade =
    createPlatformFactory(platformBrowserDynamic, 'upgrade', INTERNAL_UPGRADE_PLATFORM_PROVIDERS);
