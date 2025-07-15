/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Provider, signal, WritableSignal} from '@angular/core';
import {Settings} from '../settings';

export class SettingsMock {
  routerGraphEnabled = signal(false);
  showCommentNodes = signal(false);
  signalGraphEnabled = signal(false);
  timingAPIEnabled = signal(false);
}

export const SETTINGS_MOCK: Provider = {
  provide: Settings,
  useClass: SettingsMock,
};
