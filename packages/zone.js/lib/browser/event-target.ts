/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CAPTURE_STR, PASSVE_STR} from '../common/utils';

export function eventTargetPatch(_global: any, api: _ZonePrivate) {
  if ((Zone as any)[api.symbol('patchEventTarget')]) {
    // EventTarget is already patched.
    return;
  }
  const {eventNames, zoneSymbolEventNames, TRUE_STR, FALSE_STR, ZONE_SYMBOL_PREFIX} =
      api.getGlobalObjects()!;
  //  predefine all __zone_symbol__ + eventName + true/false string
  for (let i = 0; i < eventNames.length; i++) {
    const eventName = eventNames[i];
    const falseCaptureFalsePassiveName = `${FALSE_STR}${CAPTURE_STR}${FALSE_STR}${PASSVE_STR}`;
    const falseCaptureTruePassiveName = `${FALSE_STR}${CAPTURE_STR}${TRUE_STR}${PASSVE_STR}`;
    const trueCaptureFalsePassiveName = `${TRUE_STR}${CAPTURE_STR}${FALSE_STR}${PASSVE_STR}`;
    const trueCaptureTruePassiveName = `${TRUE_STR}${CAPTURE_STR}${TRUE_STR}${PASSVE_STR}`;
    zoneSymbolEventNames[eventName] = {};
    zoneSymbolEventNames[eventName][falseCaptureFalsePassiveName] =
        `${ZONE_SYMBOL_PREFIX}${eventName}${falseCaptureFalsePassiveName}`;
    zoneSymbolEventNames[eventName][falseCaptureTruePassiveName] =
        `${ZONE_SYMBOL_PREFIX}${eventName}${falseCaptureTruePassiveName}`;
    zoneSymbolEventNames[eventName][trueCaptureFalsePassiveName] =
        `${ZONE_SYMBOL_PREFIX}${eventName}${trueCaptureFalsePassiveName}`;
    zoneSymbolEventNames[eventName][trueCaptureTruePassiveName] =
        `${ZONE_SYMBOL_PREFIX}${eventName}${trueCaptureTruePassiveName}`;
  }

  const EVENT_TARGET = _global['EventTarget'];
  if (!EVENT_TARGET || !EVENT_TARGET.prototype) {
    return;
  }
  api.patchEventTarget(_global, api, [EVENT_TARGET && EVENT_TARGET.prototype]);

  return true;
}

export function patchEvent(global: any, api: _ZonePrivate) {
  api.patchEventPrototype(global, api);
}
