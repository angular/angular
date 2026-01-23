/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {patchPromise} from '../common/promise';
import {patchToString} from '../common/to-string';
import {loadZone} from '../zone';
import {ZoneType} from '../zone-impl';

import {patchNode} from './node';

export function rollupMain(): ZoneType {
  const Zone = loadZone();

  patchNode(Zone); // Node needs to come first.
  patchPromise(Zone);
  patchToString(Zone);

  return Zone;
}
