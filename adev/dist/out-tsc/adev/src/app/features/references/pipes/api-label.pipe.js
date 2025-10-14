/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {Pipe} from '@angular/core';
import {ApiItemType} from '../interfaces/api-item-type';
let ApiLabel = (() => {
  let _classDecorators = [
    Pipe({
      name: 'adevApiLabel',
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var ApiLabel = class {
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
      ApiLabel = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    transform(value, labelType) {
      return labelType === 'full' ? fullLabelsMap[value] : shortLabelsMap[value];
    }
  };
  return (ApiLabel = _classThis);
})();
export {ApiLabel};
export const shortLabelsMap = {
  [ApiItemType.BLOCK]: 'B',
  [ApiItemType.CLASS]: 'C',
  [ApiItemType.CONST]: 'K',
  [ApiItemType.DECORATOR]: '@',
  [ApiItemType.DIRECTIVE]: 'D',
  [ApiItemType.ELEMENT]: 'El',
  [ApiItemType.ENUM]: 'E',
  [ApiItemType.FUNCTION]: 'F',
  [ApiItemType.INTERFACE]: 'I',
  [ApiItemType.PIPE]: 'P',
  [ApiItemType.NG_MODULE]: 'M',
  [ApiItemType.TYPE_ALIAS]: 'T',
  [ApiItemType.INITIALIZER_API_FUNCTION]: 'IA',
};
export const fullLabelsMap = {
  [ApiItemType.BLOCK]: 'Block',
  [ApiItemType.CLASS]: 'Class',
  [ApiItemType.CONST]: 'Const',
  [ApiItemType.DECORATOR]: 'Decorator',
  [ApiItemType.DIRECTIVE]: 'Directive',
  [ApiItemType.ELEMENT]: 'Element',
  [ApiItemType.ENUM]: 'Enum',
  [ApiItemType.FUNCTION]: 'Function',
  [ApiItemType.INTERFACE]: 'Interface',
  [ApiItemType.PIPE]: 'Pipe',
  [ApiItemType.NG_MODULE]: 'Module',
  [ApiItemType.TYPE_ALIAS]: 'Type Alias',
  [ApiItemType.INITIALIZER_API_FUNCTION]: 'Initializer API',
};
//# sourceMappingURL=api-label.pipe.js.map
