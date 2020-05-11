/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgDevConfig} from '../utils/config';

interface Formatter {
  matchers: string[];
}

export interface Format {
  [keyof: string]: boolean|Formatter;
}

export const FORMAT = {
  validator: isFormatConfig,
};

/** Validate the configuration correctly provides format information. */
export function isFormatConfig(
    config: any, errors: string[]): config is NgDevConfig<{format: Format}> {
  const formatConfig: Partial<Format> = config.format;

  if (formatConfig === undefined) {
    errors.push(`No configuration defined for "format"`);
    return;
  }

  for (const [key, value] of Object.entries(formatConfig)) {
    switch (typeof value) {
      case 'boolean':
        break;
      case 'object':
        isFormatterConfig(key, value, errors);
        break;
      default:
        errors.push(`"format.${key}" is not a boolean or Formatter object`);
    }
  }
  return;
}

/** Validate an individual Formatter config. */
function isFormatterConfig(key: string, config: Partial<Formatter>, errors: string[]) {
  if (config.matchers === undefined) {
    errors.push(`Missing "format.${key}.matchers" value`);
  }
}
