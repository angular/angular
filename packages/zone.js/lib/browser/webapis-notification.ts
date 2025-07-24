/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ZoneType} from '../zone-impl';

export function patchNotifications(Zone: ZoneType): void {
  Zone.__load_patch('notification', (global: any, Zone: ZoneType, api: _ZonePrivate) => {
    const Notification = global['Notification'];
    if (!Notification || !Notification.prototype) {
      return;
    }
    const desc = Object.getOwnPropertyDescriptor(Notification.prototype, 'onerror');
    if (!desc || !desc.configurable) {
      return;
    }
    api.patchOnProperties(Notification.prototype, null);
  });
}
