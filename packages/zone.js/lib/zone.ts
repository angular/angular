/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {initZone, Zone as _Zone, ZoneType} from './zone-impl';

declare global {
  const Zone: ZoneType;
  type Zone = _Zone;
}

(globalThis as any)['Zone'] = initZone();
