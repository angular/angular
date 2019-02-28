/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {APP_BASE_HREF, CommonModule, HashLocationStrategy, Location, LocationStrategy, PathLocationStrategy, PlatformLocation} from '@angular/common';
import {Inject, InjectionToken, ModuleWithProviders, NgModule, Optional} from '@angular/core';

import {LocationUpgradeService} from './location';
import {AngularJSUrlCodec, UrlCodec} from './params';

export interface LocationUpgradeConfig {
  useHash?: boolean;
  urlCodec?: typeof UrlCodec;
  serverBaseHref?: string;
  appBaseHref?: string;
}

/**
 * @description
 *
 * Is used in DI to configure the router.
 *
 * @publicApi
 */
export const LOCATION_UPGRADE_CONFIGURATION =
    new InjectionToken<LocationUpgradeConfig>('LOCATION_UPGRADE_CONFIGURATION');


export const APP_BASE_HREF_RESOLVED = new InjectionToken<string>('APP_BASE_HREF_RESOLVED');

/**
 * Module used for configuring Angular's LocationUpgradeService.
 */
@NgModule({imports: [CommonModule]})
export class LocationUpgradeModule {
  static config(config?: LocationUpgradeConfig): ModuleWithProviders<LocationUpgradeModule> {
    return {
      ngModule: LocationUpgradeModule,
      providers: [
        Location,
        LocationUpgradeService,
        {
          provide: UrlCodec,
          useFactory: () => {
            const codec = config && config.urlCodec || AngularJSUrlCodec;
            return new (codec as any)();
          }
        },
        {provide: LOCATION_UPGRADE_CONFIGURATION, useValue: config ? config : {}},
        {
          provide: APP_BASE_HREF_RESOLVED,
          useFactory: (appBaseHref?: string) => {
            if (config && config.appBaseHref != null) {
              return config.appBaseHref;
            } else if (appBaseHref != null) {
              return appBaseHref;
            }
            return '';
          },
          deps: [[new Inject(APP_BASE_HREF), new Optional()]]
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

export function provideLocationStrategy(
    platformLocationStrategy: PlatformLocation, baseHref: string,
    options: LocationUpgradeConfig = {}) {
  return options.useHash ? new HashLocationStrategy(platformLocationStrategy, baseHref) :
                           new PathLocationStrategy(platformLocationStrategy, baseHref);
}