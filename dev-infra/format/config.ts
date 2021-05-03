/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {assertNoErrors, getConfig, NgDevConfig} from '../utils/config';

interface Formatter {
  matchers: string[];
}

export interface FormatConfig {
  [keyof: string]: boolean|Formatter;
}

/** Retrieve and validate the config as `FormatConfig`. */
export function getFormatConfig() {
  // List of errors encountered validating the config.
  const errors: string[] = [];
  // The unvalidated config object.
  const config: Partial<NgDevConfig<{format: FormatConfig}>> = getConfig();

  if (config.format === undefined) {
    errors.push(`No configuration defined for "format"`);
  }

  for (const [key, value] of Object.entries(config.format!)) {
    switch (typeof value) {
      case 'boolean':
        break;
      case 'object':
        checkFormatterConfig(key, value, errors);
        break;
      default:
        errors.push(`"format.${key}" is not a boolean or Formatter object`);
    }
  }

  assertNoErrors(errors);
  return config as Required<typeof config>;
}

/** Validate an individual Formatter config. */
function checkFormatterConfig(key: string, config: Partial<Formatter>, errors: string[]) {
  if (config.matchers === undefined) {
    errors.push(`Missing "format.${key}.matchers" value`);
  }
}
