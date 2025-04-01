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
import {Inject, InjectionToken, ModuleWithProviders, NgModule, Optional} from '@angular/core';
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
          deps: [UpgradeModule, Location, PlatformLocation, UrlCodec, LocationStrategy],
        },
        {provide: LOCATION_UPGRADE_CONFIGURATION, useValue: config ? config : {}},
        {provide: UrlCodec, useFactory: provideUrlCodec, deps: [LOCATION_UPGRADE_CONFIGURATION]},
        {
          provide: APP_BASE_HREF_RESOLVED,
          useFactory: provideAppBaseHref,
          deps: [LOCATION_UPGRADE_CONFIGURATION, [new Inject(APP_BASE_HREF), new Optional()]],
        },
        {
          provide: LocationStrategy,
          useFactory: provideLocationStrategy,
          deps: [PlatformLocation, APP_BASE_HREF_RESOLVED, LOCATION_UPGRADE_CONFIGURATION],
        },
      ],
    };
  }
}

export function provideAppBaseHref(config: LocationUpgradeConfig, appBaseHref?: string) {
  if (config && config.appBaseHref != null) {
    return config.appBaseHref;
  } else if (appBaseHref != null) {
    return appBaseHref;
  }
  return '';
}

export function provideUrlCodec(config: LocationUpgradeConfig) {
  const codec = (config && config.urlCodec) || AngularJSUrlCodec;
  return new (codec as any)();
}

export function provideLocationStrategy(
  platformLocation: PlatformLocation,
  baseHref: string,
  options: LocationUpgradeConfig = {},
) {
  return options.useHash
    ? new HashLocationStrategy(platformLocation, baseHref)
    : new PathLocationStrategy(platformLocation, baseHref);
}

export function provide$location(
  ngUpgrade: UpgradeModule,
  location: Location,
  platformLocation: PlatformLocation,
  urlCodec: UrlCodec,
  locationStrategy: LocationStrategy,
) {
  const $locationProvider = new $locationShimProvider(
    ngUpgrade,
    location,
    platformLocation,
    urlCodec,
    locationStrategy,
  );

  return $locationProvider.$get();
}
