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

export function getActiveFormatters() {
  const config = getAngularDevConfig<'format', FormatConfig>().format || {};
  return [new Buildifier(config), new ClangFormat(config)].filter(
      formatter => formatter.isEnabled());
}

export {Formatter} from './base-formatter';
