/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/*
 * Type definitions of the "ProxyZone" implementation provided by the
 * ZoneJS testing bundles. These types are not part of the default ZoneJS
 * typings, so we need to replicate them here. Usually they would go into
 * the "zone-types.d.ts" file where other types are brought in as well, but
 * since internally in Google, the original zone.js types will be used, there
 * needs to be a separation of types which are replicated or the ones that can
 * be pulled in from the original type definitions.
 */

import {HasTaskState, Zone, ZoneDelegate} from './zone-types';

export interface ProxyZoneStatic {
  assertPresent: () => ProxyZone;
  get(): ProxyZone;
}

export interface ProxyZone {
  lastTaskState: HasTaskState|null;
  setDelegate(spec: ZoneSpec): void;
  getDelegate(): ZoneSpec;
  onHasTask(delegate: ZoneDelegate, current: Zone, target: Zone, hasTaskState: HasTaskState): void;
}
