/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Zone.__load_patch('webext', (global: any, Zone: ZoneType, api: _ZonePrivate) => {
  (Zone as any)[Zone.__symbol__('webext')] = function patchWebExt(webExt: any) {
    const storage = webExt.storage;
    if (!storage) {
      return;
    }

    const onChanged = webExt.storage.onChanged;
    if (!onChanged || !onChanged.hasOwnProperty('addListener')) {
      return;
    }

    api.patchEventTarget(global, [webExt.storage.onChanged]], {
      add: 'addListener',
      rm: 'removeListener',
    });
  };
});
