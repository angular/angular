/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {Pipe} from '@angular/core';
import {invalidPipeArgumentError} from './invalid_pipe_argument_error';
/**
 * @ngModule CommonModule
 * @description
 *
 * Generic selector that displays the string that matches the current value.
 *
 * If none of the keys of the `mapping` match the `value`, then the content
 * of the `other` key is returned when present, otherwise an empty string is returned.
 *
 * @usageNotes
 *
 * ### Example
 *
 * {@example common/pipes/ts/i18n_pipe.ts region='I18nSelectPipeComponent'}
 *
 * @publicApi
 */
let I18nSelectPipe = (() => {
  let _classDecorators = [
    Pipe({
      name: 'i18nSelect',
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var I18nSelectPipe = class {
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
      I18nSelectPipe = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    /**
     * @param value a string to be internationalized.
     * @param mapping an object that indicates the text that should be displayed
     * for different values of the provided `value`.
     */
    transform(value, mapping) {
      if (value == null) return '';
      if (typeof mapping !== 'object' || typeof value !== 'string') {
        throw invalidPipeArgumentError(I18nSelectPipe, mapping);
      }
      if (mapping.hasOwnProperty(value)) {
        return mapping[value];
      }
      if (mapping.hasOwnProperty('other')) {
        return mapping['other'];
      }
      return '';
    }
  };
  return (I18nSelectPipe = _classThis);
})();
export {I18nSelectPipe};
//# sourceMappingURL=i18n_select_pipe.js.map
