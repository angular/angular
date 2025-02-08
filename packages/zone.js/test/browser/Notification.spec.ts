/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {zoneSymbol} from '../../lib/common/utils';
import {ifEnvSupports} from '../test-util';
declare const window: any;

function notificationSupport() {
  const desc =
    window['Notification'] &&
    Object.getOwnPropertyDescriptor(window['Notification'].prototype, 'onerror');
  return window['Notification'] && window['Notification'].prototype && desc && desc.configurable;
}

(<any>notificationSupport).message = 'Notification Support';

describe(
  'Notification API',
  ifEnvSupports(notificationSupport, function () {
    it('Notification API should be patched by Zone', () => {
      const Notification = window['Notification'];
      expect(Notification.prototype[zoneSymbol('addEventListener')]).toBeTruthy();
    });
  }),
);
