/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
var I18nSelectPipe_1;
import {__decorate} from 'tslib';
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
let I18nSelectPipe = (I18nSelectPipe_1 = class I18nSelectPipe {
  /**
   * @param value a string to be internationalized.
   * @param mapping an object that indicates the text that should be displayed
   * for different values of the provided `value`.
   */
  transform(value, mapping) {
    if (value == null) return '';
    if (typeof mapping !== 'object' || typeof value !== 'string') {
      throw invalidPipeArgumentError(I18nSelectPipe_1, mapping);
    }
    if (mapping.hasOwnProperty(value)) {
      return mapping[value];
    }
    if (mapping.hasOwnProperty('other')) {
      return mapping['other'];
    }
    return '';
  }
});
I18nSelectPipe = I18nSelectPipe_1 = __decorate(
  [
    Pipe({
      name: 'i18nSelect',
    }),
  ],
  I18nSelectPipe,
);
export {I18nSelectPipe};
//# sourceMappingURL=i18n_select_pipe.js.map
