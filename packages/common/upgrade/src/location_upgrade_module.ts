/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {APP_BASE_HREF, CommonModule, HashLocationStrategy, Location, LocationStrategy, PathLocationStrategy, PlatformLocation} from '@angular/common';
import {Inject, InjectionToken, ModuleWithProviders, NgModule, Optional} from '@angular/core';
import {UpgradeModule} from '@angular/upgrade/static';

import {$locationShim, $locationShimProvider} from './$location_shim';
import {AngularJSUrlCodec, UrlCodec} from './params';


/**
 * Configuration options for LocationUpgrade.
 *
 * @publicApi
 */
export interface LocationUpgradeConfig {
  useHash?: boolean;
  hashPrefix?: string;
  urlCodec?: typeof UrlCodec;
  serverBaseHref?: string;
  appBaseHref?: string;
}

/**
 * Is used in DI to configure the location upgrade package.
 *
 * @publicApi
 */
export const LOCATION_UPGRADE_CONFIGURATION =
    new InjectionToken<LocationUpgradeConfig>('LOCATION_UPGRADE_CONFIGURATION');

const APP_BASE_HREF_RESOLVED = new InjectionToken<string>('APP_BASE_HREF_RESOLVED');

/**
 * Module used for configuring Angular's LocationUpgradeService.
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
          deps: [UpgradeModule, Location, PlatformLocation, UrlCodec, LocationStrategy]
        },
        {provide: LOCATION_UPGRADE_CONFIGURATION, useValue: config ? config : {}},
        {provide: UrlCodec, useFactory: provideUrlCodec, deps: [LOCATION_UPGRADE_CONFIGURATION]},
        {
          provide: APP_BASE_HREF_RESOLVED,
          useFactory: provideAppBaseHref,
          deps: [LOCATION_UPGRADE_CONFIGURATION, [new Inject(APP_BASE_HREF), new Optional()]]
        },
        {
          provide: LocationStrategy,
          useFactory: provideLocationStrategy,
          deps: [
            PlatformLocation,
            APP_BASE_HREF_RESOLVED,
            LOCATION_UPGRADE_CONFIGURATION,
          ]
        },
      ],
    };
  }
}

/** @internal */
export function provideAppBaseHref(config: LocationUpgradeConfig, appBaseHref?: string) {
  if (config && config.appBaseHref != null) {
    return config.appBaseHref;
  } else if (appBaseHref != null) {
    return appBaseHref;
  }
  return '';
}

/** @internal */
export function provideUrlCodec(config: LocationUpgradeConfig) {
  const codec = config && config.urlCodec || AngularJSUrlCodec;
  return new (codec as any)();
}

/** @internal */
export function provideLocationStrategy(
    platformLocation: PlatformLocation, baseHref: string, options: LocationUpgradeConfig = {}) {
  return options.useHash ? new HashLocationStrategy(platformLocation, baseHref) :
                           new PathLocationStrategy(platformLocation, baseHref);
}

/** @internal */
export function provide$location(
    ngUpgrade: UpgradeModule, location: Location, platformLocation: PlatformLocation,
    urlCodec: UrlCodec, locationStrategy: LocationStrategy) {
  const $locationProvider =
      new $locationShimProvider(ngUpgrade, location, platformLocation, urlCodec, locationStrategy);

  return $locationProvider.$get();
}