/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {asapScheduler, asyncScheduler, Scheduler} from 'rxjs';

import {ZoneType} from '../zone-impl';

export function patchRxJsFakeAsync(Zone: ZoneType): void {
  Zone.__load_patch('rxjs.Scheduler.now', (global: any, Zone: ZoneType, api: _ZonePrivate) => {
    api.patchMethod(Scheduler, 'now', (delegate: Function) => (self: any, args: any[]) => {
      return Date.now.call(self);
    });
    api.patchMethod(asyncScheduler, 'now', (delegate: Function) => (self: any, args: any[]) => {
      return Date.now.call(self);
    });
    api.patchMethod(asapScheduler, 'now', (delegate: Function) => (self: any, args: any[]) => {
      return Date.now.call(self);
    });
  });
}
