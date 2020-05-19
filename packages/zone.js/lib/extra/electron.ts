/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Zone.__load_patch('electron', (global: any, Zone: ZoneType, api: _ZonePrivate) => {
  function patchArguments(target: any, name: string, source: string): Function|null {
    return api.patchMethod(target, name, (delegate: Function) => (self: any, args: any[]) => {
      return delegate && delegate.apply(self, api.bindArguments(args, source));
    });
  }
  const {desktopCapturer, shell, CallbacksRegistry, ipcRenderer} = require('electron');
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
