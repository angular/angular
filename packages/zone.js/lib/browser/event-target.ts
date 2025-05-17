/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

export function eventTargetPatch(_global: any, api: _ZonePrivate) {
  if ((Zone as any)[api.symbol('patchEventTarget')]) {
    // EventTarget is already patched.
    return;
  }
  const {eventNames, zoneSymbolEventNames, TRUE_STR, FALSE_STR, ZONE_SYMBOL_PREFIX} =
    api.getGlobalObjects()!;
  // Predefine all zone symbol event name mappings for both `capture = false` and `true`.
  // This avoids recomputing symbol strings at runtime and improves performance.
  for (const eventName of eventNames) {
    const falseEventName = eventName + FALSE_STR;
    const trueEventName = eventName + TRUE_STR;
    const symbol = ZONE_SYMBOL_PREFIX + falseEventName;
    const symbolCapture = ZONE_SYMBOL_PREFIX + trueEventName;
    zoneSymbolEventNames[eventName] = {[FALSE_STR]: symbol, [TRUE_STR]: symbolCapture};
  }

  const EventTarget = _global['EventTarget'];
  if (!EventTarget?.prototype) {
    return;
  }
  api.patchEventTarget(_global, api, [EventTarget.prototype]);

  return true;
}

export function patchEvent(global: any, api: _ZonePrivate) {
  api.patchEventPrototype(global, api);
}
