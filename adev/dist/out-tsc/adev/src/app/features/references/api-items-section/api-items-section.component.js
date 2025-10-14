/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {ChangeDetectionStrategy, Component, input} from '@angular/core';
import {RouterLink} from '@angular/router';
import ApiItemLabel from '../api-item-label/api-item-label.component';
import {MatTooltipModule} from '@angular/material/tooltip';
let ApiItemsSection = (() => {
  let _classDecorators = [
    Component({
      selector: 'adev-api-items-section',
      imports: [ApiItemLabel, RouterLink, MatTooltipModule],
      templateUrl: './api-items-section.component.html',
      styleUrls: ['./api-items-section.component.scss'],
      changeDetection: ChangeDetectionStrategy.OnPush,
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var ApiItemsSection = class {
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
      ApiItemsSection = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    group = input.required();
  };
  return (ApiItemsSection = _classThis);
})();
export default ApiItemsSection;
//# sourceMappingURL=api-items-section.component.js.map
