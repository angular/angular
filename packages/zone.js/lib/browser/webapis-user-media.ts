/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Zone.__load_patch('getUserMedia', (global: any, Zone: any, api: _ZonePrivate) => {
  let navigator = global['navigator'];
  if (navigator && navigator.getUserMedia) {
    api.patchMethod(navigator, 'getUserMedia', (delegate) => (self, args) => {
      return delegate.apply(self, api.bindArguments(args, 'navigator.getUserMedia'));
    });
  }
});
