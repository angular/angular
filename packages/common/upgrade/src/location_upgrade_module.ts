/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  APP_BASE_HREF,
  CommonModule,
  HashLocationStrategy,
  Location,
  LocationStrategy,
  PathLocationStrategy,
  PlatformLocation,
} from '../../index';
import {inject, InjectionToken, ModuleWithProviders, NgModule} from '@angular/core';
import {UpgradeModule} from '@angular/upgrade/static';

import {$locationShim, $locationShimProvider} from './location_shim';
import {AngularJSUrlCodec, UrlCodec} from './params';

/**
 * Configuration options for LocationUpgrade.
 *
 * @publicApi
 */
export interface LocationUpgradeConfig {
  /**
   * Configures whether the location upgrade module should use the `HashLocationStrategy`
   * or the `PathLocationStrategy`
   */
  useHash?: boolean;
  /**
   * Configures the hash prefix used in the URL when using the `HashLocationStrategy`
   */
  hashPrefix?: string;
  /**
   * Configures the URL codec for encoding and decoding URLs. Default is the `AngularJSCodec`
   */
  urlCodec?: typeof UrlCodec;
  /**
   * Configures the base href when used in server-side rendered applications
   */
  serverBaseHref?: string;
  /**
   * Configures the base href when used in client-side rendered applications
   */
  appBaseHref?: string;
}

/**
 * A provider token used to configure the location upgrade module.
 *
 * @publicApi
 */
export const LOCATION_UPGRADE_CONFIGURATION = new InjectionToken<LocationUpgradeConfig>(
  ngDevMode ? 'LOCATION_UPGRADE_CONFIGURATION' : '',
);

const APP_BASE_HREF_RESOLVED = new InjectionToken<string>(
  ngDevMode ? 'APP_BASE_HREF_RESOLVED' : '',
);

/**
 * `NgModule` used for providing and configuring Angular's Unified Location Service for upgrading.
 *
 * @see [Using the Unified Angular Location Service](https://angular.io/guide/upgrade#using-the-unified-angular-location-service)
 *
 * @publicApi
 */
@NgModule({imports: [CommonModule]})
export class LocationUpgradeModule {
  static config(config?: LocationUpgradeConfig): ModuleWithProviders<LocationUpgradeModule> {
    return {
      ngModule: LocationUpgradeModule,
      providers: [
        Location,
        {
          provide: $locationShim,
          useFactory: provide$location,
        },
        {provide: LOCATION_UPGRADE_CONFIGURATION, useValue: config ? config : {}},
        {provide: UrlCodec, useFactory: provideUrlCodec},
        {
          provide: APP_BASE_HREF_RESOLVED,
          useFactory: provideAppBaseHref,
        },
        {
          provide: LocationStrategy,
          useFactory: provideLocationStrategy,
        },
      ],
    };
  }
}

function provideAppBaseHref() {
  const config = inject(LOCATION_UPGRADE_CONFIGURATION);
  const appBaseHref = inject(APP_BASE_HREF, {optional: true});

  if (config && config.appBaseHref != null) {
    return config.appBaseHref;
  } else if (appBaseHref != null) {
    return appBaseHref;
  }
  return '';
}

function provideUrlCodec() {
  const config = inject(LOCATION_UPGRADE_CONFIGURATION);
  const codec = (config && config.urlCodec) || AngularJSUrlCodec;
  return new (codec as any)();
}

function provideLocationStrategy() {
  const platformLocation = inject(PlatformLocation);
  const baseHref = inject(APP_BASE_HREF_RESOLVED);
  const options = inject(LOCATION_UPGRADE_CONFIGURATION);
  return options.useHash
    ? new HashLocationStrategy(platformLocation, baseHref)
    : new PathLocationStrategy(platformLocation, baseHref);
}

function provide$location() {
  const $locationProvider = new $locationShimProvider(
    inject(UpgradeModule),
    inject(Location),
    inject(PlatformLocation),
    inject(UrlCodec),
    inject(LocationStrategy),
  );

  return $locationProvider.$get();
}
