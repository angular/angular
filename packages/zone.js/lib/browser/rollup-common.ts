/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {patchPromise} from '../common/promise';
import {patchToString} from '../common/to-string';
import {ZoneType} from '../zone-impl';

import {patchUtil} from './api-util';

export function patchCommon(Zone: ZoneType): void {
  patchPromise(Zone);
  patchToString(Zone);
  patchUtil(Zone);
}
