/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export function registerElementPatch(_global: any, api: _ZonePrivate) {
  const {isBrowser, isMix} = api.getGlobalObjects()!;
  if ((!isBrowser && !isMix) || !('registerElement' in (<any>_global).document)) {
    return;
  }

  const callbacks =
      ['createdCallback', 'attachedCallback', 'detachedCallback', 'attributeChangedCallback'];

  api.patchCallbacks(api, document, 'Document', 'registerElement', callbacks);
}
