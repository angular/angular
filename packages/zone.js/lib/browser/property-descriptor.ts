/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * @fileoverview
 * @suppress {globalThis}
 */

import {isBrowser, isIE, isMix, isNode, ObjectGetPrototypeOf, patchOnProperties} from '../common/utils';

export interface IgnoreProperty {
  target: any;
  ignoreProperties: string[];
}

export function filterProperties(
    target: any, onProperties: string[], ignoreProperties: IgnoreProperty[]): string[] {
  if (!ignoreProperties || ignoreProperties.length === 0) {
    return onProperties;
  }

  const tip: IgnoreProperty[] = ignoreProperties.filter(ip => ip.target === target);
  if (!tip || tip.length === 0) {
    return onProperties;
  }

  const targetIgnoreProperties: string[] = tip[0].ignoreProperties;
  return onProperties.filter(op => targetIgnoreProperties.indexOf(op) === -1);
}

export function patchFilteredProperties(
    target: any, onProperties: string[], ignoreProperties: IgnoreProperty[], prototype?: any) {
  // check whether target is available, sometimes target will be undefined
  // because different browser or some 3rd party plugin.
  if (!target) {
    return;
  }
  const filteredProperties: string[] = filterProperties(target, onProperties, ignoreProperties);
  patchOnProperties(target, filteredProperties, prototype);
}

/**
 * Get all event name properties which the event name startsWith `on`
 * from the target object itself, inherited properties are not considered.
 */
export function getOnEventNames(target: Object) {
  return Object.getOwnPropertyNames(target)
      .filter(name => name.startsWith('on') && name.length > 2)
      .map(name => name.substring(2));
}

export function propertyDescriptorPatch(api: _ZonePrivate, _global: any) {
  if (isNode && !isMix) {
    return;
  }
  if ((Zone as any)[api.symbol('patchEvents')]) {
    // events are already been patched by legacy patch.
    return;
  }
  const ignoreProperties: IgnoreProperty[] = _global['__Zone_ignore_on_properties'];
  // for browsers that we can patch the descriptor:  Chrome & Firefox
  let patchTargets: string[] = [];
  if (isBrowser) {
    const internalWindow: any = window;
    patchTargets = patchTargets.concat([
      'Document', 'SVGElement', 'Element', 'HTMLElement', 'HTMLBodyElement', 'HTMLMediaElement',
      'HTMLFrameSetElement', 'HTMLFrameElement', 'HTMLIFrameElement', 'HTMLMarqueeElement', 'Worker'
    ]);
    const ignoreErrorProperties =
        isIE() ? [{target: internalWindow, ignoreProperties: ['error']}] : [];
    // in IE/Edge, onProp not exist in window object, but in WindowPrototype
    // so we need to pass WindowPrototype to check onProp exist or not
    patchFilteredProperties(
        internalWindow, getOnEventNames(internalWindow),
        ignoreProperties ? ignoreProperties.concat(ignoreErrorProperties) : ignoreProperties,
        ObjectGetPrototypeOf(internalWindow));
  }
  patchTargets = patchTargets.concat([
    'XMLHttpRequest', 'XMLHttpRequestEventTarget', 'IDBIndex', 'IDBRequest', 'IDBOpenDBRequest',
    'IDBDatabase', 'IDBTransaction', 'IDBCursor', 'WebSocket'
  ]);
  for (let i = 0; i < patchTargets.length; i++) {
    const target = _global[patchTargets[i]];
    target && target.prototype &&
        patchFilteredProperties(
            target.prototype, getOnEventNames(target.prototype), ignoreProperties);
  }
}
