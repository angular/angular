/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {useDateIntlFormatting, useDateLegacyFormatting} from './format_date';
import {useNumberIntlImplementation, useNumberLegacyImplementation} from './format_number';
import {
  ɵusePluralIntlImplementation as usePluralIntlImplementation,
  ɵusePluralLegacyImplementation as usePluralLegacyImplementation,
} from '@angular/core';

/**
 * @publicApi
 */
export const useIntlImplementation = () => {
  useNumberIntlImplementation();
  usePluralIntlImplementation();
  useDateIntlFormatting();
};

/**
 * @publicApi
 */
export const useLegacyImplementation = () => {
  useNumberLegacyImplementation();
  usePluralLegacyImplementation();
  useDateLegacyFormatting();
};
