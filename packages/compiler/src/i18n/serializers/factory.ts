/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {I18nVersion} from '@angular/core';
import {Serializer} from './serializer';
import {Xliff} from './xliff';
import {Xliff2} from './xliff2';
import {Xmb} from './xmb';
import {Xtb} from './xtb';

export function createSerializer(format: string, version: I18nVersion): Serializer {
  switch (format) {
    case 'xmb':
      return new Xmb(version);
    case 'xtb':
      return new Xtb(version);
    case 'xliff2':
    case 'xlf2':
      return new Xliff2(version);
    case 'xliff':
    case 'xlf':
    default:
      return new Xliff(version);
  }
}
