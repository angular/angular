/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Zone.__load_patch('ResizeObserver', (global: any, Zone: any, api: _ZonePrivate) => {
  const ResizeObserver = global['ResizeObserver'];
  if (!ResizeObserver) {
    return;
  }

  api.patchObserver(global, api, 'ResizeObserver');
});
