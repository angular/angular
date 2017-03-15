/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {TemplateInfo} from './common';
import {locateSymbol} from './locate_symbol';
import {Definition} from './types';

export function getDefinition(info: TemplateInfo): Definition {
  const result = locateSymbol(info);
  return result && result.symbol.definition;
}
