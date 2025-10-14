/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {ChangeDetectionStrategy, Component, computed, input} from '@angular/core';
import {shortLabelsMap} from '../pipes/api-label.pipe';
let ApiItemLabel = (() => {
  let _classDecorators = [
    Component({
      selector: 'docs-api-item-label',
      changeDetection: ChangeDetectionStrategy.OnPush,
      host: {
        '[class]': `clazz()`,
      },
      template: `{{ label() }}`,
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var ApiItemLabel = class {
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
      ApiItemLabel = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    type = input.required();
    label = computed(() => shortLabelsMap[this.type()]);
    clazz = computed(() => `type-${this.type()}`);
  };
  return (ApiItemLabel = _classThis);
})();
export default ApiItemLabel;
//# sourceMappingURL=api-item-label.component.js.map
