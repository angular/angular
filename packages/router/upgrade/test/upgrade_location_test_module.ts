/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {APP_BASE_HREF, CommonModule, Location, LocationStrategy, PlatformLocation} from '@angular/common';
import {MockPlatformLocation} from '@angular/common/testing';
import {$locationShim, $locationShimProvider, LocationUpgradeModule, UrlCodec} from '@angular/common/upgrade';
import {Inject, InjectionToken, ModuleWithProviders, NgModule, Optional} from '@angular/core';
import {UpgradeModule} from '@angular/upgrade/static';

export interface LocationUpgradeTestingConfig {
  useHash?: boolean;
  hashPrefix?: string;
  urlCodec?: typeof UrlCodec;
  startUrl?: string;
  appBaseHref?: string;
}

/**
 * @description
 *
 * Is used in DI to configure the router.
 */
export const LOC_UPGRADE_TEST_CONFIG =
    new InjectionToken<LocationUpgradeTestingConfig>('LOC_UPGRADE_TEST_CONFIG');


export const APP_BASE_HREF_RESOLVED = new InjectionToken<string>('APP_BASE_HREF_RESOLVED');

/**
 * Module used for configuring Angular's LocationUpgradeService.
 */
@NgModule({imports: [CommonModule]})
export class LocationUpgradeTestModule {
  static config(config?: LocationUpgradeTestingConfig):
      ModuleWithProviders<LocationUpgradeTestModule> {
    return {
      ngModule: LocationUpgradeTestModule,
      providers: [
        {provide: LOC_UPGRADE_TEST_CONFIG, useValue: config || {}}, {
          provide: PlatformLocation,
          useFactory: (appBaseHref?: string) => {
            if (config && config.appBaseHref != null) {
              appBaseHref = config.appBaseHref;
            } else if (appBaseHref == null) {
              appBaseHref = '';
            }
            return new MockPlatformLocation(
                {startUrl: config && config.startUrl, appBaseHref: appBaseHref});
          },
          deps: [[new Inject(APP_BASE_HREF), new Optional()]]
        },
        {
          provide: $locationShim,
          useFactory: provide$location,
          deps: [
            UpgradeModule, Location, PlatformLocation, UrlCodec, LocationStrategy,
            LOC_UPGRADE_TEST_CONFIG
          ]
        },
        LocationUpgradeModule
            .config({
              appBaseHref: config && config.appBaseHref,
              useHash: config && config.useHash || false
            })
            .providers!
      ],
    };
  }
}

export function provide$location(
    ngUpgrade: UpgradeModule, location: Location, platformLocation: PlatformLocation,
    urlCodec: UrlCodec, locationStrategy: LocationStrategy, config?: LocationUpgradeTestingConfig) {
  const $locationProvider =
      new $locationShimProvider(ngUpgrade, location, platformLocation, urlCodec, locationStrategy);

  $locationProvider.hashPrefix(config && config.hashPrefix);
  $locationProvider.html5Mode(config && !config.useHash);

  return $locationProvider.$get();
}
