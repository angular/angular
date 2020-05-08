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
  configKey: 'format',
  validator,
};

/** Validate the configuration correctly provides format information. */
export function validator(config: any, errors: string[]): config is NgDevConfig<{format: Format}> {
  const formatConfig: Partial<Format> = config.format;
  const localErrors: string[] = [];
  for (const [key, value] of Object.entries(formatConfig)) {
    switch (typeof value) {
      case 'boolean':
        break;
      case 'object':
        validateFormatterConfig(key, value, localErrors);
        break;
      default:
        localErrors.push(`"format.${key}" is not a boolean or Formatter object`);
    }
  }
  errors.push(...localErrors);
  return localErrors.length === 0;
}

/** Validate an individual Formatter config. */
function validateFormatterConfig(key: string, config: Partial<Formatter>, errors: string[]) {
  if (config.matchers === undefined) {
    errors.push(`Missing "format.${key}.matchers" value`);
  }
}
