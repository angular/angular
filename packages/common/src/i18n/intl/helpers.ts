/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ɵRuntimeError as RuntimeError} from '@angular/core';
import {RuntimeErrorCode} from '../../errors';

// See the digitsInfo parameter of https://angular.dev/api/common/formatNumber
const DIGITS_INFO_REGEX = /^(\d+)?\.((\d+)(-(\d+))?)?$/;

export function parseDigitInfo(digitsInfo: undefined | string): {
  minimumIntegerDigits: number | undefined;
  minimumFractionDigits: number | undefined;
  maximumFractionDigits: number | undefined;
};
export function parseDigitInfo(
  digitsInfo: undefined | string,
  minimumIntegerDigits: number,
  minimumFractionDigits: number,
  maximumFractionDigits: number,
): {
  minimumIntegerDigits: number;
  minimumFractionDigits: number;
  maximumFractionDigits: number;
};
export function parseDigitInfo(
  digitsInfo: undefined | string,
  minimumIntegerDigits?: number,
  minimumFractionDigits?: number,
  maximumFractionDigits?: number,
) {
  if (digitsInfo) {
    const parts = digitsInfo.match(DIGITS_INFO_REGEX);
    if (parts === null) {
      // TODO: create a runtime error
      throw new Error(`${digitsInfo} is not a valid digit info`);
    }
    const minIntPart = parts[1];
    const minFractionPart = parts[3];
    const maxFractionPart = parts[5];
    if (minIntPart != null) {
      minimumIntegerDigits = parseIntAutoRadix(minIntPart);
    }
    if (minFractionPart != null) {
      minimumFractionDigits = parseIntAutoRadix(minFractionPart);
    }
    if (maxFractionPart != null) {
      maximumFractionDigits = parseIntAutoRadix(maxFractionPart);
    } else if (
      minFractionPart != null &&
      minimumFractionDigits != null &&
      maximumFractionDigits != null &&
      minimumFractionDigits > maximumFractionDigits
    ) {
      maximumFractionDigits = minimumFractionDigits;
    }
  }

  return {
    // Intl minimumIntegerDigits bounds are 1...21, the angular DigitsInfo allows 0
    minimumIntegerDigits: minimumIntegerDigits === 0 ? 1 : minimumIntegerDigits,
    minimumFractionDigits: minimumFractionDigits,
    maximumFractionDigits: maximumFractionDigits,
  };
}

function parseIntAutoRadix(text: string): number {
  const result: number = parseInt(text);
  if (isNaN(result)) {
    throw new RuntimeError(
      RuntimeErrorCode.INVALID_INTEGER_LITERAL,
      ngDevMode && 'Invalid integer literal when parsing ' + text,
    );
  }
  return result;
}

export function normalizeLocale(locale: string): string {
  return locale.toLowerCase().replace(/_/g, '-');
}
