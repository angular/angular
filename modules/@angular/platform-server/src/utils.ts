/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ApplicationRef, NgModuleFactory, NgModuleRef, PlatformRef, Provider, Type} from '@angular/core';
import {ɵTRANSITION_ID} from '@angular/platform-browser';
import {filter} from 'rxjs/operator/filter';
import {first} from 'rxjs/operator/first';
import {toPromise} from 'rxjs/operator/toPromise';

import {PlatformState} from './platform_state';
import {platformDynamicServer, platformServer} from './server';
import {INITIAL_CONFIG} from './tokens';

const parse5 = require('parse5');

export interface PlatformOptions {
  document?: string;
  url?: string;
  extraProviders?: Provider[];
}

function _getPlatform(
    platformFactory: (extraProviders: Provider[]) => PlatformRef,
    options: PlatformOptions): PlatformRef {
  const extraProviders = options.extraProviders ? options.extraProviders : [];
  return platformFactory([
    {provide: INITIAL_CONFIG, useValue: {document: options.document, url: options.url}},
    extraProviders
  ]);
}

function _render<T>(
    platform: PlatformRef, moduleRefPromise: Promise<NgModuleRef<T>>): Promise<string> {
  return moduleRefPromise.then((moduleRef) => {
    const transitionId = moduleRef.injector.get(ɵTRANSITION_ID, null);
    if (!transitionId) {
      throw new Error(
          `renderModule[Factory]() requires the use of BrowserModule.withServerTransition() to ensure
the server-rendered app can be properly bootstrapped into a client app.`);
    }
    const applicationRef: ApplicationRef = moduleRef.injector.get(ApplicationRef);
    return toPromise
        .call(first.call(filter.call(applicationRef.isStable, (isStable: boolean) => isStable)))
        .then(() => {
          const output = platform.injector.get(PlatformState).renderToString();
          platform.destroy();
          return output;
        });
  });
}

/**
 * Renders a Module to string.
 *
 * Do not use this in a production server environment. Use pre-compiled {@link NgModuleFactory} with
 * {link renderModuleFactory} instead.
 *
 * @experimental
 */
export function renderModule<T>(module: Type<T>, options: PlatformOptions): Promise<string> {
  const platform = _getPlatform(platformDynamicServer, options);
  return _render(platform, platform.bootstrapModule(module));
}

/**
 * Renders a {@link NgModuleFactory} to string.
 *
 * @experimental
 */
export function renderModuleFactory<T>(
    moduleFactory: NgModuleFactory<T>, options: PlatformOptions): Promise<string> {
  const platform = _getPlatform(platformServer, options);
  return _render(platform, platform.bootstrapModuleFactory(moduleFactory));
}
