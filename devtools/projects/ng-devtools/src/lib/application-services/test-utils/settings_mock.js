/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {signal} from '@angular/core';
import {Settings} from '../settings';
import {SettingsStore} from '../settings_store';
export class SettingsMock extends Settings {
  constructor() {
    super(...arguments);
    this.routerGraphEnabled = signal(false);
    this.showCommentNodes = signal(false);
    this.signalGraphEnabled = signal(false);
    this.timingAPIEnabled = signal(false);
    this.theme = signal('system');
    this.activeTab = signal('Components');
  }
}
export const SETTINGS_MOCK = [
  {
    provide: SettingsStore,
    useClass: class {
      create(config) {
        return signal(null);
      }
    },
  },
  {
    provide: Settings,
    useClass: SettingsMock,
  },
];
//# sourceMappingURL=settings_mock.js.map
