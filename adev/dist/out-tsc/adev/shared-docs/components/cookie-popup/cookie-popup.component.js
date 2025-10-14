/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {LOCAL_STORAGE} from '../../providers/index';
import {setCookieConsent} from '../../utils';
export const STORAGE_KEY = 'docs-accepts-cookies';
let CookiePopup = (() => {
  let _classDecorators = [
    Component({
      selector: 'docs-cookie-popup',
      templateUrl: './cookie-popup.component.html',
      styleUrls: ['./cookie-popup.component.scss'],
      changeDetection: ChangeDetectionStrategy.OnPush,
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var CookiePopup = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      CookiePopup = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    localStorage = inject(LOCAL_STORAGE);
    /** Whether the user has accepted the cookie disclaimer. */
    hasAccepted = signal(false);
    constructor() {
      // Needs to be in a try/catch, because some browsers will
      // throw when using `localStorage` in private mode.
      try {
        this.hasAccepted.set(this.localStorage?.getItem(STORAGE_KEY) === 'true');
      } catch {
        this.hasAccepted.set(false);
      }
    }
    /** Accepts the cookie disclaimer. */
    accept() {
      try {
        this.localStorage?.setItem(STORAGE_KEY, 'true');
      } catch {}
      this.hasAccepted.set(true);
      // Enable Google Analytics consent properties
      setCookieConsent('granted');
    }
  };
  return (CookiePopup = _classThis);
})();
export {CookiePopup};
//# sourceMappingURL=cookie-popup.component.js.map
