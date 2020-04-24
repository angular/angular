/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {getAngularDevConfig} from '../../utils/config';
import {FormatConfig} from '../config';

import {Buildifier} from './buildifier';
import {ClangFormat} from './clang-format';

/**
 * Get all defined formatters which are active based on the current loaded config.
 */
export function getActiveFormatters() {
  let config = {};
  try {
    config = getAngularDevConfig<'format', FormatConfig>().format || {};
  } catch {
  }
  return [new Buildifier(config), new ClangFormat(config)].filter(
      formatter => formatter.isEnabled());
}

// Rexport symbols used for types elsewhere.
export {Formatter, FormatterAction} from './base-formatter';
