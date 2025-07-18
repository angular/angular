/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {BootstrapOptions} from '../../application/application_ref';
import {getNgZone} from '../../zone/ng_zone';
import {getNgZoneOptions, internalProvideZoneChangeDetection} from './ng_zone_scheduling';
import {
  ChangeDetectionSchedulerImpl,
  internalProvideZonelessChangeDetection,
} from './zoneless_scheduling_impl';
import {Provider} from '../../di/interface/provider';
import {ChangeDetectionScheduler} from './zoneless_scheduling';

export function provideChangeDetectionScheduling(options?: BootstrapOptions): Provider[] {
  const scheduleInRootZone = (options as any)?.scheduleInRootZone;
  const ngZoneFactory = () =>
    getNgZone(options?.ngZone, {
      ...getNgZoneOptions({
        eventCoalescing: options?.ngZoneEventCoalescing,
        runCoalescing: options?.ngZoneRunCoalescing,
      }),
      scheduleInRootZone,
    });
  const ignoreChangesOutsideZone = options?.ignoreChangesOutsideZone;
  const isZoneAvailable = typeof Zone !== 'undefined' && !!Zone.root.run;
  return [
    isZoneAvailable
      ? internalProvideZoneChangeDetection({
          ngZoneFactory,
          ignoreChangesOutsideZone,
        })
      : internalProvideZonelessChangeDetection(),
    {provide: ChangeDetectionScheduler, useExisting: ChangeDetectionSchedulerImpl},
  ];
}
