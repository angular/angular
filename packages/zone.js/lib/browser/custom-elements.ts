/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export function patchCustomElements(_global: any, api: _ZonePrivate) {
  const {isBrowser, isMix} = api.getGlobalObjects()!;
  if ((!isBrowser && !isMix) || !_global['customElements'] || !('customElements' in _global)) {
    return;
  }

  const callbacks =
      ['connectedCallback', 'disconnectedCallback', 'adoptedCallback', 'attributeChangedCallback'];

  api.patchCallbacks(api, _global.customElements, 'customElements', 'define', callbacks);
}
