/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Pipe, PipeTransform} from '@angular/core';
import {invalidPipeArgumentError} from './invalid_pipe_argument_error';

/**
 * @ngModule CommonModule
 * @description
 *
 * A generic selector that displays the string that matches the current value.
 *
 * @usageNotes
 *
 * The following example uses the pipe to select an appropriate gender-specific translation.
 * The mapping object associates gender keys with strings to be selected, and includes a
 * default mapping option.
 *
 * {@example common/pipes/ts/i18n_pipe.ts region='I18nSelectPipeComponent'}
 *
 * @see [Transforming data with pipes](guide/pipes)
 * @see [Internationalization](guide/i18n) guide
 *
 * @publicApi
 */
@Pipe({name: 'i18nSelect', pure: true})
export class I18nSelectPipe implements PipeTransform {
  /**
   * @param value A value used to be select a translation.
   * @param mapping An object that maps a value key to a translation string.
   * If none of the keys match the `value`, then the content
   * of a key named `other` is returned when present; otherwise returns an empty string.
   */
  transform(value: string|null|undefined, mapping: {[key: string]: string}): string {
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
}
