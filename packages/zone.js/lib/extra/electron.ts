/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ZoneType} from '../zone-impl';

export function patchElectron(Zone: ZoneType): void {
  Zone.__load_patch('electron', (global: any, Zone: ZoneType, api: _ZonePrivate) => {
    function patchArguments(target: any, name: string, source: string): Function | null {
      return api.patchMethod(target, name, (delegate: Function) => (self: any, args: any[]) => {
        return delegate && delegate.apply(self, api.bindArguments(args, source));
      });
    }
    let {desktopCapturer, shell, CallbacksRegistry, ipcRenderer} = require('electron');
    if (!CallbacksRegistry) {
      try {
        // Try to load CallbacksRegistry class from @electron/remote src
        // since from electron 14+, the CallbacksRegistry is moved to @electron/remote
        // package and not exported to outside, so this is a hack to patch CallbacksRegistry.
        CallbacksRegistry =
          require('@electron/remote/dist/src/renderer/callbacks-registry').CallbacksRegistry;
      } catch (err) {}
    }
    // patch api in renderer process directly
    // desktopCapturer
    if (desktopCapturer) {
      patchArguments(desktopCapturer, 'getSources', 'electron.desktopCapturer.getSources');
    }
    // shell
    if (shell) {
      patchArguments(shell, 'openExternal', 'electron.shell.openExternal');
    }

    // patch api in main process through CallbackRegistry
    if (!CallbacksRegistry) {
      if (ipcRenderer) {
        patchArguments(ipcRenderer, 'on', 'ipcRenderer.on');
      }
      return;
    }

    patchArguments(CallbacksRegistry.prototype, 'add', 'CallbackRegistry.add');
  });
}
