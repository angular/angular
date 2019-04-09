/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {APP_BASE_HREF, CommonModule, PlatformLocation} from '@angular/common';
import {MockPlatformLocation} from '@angular/common/testing';
import {Inject, InjectionToken, ModuleWithProviders, NgModule, Optional} from '@angular/core';
import {UpgradeModule} from '@angular/upgrade/static';

import {LocationUpgradeModule, LocationUpgradeService} from '../src';
import {LocationProvider, LocationUpgradeProvider} from '../src/$location';

export interface LocationUpgradeTestingConfig {
  useHash?: boolean;
  startUrl?: string;
  appBaseHref?: string;
  hashPrefix?: string;
  html5Mode?: boolean;
}

/**
 * @description
 *
 * Is used in DI to configure the router.
 *
 * @publicApi
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
          provide: LocationProvider,
          useFactory: provide$location,
          deps: [UpgradeModule, LocationUpgradeService, LOC_UPGRADE_TEST_CONFIG]
        },
        LocationUpgradeModule
            .config({
              appBaseHref: config && config.appBaseHref,
              useHash: config && config.useHash || false
            })
            .providers !
      ],
    };
  }
}

export function provide$location(
    ngUpgrade: UpgradeModule, locationUpgrade: LocationUpgradeService,
    config?: LocationUpgradeTestingConfig) {
  const $locationProvider = new LocationUpgradeProvider(ngUpgrade, locationUpgrade);

  $locationProvider.hashPrefix(config && config.hashPrefix);
  $locationProvider.html5Mode(config && config.html5Mode);

  return $locationProvider.$get();
}