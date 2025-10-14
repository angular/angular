/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {ChangeDetectionStrategy, Component, inject, input, linkedSignal} from '@angular/core';
import {ExternalLink} from '../../directives';
import {LOCAL_STORAGE} from '../../providers';
import {IconComponent} from '../icon/icon.component';
export const STORAGE_KEY_PREFIX = 'docs-was-closed-top-banner-';
let TopLevelBannerComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'docs-top-level-banner',
      imports: [ExternalLink, IconComponent],
      templateUrl: './top-level-banner.component.html',
      styleUrl: './top-level-banner.component.scss',
      changeDetection: ChangeDetectionStrategy.OnPush,
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var TopLevelBannerComponent = class {
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
      TopLevelBannerComponent = _classThis = _classDescriptor.value;
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
    /**
     * Unique identifier for the banner. This ID is required to ensure that
     * the state of the banner (e.g., whether it has been closed) is tracked
     * separately for different events or instances. Without a unique ID,
     * closing one banner could inadvertently hide other banners for different events.
     */
    id = input.required();
    // Optional URL link that the banner should navigate to when clicked.
    link = input();
    // Text content to be displayed in the banner.
    text = input.required();
    // Optional expiry date. Setting the default expiry as a future date so we
    // don't have to deal with undefined signal values.
    expiry = input(new Date('3000-01-01'), {transform: parseDate});
    // Whether the user has closed the banner or the survey has expired.
    hasClosed = linkedSignal(() => {
      const expired = Date.now() > this.expiry().getTime();
      // Needs to be in a try/catch, because some browsers will
      // throw when using `localStorage` in private mode.
      try {
        return this.localStorage?.getItem(this.getBannerStorageKey()) === 'true' || expired;
      } catch {
        return false;
      }
    });
    close() {
      this.localStorage?.setItem(this.getBannerStorageKey(), 'true');
      this.hasClosed.set(true);
    }
    getBannerStorageKey() {
      return `${STORAGE_KEY_PREFIX}${this.id()}`;
    }
  };
  return (TopLevelBannerComponent = _classThis);
})();
export {TopLevelBannerComponent};
const parseDate = (inputDate) => {
  if (inputDate instanceof Date) {
    return inputDate;
  }
  const outputDate = new Date(inputDate);
  if (isNaN(outputDate.getTime())) {
    throw new Error(`Invalid date string: ${inputDate}`);
  }
  return outputDate;
};
//# sourceMappingURL=top-level-banner.component.js.map
